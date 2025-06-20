import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, Text, Image, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker'
import { RootState } from '@/redux/store';
import { addPost } from '@/redux/postSlice';

interface NewPostProps {
    onPostCreated?: () => void;
}

type MediaState = {
    images: string[];
    videos: string[];
};

const NewPost: React.FC<NewPostProps> = ({ onPostCreated }) => {
    const [content, setContent] = useState('');
    const [media, setMedia] = useState<MediaState>({ images: [], videos: [] }); // Plusieurs images/vidéos
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state: RootState) => state.posts);

    
    // Picker pour les images et videos
const handleAddMedia = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
        alert("Permission d'accès à la galerie refusée !");
        return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true, // Expo SDK 48+
        aspect: [4,3],
        quality: 1,
    })

    if (!pickerResult.canceled && pickerResult.assets) {
        const newImages: string[] = [];
        const newVideos: string[] = [];

        pickerResult.assets.forEach((asset: ImagePicker.ImagePickerAsset) => {
      if (asset.type?.startsWith('image')) {
        newImages.push(asset.uri);
      } else if (asset.type?.startsWith('video')) {
        newVideos.push(asset.uri);
      }
        });

        setMedia(prev => ({
            ...prev,
            images: [...prev.images, ...newImages],
            videos: [...prev.videos, ...newVideos],
        }));
    }
};



    const handleSubmit = async () => {
        if (!content.trim() && media.images.length === 0 && media.videos.length === 0) return;
        const payload: any = { text: content };
        if (media.images.length > 0 || media.videos.length > 0) payload.media = media;
        const resultAction = await dispatch(addPost(payload) as any);
        if ((addPost as any).fulfilled.match(resultAction)) {
            setContent('');
            setMedia({ images: [], videos: [] });
            if (onPostCreated) onPostCreated();
        }
    };

    return (
        <View className="mb-6">
            <TextInput
                value={content}
                onChangeText={setContent}
                placeholder="Exprimez-vous..."
                multiline
                editable={!loading}
                className="w-full min-h-20 border border-gray-300 p-2 mb-2 rounded text-base"
            />
            {/* Affichage des images */}
            {media.images.length > 0 && (
                <ScrollView horizontal className="mb-2">
                    {media.images.map((img, idx) => (
                        <Image
                            key={idx}
                            source={{ uri: img }}
                            style={{ width: 60, height: 60, borderRadius: 8, marginRight: 8 }}
                        />
                    ))}
                </ScrollView>
            )}
            {/* Affichage des vidéos (miniatures ou icône vidéo) */}
            {media.videos.length > 0 && (
                <ScrollView horizontal className="mb-2">
                    {media.videos.map((vid, idx) => (
                        <Image
                            key={idx}
                            source={{ uri: vid }}
                            style={{ width: 60, height: 60, borderRadius: 8, marginRight: 8 }}
                        />
                    ))}
                </ScrollView>
            )}
            <View className="flex-row items-center">
                <TouchableOpacity className="mr-2" onPress={handleAddMedia}>
                    <Image
                        source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/add-image.png' }}
                        style={{ width: 28, height: 28 }}
                    />
                </TouchableOpacity>
                
                <TouchableOpacity
                    className={`flex-1 bg-blue-500 rounded px-4 py-2 ${(!content.trim() && media.images.length === 0 && media.videos.length === 0) ? 'opacity-50' : ''}`}
                    onPress={handleSubmit}
                    disabled={!content.trim() && media.images.length === 0 && media.videos.length === 0}
                >
                    <Text className="text-white text-center font-bold">Publier</Text>
                </TouchableOpacity>
            </View>
            {error && <Text className="text-red-500 mt-2">{error}</Text>}
            {loading && <ActivityIndicator />}
        </View>
    );
};

export default NewPost;