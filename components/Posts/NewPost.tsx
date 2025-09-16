import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, Text, Image, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

import { AppDispatch, RootState } from '@/redux/store';
import { addPost, Media } from '@/redux/postSlice';

interface NewPostProps {
  onPostCreated?: () => void;
}

type MediaState = {
  images: string[];
  videos: string[];
};

const NewPost: React.FC<NewPostProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaState>({ images: [], videos: [] });
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.posts);

  // Picker pour les images et vidéos
  const handleAddMedia = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) return alert("Permission d'accès à la galerie refusée !");

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!pickerResult.canceled && pickerResult.assets) {
      const newImages: string[] = [];
      const newVideos: string[] = [];

      pickerResult.assets.forEach(asset => {
        if (asset.type?.startsWith('image')) newImages.push(asset.uri);
        else if (asset.type?.startsWith('video')) newVideos.push(asset.uri);
      });

      setMedia(prev => ({
        images: [...prev.images, ...newImages],
        videos: [...prev.videos, ...newVideos],
      }));
    }
  };

  // Supprimer média
  const handleRemoveMedia = (uri: string, type: 'image' | 'video') => {
    setMedia(prev => ({
      ...prev,
      [type === 'image' ? 'images' : 'videos']: prev[type === 'image' ? 'images' : 'videos'].filter(u => u !== uri),
    }));
  };

  // Publication
  const handleSubmit = async () => {
    if (!content.trim() && media.images.length === 0 && media.videos.length === 0) return;

    setIsLoading(true);
    const payload = { text: content, media: { images: media.images, videos: media.videos } };

    try {
      await dispatch(addPost(payload)).unwrap();
      setContent('');
      setMedia({ images: [], videos: [] });
      onPostCreated?.();
    } catch (err) {
      console.error('Erreur réseau:', err);
      alert('Erreur lors de la publication. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex flex-col w-full mb-2 bg-white p-2">
      <View className="flex-row items-center justify-between mb-2">
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Exprimez-vous..."
          multiline
          editable={!isLoading}
          className="flex-1 border border-gray-300 p-2 rounded text-base min-h-[50px]"
        />
        <TouchableOpacity onPress={handleAddMedia} className="ml-2">
          <Image source={require('../../assets/images/addImage.png')} style={{ width: 35, height: 35 }} />
        </TouchableOpacity>
      </View>

      {/* Images */}
      {media.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          {media.images.map((img, idx) => (
            <View key={idx} className="relative mr-2">
              <Image source={{ uri: img }} style={{ width: 120, height: 120, borderRadius: 8 }} />
              <TouchableOpacity
                onPress={() => handleRemoveMedia(img, 'image')}
                className="absolute top-2 right-2 bg-black rounded-full p-1"
              >
                <MaterialIcons name="close" size={16} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Vidéos */}
      {media.videos.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          {media.videos.map((vid, idx) => (
            <View key={idx} className="relative mr-2">
              <Image
                source={{ uri: vid }}
                style={{ width: 120, height: 120, borderRadius: 8 }}
              />
              <View className="absolute inset-0 flex justify-center items-center">
                <MaterialIcons name="play-circle-outline" size={40} color="white" />
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveMedia(vid, 'video')}
                className="absolute top-2 right-2 bg-black rounded-full p-1"
              >
                <MaterialIcons name="close" size={16} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isLoading || (!content.trim() && media.images.length === 0 && media.videos.length === 0)}
        className={`bg-[#2E3244] rounded py-2 ${isLoading || (!content.trim() && media.images.length === 0 && media.videos.length === 0) ? 'opacity-50' : ''}`}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-center font-bold">Publier</Text>
        )}
      </TouchableOpacity>

      {error && <Text className="text-red-500 mt-2">{error}</Text>}
    </View>
  );
};

export default NewPost;
