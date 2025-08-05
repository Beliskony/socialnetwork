import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { toggleLike, toggleLikePostAsync, updatePostAsync } from '@/redux/postSlice';
import { selectCurrentUser } from '@/redux/userSlice';
import { addCommentAsync, fetchCommentsByPostAsync } from '@/redux/commentSlice';
import VideoPlayerItem from './VideoPlayerItem';
import MediaSlider from './MediaSlider';

type Comment = {
  _id: string;
  user: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  content: string;
  createdAt: string;
  updatedAt: string;
};

type Media = {
  images?: string[];
  videos?: string[];
};

type Post = {
  _id: string;
  user: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  text?: string;
  createdAt: string;
  likes?: string[];
  comments: Comment[];
  media?: Media;
};

type PostItemProps = {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onEdit: (postId: string) => void;
  onDelete: (postId: string) => void;
};

const PostItem: React.FC<PostItemProps> = ({
  post,
  onComment,
  onEdit,
  onDelete,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [likes, setLikes] = useState<string[]>(post.likes || []);
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [editedText] = useState(post.text || '');
  const [editedImages] = useState<string[]>(post.media?.images || []);
  const [editedVideos] = useState<string[]>(post.media?.videos || []);

  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch<AppDispatch>();

  if (!post || !post._id || !currentUser || !currentUser._id) return null;

  const postUser = post.user || {
    _id: currentUser._id,
    username: currentUser.username,
    profilePicture: currentUser.profilePicture,
  };

  const isAuthor = postUser._id === currentUser._id;

  // ✅ Fetch des commentaires à l'ouverture
  useEffect(() => {
      dispatch(fetchCommentsByPostAsync({ postId: post._id }))
        .unwrap()
        .then((fetchedComments) => {
          setLocalComments(fetchedComments);
        })
        .catch((err) => {
          console.error("Erreur lors de la récupération des commentaires :", err);
        });
    }
  , [ post._id, dispatch]);

  // ✅ Liker un post
  const handleLike = async (postId: string, userId: string) => {
    const alreadyLiked = likes.includes(userId);
    setLikes(prev =>
      alreadyLiked ? prev.filter(id => id !== userId) : [...prev, userId]
    );
    try {
      const result = await dispatch(toggleLikePostAsync({ postId })).unwrap();
      if (result.liked !== !alreadyLiked) {
        setLikes(prev =>
          alreadyLiked ? [...prev, userId] : prev.filter(id => id !== userId)
        );
      } else {
        dispatch(toggleLike({ postId, userId }));
      }
    } catch (error) {
      console.error('Erreur lors du like:', error);
      setLikes(prev =>
        alreadyLiked ? [...prev, userId] : prev.filter(id => id !== userId)
      );
    }
  };

  // ✅ Ajouter un commentaire
  const handleCommentSubmit = async () => {
    const trimmed = commentInput.trim();
    if (!trimmed) return;
    try {
      const result = await dispatch(addCommentAsync({ postId: post._id, content: trimmed })).unwrap();
      const userObj = typeof result.user === 'object' && result.user !== null
        ? result.user
        : {
            _id: currentUser._id,
            username: currentUser.username,
            profilePicture: currentUser.profilePicture,
          };
      const commentWithUserObj: Comment = { ...result, user: userObj };
      setLocalComments(prev => [commentWithUserObj, ...prev]);
      setCommentInput('');
    } catch (error) {
      Alert.alert('Erreur', "Une erreur est survenue lors de l'ajout du commentaire");
    }
  };

  const handleUpdatePost = async () => {
    if (!currentUser || !post.text || !post.media) return;
    try {
      await dispatch(updatePostAsync({
        postId: post._id,
        data: {
          text: editedText,
          media: {
            images: editedImages,
            videos: editedVideos,
          },
        },
      })).unwrap();
      setShowMediaModal(false);
    } catch (error) {
      Alert.alert('Erreur, mise à jour échouée');
    }
  };

  const handleDelete = () => {
    Alert.alert('Suppression', 'Voulez-vous vraiment supprimer cette publication ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => onDelete(post._id) },
    ]);
  };

  const openImage = (image: string) => {
    setSelectedImage(image);
    setShowMediaModal(true);
  };

  const openVideo = (video: string) => {
    setSelectedVideo(video);
    setShowMediaModal(true);
  };

  const closeMediaModal = () => {
    setSelectedImage(null);
    setSelectedVideo(null);
    setShowMediaModal(false);
  };

  const isLiked = currentUser._id ? likes.includes(currentUser._id) : false;

  return (
    <View className=" flex w-full border border-gray-200 rounded-xl mb-1 gap-y-2 justify-center items-center bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-around px-2 py-1">
        <View className="w-full flex-row items-center">
          {postUser.profilePicture && (
            <Image
              source={{ uri: postUser.profilePicture }}
              className="w-10 h-10 rounded-full mr-2 object-contain"
            />
          )}
          <View>
            <Text className="font-bold">{postUser.username}</Text>
            <Text className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</Text>
          </View>
        </View>
        {isAuthor && (
          <TouchableOpacity onPress={() => setShowOptions(!showOptions)}>
            <Image source={require('../../assets/images/option.png')} style={{ width: 20, height: 20 }} />
          </TouchableOpacity>
        )}
      </View>

      {showOptions && isAuthor && (
        <View className="absolute right-4 top-14 bg-white border border-gray-200 rounded shadow z-10">
          <TouchableOpacity onPress={() => { setShowOptions(false); handleUpdatePost(); }}>
            <Text className="px-4 py-2 text-base">Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setShowOptions(false); handleDelete(); }}>
            <Text className="px-4 py-2 text-base text-red-600">Supprimer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Media */}
      {(post.media?.images?.length || post.media?.videos?.length) && (
        <MediaSlider post={post} openImage={openImage} openVideo={openVideo} />
      )}

      {/* Actions */}
      <View className="flex flex-row items-center gap-x-10 justify-around">
        <TouchableOpacity onPress={() => handleLike(post._id, currentUser._id)} className="flex-row items-center">
          <Image
            source={isLiked ? require('@/assets/images/redHeart.png') : require('@/assets/images/heartOutline.png')}
            style={{ width: 25, height: 25 }}
          />
          <Text className="ml-1 text-lg">{likes.length}</Text>
        </TouchableOpacity>

        {/* ✅ Compteur de commentaires mis à jour dynamiquement */}
        <TouchableOpacity onPress={() => setShowComments(!showComments)} className="flex flex-row gap-x-1">
          <Image source={require('@/assets/images/comment.png')} style={{ width: 22, height: 22 }} />
          <Text className="ml-1 text-lg">({localComments.length})</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowComments(!showComments)} className="flex-row items-center">
          <Image source={require('@/assets/images/share.png')} style={{ width: 22, height: 22 }} />
        </TouchableOpacity>
      </View>

      {/* Comments Section */}
      {showComments && (
        <ScrollView className="mt-4 w-full max-h-80">
          <View className="flex-row items-center mb-2">
            <TextInput
              value={commentInput}
              onChangeText={setCommentInput}
              placeholder="Ajouter un commentaire..."
              className="flex-1 px-3 py-2 rounded border border-gray-300 mr-2"
            />
            <TouchableOpacity onPress={handleCommentSubmit} className="px-4 py-2 rounded bg-[#F1895C]">
              <Text className="text-white">Publier</Text>
            </TouchableOpacity>
          </View>

          {localComments.map((comment) => {
            const commentUser = comment.user || {
              _id: 'unknown',
              username: 'Utilisateur inconnu',
              profilePicture: undefined,
            };

            return (
              <View key={comment._id} className="mb-2 p-2 gap-3 bg-gray-100 rounded">
                <View className="flex flex-row gap-x-3 justify-start items-center">
                  {commentUser.profilePicture && (
                    <Image
                      className="w-10 h-10 rounded-full object-contain"
                      source={{ uri: commentUser.profilePicture }}
                    />
                  )}
                  <View className="flex flex-col justify-around items-center text-left">
                    <Text className="font-bold text-sm">{commentUser.username}</Text>
                    <Text className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</Text>
                  </View>
                </View>
                <View className="bg-white w-full rounded-lg min-h-14 justify-center">
                  <Text className="text-sm mx-6">{comment.content}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

export default PostItem;
