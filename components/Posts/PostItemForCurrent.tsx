import React, { useState, useEffect } from 'react';
import {View, Text, Image, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { toggleLike, toggleLikePostAsync, updatePostAsync } from '@/redux/postSlice';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/userSlice';
import { addCommentAsync } from '@/redux/commentSlice';
import VideoPlayerItem from './VideoPlayerItem';
import MediaSlider from './MediaSlider';


type Comment = {
  _id: string;
  user:  {
   _id: string
  username: string
  profilePicture?: string
};
  content: string;
  createdAt: string;
  updatedAt: string,
};

type Media = {
  images?: string[];
  videos?: string[];
};

type Post = {
  _id: string;
  user: {
   _id: string
  username: string
  profilePicture?: string
};
  text?: string;
  createdAt: string;
  likes?: string[];
  comments?: Comment[];
  media?: Media;
};

type PostItemProps = {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onEdit: (postId: string) => void;
  onDelete: (postId: string) => void;
};

const PostItemForCurrent: React.FC<PostItemProps> = ({
  post,
  onComment,
  onEdit,
  onDelete,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [likes, setLikes] = useState<string[]>(post.likes || []);
  const [localComments, setLocalComments] = useState<Comment[]>(post.comments || []);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [editedText] = useState(post.text || '');
  const [editedImages] = useState<string[]>(post.media?.images || []);
  const [editedVideos] = useState<string[]>(post.media?.videos || []);
  

  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch<AppDispatch>();

  if (!post || !post._id) return null; // Vérification de la validité du post
  if (!currentUser || !currentUser._id) return null; // Vérification de l'utilisateur courant


  // flashback pour user si absent (cas des posts de l'utilisateur connecté)
  const postUser = post.user || {
    _id: currentUser._id,
    username: currentUser.username,
    profilePicture: currentUser.profilePicture // URL par défaut
  };
  const isAuthor = postUser._id === currentUser._id;
  

  useEffect(() => {
    setLocalComments(post.comments || []);
    setLikes(post.likes || []);
  }, [post]);

  if (!currentUser || !currentUser._id) return null; 

  const isLiked = currentUser._id ? likes.includes(currentUser._id) : false;
  const updateLikes = isLiked ? likes.filter(id => id !== currentUser._id): [...likes, currentUser._id]
  


  //pour liker/disliker une publication
const handleLike = async (postId: string, userId: string) => {
  const alreadyLiked = likes.includes(userId);

  // Optimistic update
  setLikes(prev =>
    alreadyLiked ? prev.filter(id => id !== userId) : [...prev, userId]
  );

  try {
    const result = await dispatch(toggleLikePostAsync({ postId })).unwrap();

    if (result.liked !== !alreadyLiked) {
      // Si backend dit l'inverse, on restaure l'état précédent
      setLikes(prev =>
        alreadyLiked ? [...prev, userId] : prev.filter(id => id !== userId)
      );
    } else {
      // Mise à jour du store Redux
      dispatch(toggleLike({ postId, userId }));
    }
  } catch (error) {
    console.error('Erreur lors du like:', error);
    // Rollback en cas d'erreur
    setLikes(prev =>
      alreadyLiked ? [...prev, userId] : prev.filter(id => id !== userId)
    );
  }
};


  //pour commenter une publication
  const handleCommentSubmit = async () => {
    const trimmed = commentInput.trim();
    if (!trimmed) return;

    try {
      const result = await dispatch(addCommentAsync({ postId: post._id, content: trimmed })).unwrap();
      console.log("resultat comment", result);
      if (!result._id) {
        console.error("Le commentaire retourné n’a pas de _id :", result);
      }
      
      

      const userObj = typeof result.user === 'object' && result.user !== null ? result.user: {
      _id: currentUser._id,
      username: currentUser.username,
      profilePicture: currentUser.profilePicture }

      const commentWithUserObj: Comment = {...result, user: userObj}


       setLocalComments(prev => [commentWithUserObj, ...prev]);
       setCommentInput('');

      } catch (error) {
         Alert.alert('Erreur', "Une erreur est survenue lors de l'ajout du commentaire");
         console.log('Erreur lors du commentaire:', error);
      }
  };

  //pour modifier une publication
  const handleUpdatePost = async() => {
      if (!currentUser || !post.text || !post.media) return;

      try {
        await dispatch(updatePostAsync({postId: post._id, data: {
          text: editedText,
          media: {
            images: editedImages,
            videos: editedVideos
          }
        }
       })).unwrap();
       setShowMediaModal(false)
      } catch (error) {
        Alert.alert('Erreur, mise a jour echoue')
      }
  }



  //pour supprimer une publication
  const handleDelete = () => {
    Alert.alert('Suppression','Voulez vraiment suprimer cette publication ?',
    [
      {text: 'Annuler', style: 'cancel'},
      {text: 'supprimer', style: 'destructive', onPress: () => onDelete(post._id)}
    ] )
  }

  const openImage = (image: string) => {
    setSelectedImage(image);
    setShowMediaModal(true);
  }

  const openVideo = (video: string) => {
    setSelectedVideo(video);
    setShowMediaModal(true);
  }

  const closeMediaModal = () => {
    setSelectedImage(null);
    setSelectedVideo(null);
    setShowMediaModal(false);
  }

 
  return (
    
    <View className="w-full shadow-xl rounded-xl p-4 mb-6 gap-y-1 justify-center items-center bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-around">
        <View className="w-full flex-row items-center py-2">
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
            <Image source={require('../../assets/images/option.png')} style={{width:20, height:20}} />
          </TouchableOpacity>
        )}
      </View>
      {showOptions && isAuthor && (
        <View className="absolute right-4 top-14 bg-white border border-gray-200 rounded shadow z-10">
          <TouchableOpacity onPress={() => { setShowOptions(false); handleUpdatePost() }}>
            <Text className="px-4 py-2 text-base">Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setShowOptions(false); handleDelete();  }}>
            <Text className="px-4 py-2 text-base text-red-600">Supprimer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content (texte + médias) */}
      {(post.media?.images?.length || post.media?.videos?.length) && (
        <MediaSlider post={post} openImage={openImage} openVideo={openVideo} />
      )}


      {/* Actions */}
      <View className="flex flex-row items-center gap-x-32 justify-around">

        <TouchableOpacity onPress={() => handleLike(post._id, currentUser._id)} className="flex-row items-center">
          {isLiked ? (
            <Image source={require('@/assets/images/redHeart.png')} style={{width:28, height:28}} />
            
          ) : (
            <Image source={require('@/assets/images/heartOutline.png')} style={{width:28, height:28}} />
          )}
          <Text className="ml-1 text-lg">{likes.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowComments(!showComments)} className='flex flex-row gap-x-1'>
          <Image source={require('@/assets/images/comment.png')} style={{width:28, height:28}}/>
          <Text className="ml-1 text-lg">({post.comments?.length || 0})</Text>
        </TouchableOpacity>

      </View>

      {/* Comments */}
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
  if (!comment.user || !comment.user._id || !comment._id) return null; // Skip commentaire invalide

  return (
    <View key={comment._id || `${post._id}-temp-${Math.random()}`} className="mb-2 p-2 gap-3 bg-gray-100 rounded">
      <View className='flex flex-row gap-x-3 justify-start items-center'>
        {comment.user.profilePicture && (
          <Image
            className='w-10 h-10 rounded-full object-contain'
            source={{ uri: comment.user.profilePicture }}
          />
        )}
        <View className='flex flex-col justify-around items-center text-left'>
          <Text className="font-bold text-sm">{comment.user.username}</Text>
          <Text className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</Text>
          <Text className="text-xs text-gray-400">ID: {comment._id}</Text>
        </View>
      </View>
      <View className='bg-white w-full rounded-lg min-h-14 justify-center'>
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

export default PostItemForCurrent;