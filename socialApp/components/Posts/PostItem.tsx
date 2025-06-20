import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

type User = {
  id: string;
  name: string;
  avatarUrl?: string;
};

type Comment = {
  id: string;
  author: User;
  content: string;
  createdAt: string;
};

type Media = {
  images?: string[];
  videos?: string[];
};

type Post = {
  id: string;
  author: User;
  content?: string;
  createdAt: string;
  likes: string[];
  comments: Comment[];
  media?: Media;
};

type PostItemProps = {
  post: Post;
  currentUser: User;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onEdit: (postId: string) => void;
  onDelete: (postId: string) => void;
};

const PostItem: React.FC<PostItemProps> = ({
  post,
  currentUser,
  onLike,
  onComment,
  onEdit,
  onDelete,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');

  const isLiked = post.likes.includes(currentUser.id);
  const isAuthor = post.author.id === currentUser.id;

  const handleCommentSubmit = () => {
    if (commentInput.trim()) {
      onComment(post.id, commentInput.trim());
      setCommentInput('');
    }
  };

  return (
    <View className="border border-gray-200 rounded-xl p-4 mb-6 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          {post.author.avatarUrl && (
            <Image
              source={{ uri: post.author.avatarUrl }}
              className="w-10 h-10 rounded-full mr-2"
            />
          )}
          <View>
            <Text className="font-bold">{post.author.name}</Text>
            <Text className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</Text>
          </View>
        </View>
        {isAuthor && (
          <TouchableOpacity onPress={() => setShowOptions(!showOptions)}>
            <FontAwesome name="ellipsis-v" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>
      {showOptions && isAuthor && (
        <View className="absolute right-4 top-14 bg-white border border-gray-200 rounded shadow z-10">
          <TouchableOpacity onPress={() => { setShowOptions(false); onEdit(post.id); }}>
            <Text className="px-4 py-2 text-base">Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setShowOptions(false); onDelete(post.id); }}>
            <Text className="px-4 py-2 text-base text-red-600">Supprimer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content (texte + médias) */}
      {(post.content || (post.media && (post.media.images?.length || post.media.videos?.length))) && (
        <View className="my-4">
          {post.content ? <Text className="mb-2">{post.content}</Text> : null}
          {post.media && (
            <>
              {post.media.images && post.media.images.length > 0 && (
                <ScrollView horizontal className="mb-2">
                  {post.media.images.map((img, idx) => (
                    <Image
                      key={idx}
                      source={{ uri: img }}
                      className="w-32 h-32 rounded mr-2"
                    />
                  ))}
                </ScrollView>
              )}
              {post.media.videos && post.media.videos.length > 0 && (
                <ScrollView horizontal>
                  {post.media.videos.map((vid, idx) => (
                    <View key={idx} className="w-32 h-32 rounded mr-2 bg-gray-200 items-center justify-center">
                      <FontAwesome name="video-camera" size={40} color="#555" />
                    </View>
                  ))}
                </ScrollView>
              )}
            </>
          )}
        </View>
      )}

      {/* Actions */}
      <View className="flex-row items-center gap-6">
        <TouchableOpacity onPress={() => onLike(post.id)} className="flex-row items-center">
          <FontAwesome name={isLiked ? "heart" : "heart-o"} size={20} color={isLiked ? "red" : "#555"} />
          <Text className="ml-1">{post.likes.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowComments(!showComments)}>
          <Text className="text-gray-700">Commentaires ({post.comments.length})</Text>
        </TouchableOpacity>
      </View>

      {/* Comments */}
      {showComments && (
        <View className="mt-4">
          <View className="flex-row items-center mb-2">
            <TextInput
              value={commentInput}
              onChangeText={setCommentInput}
              placeholder="Ajouter un commentaire..."
              className="flex-1 px-3 py-2 rounded border border-gray-300 mr-2"
            />
            <TouchableOpacity onPress={handleCommentSubmit} className="px-4 py-2 rounded bg-blue-600">
              <Text className="text-white">Publier</Text>
            </TouchableOpacity>
          </View>
          {post.comments.map((comment) => (
            <View key={comment.id} className="mb-2 p-2 bg-gray-100 rounded">
              <Text className="font-bold text-sm">{comment.author.name}</Text>
              <Text className="text-sm">{comment.content}</Text>
              <Text className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default PostItem;