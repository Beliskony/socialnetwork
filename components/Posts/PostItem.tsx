import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { toggleLikePostAsync } from '@/redux/postSlice';
import { selectCurrentUser } from '@/redux/userSlice';
import { addCommentAsync, fetchCommentsByPostAsync } from '@/redux/commentSlice';
import { updatePostAsync, deletePostAsync } from '@/redux/postSlice';
import MediaSlider from './MediaSlider';

// Types
type User = {
  _id: string;
  username: string;
  profilePicture?: string;
};

type Comment = {
  _id: string;
  user: User;
  content: string;
  createdAt: string;
};

type Media = {
  images?: string[];
  videos?: string[];
};

type Post = {
  _id: string;
  user: User;
  text?: string;
  createdAt: string;
  likes?: string[];
  comments?: Comment[];
  media?: Media;
};

type PostItemProps = {
  post: Post;
  onDelete: (postId: string) => void;
  onLike?: (postId: string) => void | Promise<void>;
  onComment?: (postId: string, comment: string) => void | Promise<void>;
  onEdit?: (postId: string) => void;
};

const PostItem: React.FC<PostItemProps> = ({ post, onDelete }) => {
  const [likes, setLikes] = useState<string[]>(post.likes || []);
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [commentInput, setCommentInput] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.text || '');
  const [showOptions, setShowOptions] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch<AppDispatch>();

  // Fetch comments
  useEffect(() => {
    dispatch(fetchCommentsByPostAsync({ postId: post._id }))
      .unwrap()
      .then((fetchedComments: Comment[]) => setComments(fetchedComments))
      .catch(console.error);
  }, [dispatch, post._id]);

  // Like logic
  const handleLike = async () => {
    if (!currentUser) return;
    const alreadyLiked = likes.includes(currentUser._id);
    setLikes(prev => alreadyLiked ? prev.filter(id => id !== currentUser._id) : [...prev, currentUser._id]);
    try {
      await dispatch(toggleLikePostAsync({ postId: post._id })).unwrap();
    } catch {
      setLikes(prev => alreadyLiked ? [...prev, currentUser._id] : prev.filter(id => id !== currentUser._id));
    }
  };

  // Comment logic
  const handleCommentSubmit = async () => {
    const trimmed = commentInput.trim();
    if (!trimmed) return;
    try {
      const result: Comment = await dispatch(addCommentAsync({ postId: post._id, content: trimmed })).unwrap();
      setComments(prev => [result, ...prev]);
      setCommentInput('');
    } catch {
      Alert.alert('Erreur', 'Impossible d’ajouter le commentaire.');
    }
  };

  // Edit logic
  const handleEditSubmit = async () => {
    if (!editText.trim()) return;
    try {
      await dispatch(updatePostAsync({ postId: post._id, data: { text: editText } })).unwrap();
      setEditing(false);
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de modifier le post.');
    }
  };

  //Delete Logic 
  const handleDelete = () => {
    if (deleting) return;
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer ce post ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: async () => {
          try{
            setDeleting(true);
            await dispatch(deletePostAsync(post._id)).unwrap();
            onDelete(post._id);
          } catch (error){
            Alert.alert('Erreur', 'Impossible de supprimer le post.');
          } finally {
            setDeleting(false);
          }
        } },
      ]
    );
  }

  const isLiked = currentUser ? likes.includes(currentUser._id) : false;

  return (
    <View className="bg-white rounded-xl shadow p-4 mb-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Image source={{ uri: post.user.profilePicture }} className="w-10 h-10 rounded-full mr-3" />
          <View>
            <Text className="font-bold">{post.user.username}</Text>
            <Text className="text-gray-500 text-xs">{new Date(post.createdAt).toLocaleString()}</Text>
          </View>
        </View>
         {currentUser?._id && (
                  <TouchableOpacity onPress={() => setShowOptions(!showOptions)}>
                    <Image source={require('../../assets/images/option.png')} style={{width:20, height:20}} />
                  </TouchableOpacity>
                )}
              </View>
              {showOptions && currentUser && (
                <View className="absolute right-4 top-14 bg-white border border-gray-200 rounded shadow z-10">
                  <TouchableOpacity onPress={() => { setShowOptions(false); handleEditSubmit() }}>
                    <Text className="px-4 py-2 text-base">Modifier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setShowOptions(false); handleDelete()  }}>
                    <Text className="px-4 py-2 text-base text-red-600">Supprimer</Text>
                  </TouchableOpacity>
                </View>
              )}

      {/* Texte / Edition */}
      {editing ? (
        <View className="mb-3">
          <TextInput
            value={editText}
            onChangeText={setEditText}
            multiline
            className="border border-gray-300 rounded p-2 text-gray-800"
          />
          <TouchableOpacity
            onPress={handleEditSubmit}
            className="bg-[#F1895C] px-4 py-2 rounded mt-2"
          >
            <Text className="text-white font-bold">Valider</Text>
          </TouchableOpacity>
        </View>
      ) : (
        post.text && <Text className="text-gray-800 mb-3">{post.text}</Text>
      )}

      {/* Media */}
      {post.media && <MediaSlider post={post} />}

      {/* Actions */}
      <View className="flex-row justify-around mt-3 mb-2">
        <TouchableOpacity onPress={handleLike} className="flex-row items-center">
          <Image
            source={isLiked ? require('@/assets/images/redHeart.png') : require('@/assets/images/heartOutline.png')}
            className="w-6 h-6"
          />
          <Text className="ml-2 text-gray-700">{likes.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowComments(!showComments)} className="flex-row items-center">
          <Image source={require('@/assets/images/comment.png')} className="w-6 h-6" />
          <Text className="ml-2 text-gray-700">{comments.length}</Text>
        </TouchableOpacity>
      </View>

      {/* Comments */}
      {showComments && (
        <View className="mt-2">
          <View className="flex-row items-center mb-2">
            <TextInput
              value={commentInput}
              onChangeText={setCommentInput}
              placeholder="Ajouter un commentaire..."
              className="flex-1 border border-gray-300 rounded px-3 py-1 mr-2"
            />
            <TouchableOpacity onPress={handleCommentSubmit} className="bg-[#F1895C] px-4 py-1 rounded">
              <Text className="text-white font-bold">Publier</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="max-h-60">
            {comments.map((c: Comment) => (
              <View key={c._id} className="flex-row items-start mb-2 bg-gray-100 rounded p-2">
                <Image source={{ uri: c.user.profilePicture }} className="w-8 h-8 rounded-full mr-2" />
                <View className="flex-1">
                  <Text className="font-bold text-sm">{c.user.username}</Text>
                  <Text className="text-gray-700 text-sm">{c.content}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default PostItem;
