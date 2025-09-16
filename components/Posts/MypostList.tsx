import { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import MePost from './MePost';
import SkeletonPostItem from '../skeletons/SkeletonPostItem';
import axios from 'axios';

const MyPostsList = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const correctUser = useSelector((state: RootState) => state.user);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        'https://apisocial-g8z6.onrender.com/api/post/getPostsByUser',
        {
          headers: { Authorization: `Bearer ${correctUser.token}` },
        }
      );
      setPosts(response.data.reverse());
    } catch (error) {
      console.error('Erreur lors du chargement des posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (correctUser && correctUser.token) {
      fetchPosts();
    }
  }, [correctUser]);

  return (
    <ScrollView className="flex w-full h-full py-2">
      {loading ? (
        // Affiche 3 skeletons pour le chargement
        <>
          <SkeletonPostItem />
          <SkeletonPostItem />
          <SkeletonPostItem />
        </>
      ) : posts.length === 0 ? (
        <Text className="text-center text-gray-500 mt-4">Aucune publication trouvée.</Text>
      ) : (
        posts.map((post) =>
          post && post.user ? (
            <MePost
              key={post._id}
            />
          ) : null
        )
      )}
    </ScrollView>
  );
};

export default MyPostsList;
