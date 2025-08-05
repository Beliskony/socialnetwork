import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, Text, Image, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker'
import { Video }  from 'expo-av'

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
    const [media, setMedia] = useState<MediaState>({ images: [], videos: [] }); // Plusieurs images/vidéos
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    
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
    

    //Fonction pour remove une image ou vidéo
    const handleRemoveMedia = (uri: string, type: 'image' | 'video') => {
        setMedia(prev => {
            if (type === 'image') {
                return { 
                    ...prev, 
                    images: prev.images.filter(img => img !== uri) 
                };
            } else {
                return { 
                    ...prev, 
                    videos: prev.videos.filter(vid => vid !== uri) 
                };
            }
        } )
    }


    const handleSubmit = async () => {
        if (!content.trim() && media.images.length === 0 && media.videos.length === 0) return;

        setIsLoading(true);
        const payload = { text: content, media: { images: media.images, videos: media.videos } };
        
        try {
            await dispatch(addPost(payload)).unwrap();
            setContent('');
            setMedia({ images: [], videos: [] }); // Réinitialiser les médias après la publication
            onPostCreated?.(); // Appeler la fonction de rappel si elle est fournie
        } catch (error) {
            console.error('Erreur réseau:', error);
            alert('Erreur lors de la publication du post. Veuillez réessayer plus tard.');
        } finally {
            setIsLoading(false);
        }

    };

    return (
        <View className="flex flex-col w-full mb-1 bg-white">
          <View className='flex-row items-center justify-between p-2 w-full'>
            <TextInput
                value={content}
                onChangeText={setContent}
                placeholder="Exprimez-vous..."
                multiline
                editable={!loading}
                className="w-10/12 min-h-20 border border-gray-300 p-2 mb-2 rounded text-base"
            />

            <TouchableOpacity className="mr-2" onPress={handleAddMedia}>
                    <Image
                        source={require('../../assets/images/addImage.png') }
                        style={{ width: 37, height: 37 }}
                    />
                </TouchableOpacity>

            </View>
            {/* Affichage des images */}
            {media.images.length > 0 && (
                <ScrollView horizontal className="mb-2">
                    {media.images.map((img, idx) => (
                    <View key={idx} style={{ position: 'relative' }}>
                        <Image
                            className='w-[120px] h-[120px] rounded-lg mr-2'
                            key={idx}
                            source={{ uri: img }}
                            style={{ width: 120, height: 120, borderRadius: 8, marginRight: 8 }}
                        />

                        <TouchableOpacity 
                            onPress={() => handleRemoveMedia(img, 'image')}
                            style={{ position: 'absolute', top: 5, right: 5 }}>
                                <Image source={require('../../assets/images/close.png')} className="w-4 h-4" />
                        </TouchableOpacity>
                    </View>
                    ))}
                </ScrollView>
            )}
            {/* Affichage des vidéos (miniatures ou icône vidéo) */}
            {media.videos.length > 0 && (
                <ScrollView horizontal className="mb-2">
                    {media.videos.map((vid, idx) => (
                    <View key={idx} style={{ position: 'relative' }}>
                        <Video
                            videoStyle={{ width: 120, height: 120, borderRadius: 8, marginRight: 8 }}
                            isLooping
                            isMuted
                            shouldPlay
                            key={idx}
                            source={{ uri: vid }}
                            style={{ width: 120, height: 120, borderRadius: 8, marginRight: 8 }}
                        />

                        <TouchableOpacity 
                            onPress={() => handleRemoveMedia(vid, 'video')}
                            style={{ position: 'absolute', top: 5, right: 5 }}>
                                <Image source={require('../../assets/images/close.png')} className="w-4 h-4" />
                        </TouchableOpacity>
                    </View>
                    ))}
                </ScrollView>
            )}
            <View className="flex-row items-center px-2 mb-2">
                
                <TouchableOpacity
                    className={`flex-1 bg-[#2E3244] rounded px-4 py-2 ${(!content.trim() && media.images.length === 0 && media.videos.length === 0) ? 'opacity-50' : ''}`}
                    onPress={handleSubmit}
                    disabled={!content.trim() && media.images.length === 0 && media.videos.length === 0}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />) : (
                        <Text className="text-white text-center font-bold">Publier</Text>
                        )}
                    
                </TouchableOpacity>
            </View>
            {error && <Text className="text-red-500 mt-2">{error}</Text>}
            {loading && <ActivityIndicator />}
        </View>
    );
};

export default NewPost;