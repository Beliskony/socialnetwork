// components/Stories/CreateStoryModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { createStory } from '@/redux/storySlice';
import { X } from 'lucide-react-native';
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
  const dispatch = useDispatch();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (visible) {
      openGallery();
    }
  }, [visible]);

  const openGallery = async () => {
    try {
      setIsProcessing(true);
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour accéder à vos médias.');
        handleClose();
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All, // Images ET vidéos
        allowsEditing: false,
        quality: 0.8,
        videoMaxDuration: 30, // 30 secondes max pour les vidéos
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const mediaType = asset.type === 'video' ? 'video' : 'image';
        
        await handleCreateStory({
          uri: asset.uri,
          type: mediaType,
        });
      } else {
        handleClose();
      }
    } catch (error) {
      console.error('Erreur galerie:', error);
      Alert.alert('Erreur', 'Impossible d\'accéder à la galerie');
      handleClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateStory = async (media: { uri: string; type: 'image' | 'video' }) => {
    try {
      setIsProcessing(true);
      
      console.log('🟡 Création story:', media.type);
      
      const storyData = {
        content: {
          type: media.type,
          data: media.uri,
          duration: media.type === 'video' ? 30 : undefined, // Durée en secondes
        }
      };

      // Ajouter la durée pour les vidéos
      if (media.type === 'video') {
        storyData.content.duration = 30000; // 30 secondes
      }
      
      const result = await dispatch(createStory(storyData) as any);

      console.log('🟡 Résultat dispatch:', result);

      if (result.type === 'stories/createStory/fulfilled') {
        console.log('✅ Story créée avec succès!');
        onStoryCreated();
        onClose();
        Alert.alert('Succès', 'Story publiée !');
      } else {
        throw new Error(result.error?.message || 'Erreur inconnue');
      }
      
    } catch (error: any) {
      console.error('🔴 Erreur création story:', error);
      Alert.alert('Erreur', error?.message || 'Impossible de publier la story');
      handleClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsProcessing(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white rounded-2xl p-6 mx-4 items-center min-w-[280px]">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-slate-700 mt-4 text-lg font-medium">
            {isProcessing ? 'Publication en cours...' : 'Ouverture de la galerie...'}
          </Text>
          <Text className="text-slate-500 mt-2 text-center">
            {isProcessing 
              ? 'Votre story est en train d\'être publiée' 
              : 'Sélectionnez une photo ou une vidéo (30s max)'
            }
          </Text>
          
          <TouchableOpacity 
            onPress={handleClose}
            className="mt-6 bg-slate-200 px-6 py-3 rounded-lg"
            disabled={isProcessing}
          >
            <Text className="text-slate-700 font-medium">Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};