import { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import PostItem from './PostItem';
import SkeletonPostItem from '../skeletons/SkeletonPostItem';

const OtherProfilePostsList = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const correctUser = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(
        'https://apisocial-g8z6.onrender.com/api/post/getPostsByUser',
        { headers: { Authorization: `Bearer ${correctUser.token}` } }
      );
      setPosts(response.data.reverse());
    } catch (error) {
      console.error('Erreur lors du chargement des posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (correctUser && correctUser.token) fetchPosts();
  }, [correctUser]);

  const handleLike = async (postId: string) => {
    try {
      await axios.put(`https://apisocial-g8z6.onrender.com/api/like/post/${postId}`, {
        userId: correctUser._id,
      });
      fetchPosts();
    } catch (error) {
      console.error('Erreur lors du like:', error);
    }
  };

  const handleComment = async (postId: string, comment: string) => {
    try {
      await axios.post(`https://apisocial-g8z6.onrender.com/api/post/${postId}/comment`, {
        userId: correctUser._id,
        content: comment,
      });
      fetchPosts();
    } catch (error) {
      console.error('Erreur lors du commentaire:', error);
    }
  };

  const handleEdit = (postId: string) => {
    console.log('Éditer post:', postId);
  };

  const handleDelete = async (postId: string) => {
    try {
      await axios.delete(`https://apisocial-g8z6.onrender.com/api/post/${postId}`);
      fetchPosts();
    } catch (error) {
      console.error('Erreur lors de la suppression du post:', error);
    }
  };

  return (
    <ScrollView className="flex w-full h-full py-2">
      {loading ? (
        // Affiche 3 skeletons pendant le chargement
        <>
          <SkeletonPostItem />
          <SkeletonPostItem />
          <SkeletonPostItem />
        </>
      ) : posts.length === 0 ? (
        <Text>Aucune publication trouvée.</Text>
      ) : (
        posts.map(
          (post: any) =>
            post && post.user && (
              <PostItem
                key={post._id}
                post={{ ...post, user: post.user }}
                onLike={handleLike}
                onComment={handleComment}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )
        )
      )}
    </ScrollView>
  );
};

export default OtherProfilePostsList;
