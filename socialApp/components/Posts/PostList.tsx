import React from 'react';
import { ScrollView } from 'react-native';
import PostItem from './PostItem';

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

type PostListProps = {
  posts: Post[];
  currentUser: User;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onEdit: (postId: string) => void;
  onDelete: (postId: string) => void;
};

const PostList: React.FC<PostListProps> = ({
  posts,
  currentUser,
  onLike,
  onComment,
  onEdit,
  onDelete,
}) => {
  return (
    <ScrollView>
      {posts.map((post) => (
        <PostItem
          key={post.id}
          post={post}
          currentUser={currentUser}
          onLike={onLike}
          onComment={onComment}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ScrollView>
  );
};

export default PostList;