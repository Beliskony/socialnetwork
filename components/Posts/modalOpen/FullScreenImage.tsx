import { View, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const FullScreenImage = () => {
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

      <Image
        source={{ uri: uri as string }}
        style={{ flex: 1, resizeMode: 'contain' }}
      />
    </View>
  );
};

export default FullScreenImage;
