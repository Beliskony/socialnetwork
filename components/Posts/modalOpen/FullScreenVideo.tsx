import { View, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import VideoPlayerItem from '../VideoPlayerItem';
import { Ionicons } from '@expo/vector-icons';

const FullScreenVideo = () => {
  const { uri } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <TouchableOpacity
        onPress={router.back}
        style={{ position: 'absolute', top: 40, left: 20, zIndex: 1 }}
      >
        <Ionicons name="close" size={30} color="white" />
      </TouchableOpacity>

      <VideoPlayerItem uri={uri as string} isVisible />
    </View>
  );
};

export default FullScreenVideo;
