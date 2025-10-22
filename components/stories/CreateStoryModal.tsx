// components/Stories/CreateStoryModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useStories } from '@/hooks/useStories';
import { X, Camera, Image as ImageIcon, Video } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

interface CreateStoryModalProps {
  visible: boolean;
  onClose: () => void;
  onStoryCreated: () => void;
}

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  visible,
  onClose,
  onStoryCreated,
}) => {
  const { createStory, uploadLoading } = useStories();
  const [selectedMedia, setSelectedMedia] = useState<{ uri: string; type: 'image' | 'video' } | null>(null);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedMedia({
          uri: result.assets[0].uri,
          type: 'image',
        });
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sélectionner une image');
    }
  };

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedMedia({
          uri: result.assets[0].uri,
          type: 'video',
        });
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sélectionner une vidéo');
    }
  };

  const handleCreateStory = async () => {
    if (!selectedMedia) return;

    try {
      await createStory({
        content: {
          type: selectedMedia.type,
          data: selectedMedia.uri,
        },
      });

      setSelectedMedia(null);
      onStoryCreated();
      onClose();
      Alert.alert('Succès', 'Story publiée !');
    } catch (error: any) {
      Alert.alert('Erreur', error || 'Impossible de publier la story');
    }
  };

  const handleClose = () => {
    setSelectedMedia(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-white">
        {/* En-tête */}
        <View className="flex-row items-center justify-between p-4 border-b border-slate-200">
          <TouchableOpacity onPress={handleClose}>
            <X size={24} color="#64748b" />
          </TouchableOpacity>
          
          <Text className="font-semibold text-slate-900 text-lg">
            Créer une story
          </Text>
          
          <View className="w-6" /> {/* Espacement */}
        </View>

        {/* Contenu */}
        <View className="flex-1 p-4">
          {selectedMedia ? (
            <View className="flex-1">
              {/* Aperçu */}
              <View className="flex-1 bg-slate-100 rounded-xl overflow-hidden mb-4">
                {selectedMedia.type === 'image' ? (
                  <Image
                    source={{ uri: selectedMedia.uri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="flex-1 bg-slate-800 items-center justify-center">
                    <Video size={48} color="white" />
                    <Text className="text-white mt-2 text-lg">Vidéo sélectionnée</Text>
                  </View>
                )}
              </View>

              {/* Actions */}
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => setSelectedMedia(null)}
                  className="flex-1 bg-slate-200 py-3 rounded-lg items-center"
                >
                  <Text className="text-slate-700 font-medium">Changer</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleCreateStory}
                  disabled={uploadLoading}
                  className="flex-1 bg-blue-600 py-3 rounded-lg items-center"
                >
                  {uploadLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white font-medium">Publier</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="flex-1 justify-center items-center space-y-6">
              {/* Option Photo */}
              <TouchableOpacity
                onPress={pickImage}
                className="w-full bg-blue-50 p-6 rounded-xl items-center"
              >
                <ImageIcon size={48} color="#3b82f6" />
                <Text className="text-blue-600 font-semibold text-lg mt-2">
                  Photo
                </Text>
                <Text className="text-blue-500 text-sm mt-1">
                  Choisir une photo depuis votre galerie
                </Text>
              </TouchableOpacity>

              {/* Option Vidéo */}
              <TouchableOpacity
                onPress={pickVideo}
                className="w-full bg-purple-50 p-6 rounded-xl items-center"
              >
                <Video size={48} color="#8b5cf6" />
                <Text className="text-purple-600 font-semibold text-lg mt-2">
                  Vidéo
                </Text>
                <Text className="text-purple-500 text-sm mt-1">
                  Choisir une vidéo depuis votre galerie
                </Text>
              </TouchableOpacity>

              {/* Option Camera (future implémentation) */}
              <TouchableOpacity
                onPress={pickImage}
                className="w-full bg-green-50 p-6 rounded-xl items-center opacity-50"
                disabled
              >
                <Camera size={48} color="#10b981" />
                <Text className="text-green-600 font-semibold text-lg mt-2">
                  Camera
                </Text>
                <Text className="text-green-500 text-sm mt-1">
                  Prendre une photo ou vidéo (bientôt disponible)
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};