import { useEffect, useState } from 'react';
import { ScrollView, ActivityIndicator, Text, View } from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import PostItem from './PostItem';
import MePost from './MePost';

const MyPostsList = () => {
  const [posts, setPosts] = useState([]);
  const correctUser = useSelector((state: RootState) => state.user);
  
  const [loading, setLoading] = useState(true);


  return (
    <ScrollView className="flex w-full h-full py-2">
      {loading ? (
        <ActivityIndicator size="large" color="#555" />
      ) : posts.length === 0 ? (
        <Text>Aucune publication trouvée.</Text>
      ) : (
        posts.map((post: any) => (
          // Assure que chaque post a un utilisateur, sinon utilise l'utilisateur actuel
          post && post.user ? (
          <MePost/> 
          ) : null
      )
    )
    )} 
    </ScrollView>
  );
};

export default MyPostsList;
