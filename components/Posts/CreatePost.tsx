// components/Posts/CreatePost.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { createPost, updatePost } from '@/redux/postSlice';
import type { RootState, AppDispatch } from '@/redux/store';
import { useTheme } from '@/hooks/toggleChangeTheme';
import {
  X,
  Image as ImageIcon,
  Video,
  MapPin,
  User,
  Smile,
  Earth,
  Users,
  Lock,
  Send,
  Camera,
} from 'lucide-react-native';

interface CreatePostProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  editPost?: any;
  isVisible: boolean; // ← AJOUTÉ
}

type PrivacyType = 'public' | 'friends' | 'private';
type MediaType = 'image' | 'video';

const CreatePost: React.FC<CreatePostProps> = ({
  onSuccess,
  onCancel,
  editPost,
  isVisible,
}) => {
  const [text, setText] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [privacy, setPrivacy] = useState<PrivacyType>('public');
  const [showPrivacyOptions, setShowPrivacyOptions] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const { isDark } = useTheme();

  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const textInputRef = useRef<TextInput>(null);

  // DEBUG: Vérifie ce que contient currentUser
  console.log('🔍 currentUser:', currentUser);
  console.log('🔍 currentUser.profile:', currentUser?.profile);
  console.log('🔍 currentUser.profile?.profilePicture:', currentUser?.profile?.profilePicture);


  // Initialiser avec les données du post à éditer
  useEffect(() => {
    if (editPost) {
      setText(editPost.content?.text || '');
      setSelectedImages(editPost.content?.media?.images || []);
      setSelectedVideos(editPost.content?.media?.videos || []);
      setPrivacy(editPost.visibility?.privacy || 'public');
    } else {
      resetForm();
    }
  }, [editPost, isVisible]);

  const isValidForm = text.trim().length > 0 || selectedImages.length > 0 || selectedVideos.length > 0;
  const isEditing = !!editPost;

  // Sélectionner des médias avec ImagePicker
  const pickMedia = async (mediaType: MediaType) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour accéder à vos médias.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaType === 'image' 
          ? ImagePicker.MediaTypeOptions.Images
          : ImagePicker.MediaTypeOptions.Videos,
        allowsMultipleSelection: mediaType === 'image',
        quality: 0.8,
        aspect: [4, 3],
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets) {
        if (mediaType === 'image') {
          const newImages = result.assets.map(asset => asset.uri);
          setSelectedImages(prev => [...prev, ...newImages].slice(0, 10));
        } else {
          const newVideos = result.assets.map(asset => asset.uri);
          setSelectedVideos(prev => [...prev, ...newVideos].slice(0, 1));
        }
      }
    } catch (error) {
      console.error('Erreur sélection médias:', error);
      Alert.alert('Erreur', `Impossible de sélectionner des ${mediaType === 'image' ? 'images' : 'vidéos'}`);
    } finally {
      setShowMediaOptions(false);
    }
  };

  // Prendre une photo
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour utiliser la caméra.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets) {
        setSelectedImages(prev => [...prev, result.assets[0].uri].slice(0, 10));
      }
    } catch (error) {
      console.error('Erreur prise photo:', error);
      Alert.alert('Erreur', 'Impossible de prendre une photo');
    } finally {
      setShowMediaOptions(false);
    }
  };

  // Supprimer un média
  const removeMedia = (index: number, type: 'image' | 'video') => {
    if (type === 'image') {
      setSelectedImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setSelectedVideos(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Soumettre le post
  const handleSubmit = async () => {
    if (!isValidForm || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const postData = {
        content:{
        text: text.trim(),
        media: {
          ...(selectedImages.length > 0 && { images: selectedImages }),
          ...(selectedVideos.length > 0 && { videos: selectedVideos }),
        },
        },
        visibility: {
          privacy,
        },
      };

      if (isEditing) {
        await dispatch(updatePost({
          postId: editPost._id,
          data: postData,
        })).unwrap();
        Alert.alert('Succès', 'Publication modifiée !');
      } else {
        await dispatch(createPost(postData)).unwrap();
        Alert.alert('Succès', 'Publication créée !');
      }

      onSuccess?.();
      resetForm();
      
    } catch (error: any) {
      Alert.alert('Erreur', error || `Impossible de ${isEditing ? 'modifier' : 'créer'} la publication`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setText('');
    setSelectedImages([]);
    setSelectedVideos([]);
    setPrivacy('public');
    setCharacterCount(0);
    setShowMediaOptions(false);
    setShowPrivacyOptions(false);
  };
  useEffect(() => {
  if (!isVisible) {
    resetForm();
  }
}, [isVisible]);

  const handleCancel = () => {
    if (text.trim() || selectedImages.length > 0 || selectedVideos.length > 0) {
      Alert.alert(
        'Annuler',
        'Voulez-vous vraiment annuler ? Votre publication ne sera pas sauvegardée.',
        [
          { text: 'Continuer', style: 'cancel' },
          {
            text: 'Annuler',
            style: 'destructive',
            onPress: () => {
              resetForm();
              onCancel?.();
            },
          },
        ]
      );
    } else {
      resetForm();
      onCancel?.();
    }
  };

  // Rendu des médias
  const renderMediaPreviews = () => {
    if (selectedImages.length === 0 && selectedVideos.length === 0) return null;

    return (
      <View className="px-4 py-4">
        {selectedImages.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="my-3">
            {selectedImages.map((image, index) => (
              <View key={index} className="relative mr-3">
                <Image source={{ uri: image }} className="w-32 h-32 rounded-xl" resizeMode="cover" />
                <TouchableOpacity
                  onPress={() => removeMedia(index, 'image')}
                  className="absolute top-2 right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                >
                  <X size={14} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {selectedVideos.length > 0 && (
          <View className="space-y-3">
            {selectedVideos.map((video, index) => (
              <View key={index} className="relative bg-slate-100 rounded-xl p-4 border border-slate-200">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <Video size={24} color="#64748b" />
                    <View className="ml-3 flex-1">
                      <Text className="text-slate-700 font-medium">Vidéo {index + 1}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeMedia(index, 'video')}
                    className="bg-red-500 rounded-full w-8 h-8 items-center justify-center ml-2"
                  >
                    <X size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (!isVisible) return null;
 if (currentUser) {
  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet" transparent={true} className='dark:bg-black' >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white dark:bg-black mt-24">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-slate-200">
          <TouchableOpacity onPress={handleCancel} className="p-2">
            <X size={24} color={isDark ? "#fff" : "#64748b"} />
          </TouchableOpacity>
          
          <Text className="text-lg font-semibold text-slate-900 dark:text-gray-200">
            {isEditing ? 'Modifier' : 'Créer une publication'}
          </Text>
          
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={!isValidForm || isSubmitting}
            className={`px-4 py-2 rounded-full ${isValidForm && !isSubmitting ? "bg-blue-600" : "bg-slate-300"}`}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className={`font-semibold ${isValidForm && !isSubmitting ? "text-white" : "text-slate-500"}`}>
                {isEditing ? "Modifier" : "Publier"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* User info */}
          <View className="flex-row items-center justify-between p-4 border-b border-slate-100">
            <View className="flex-row items-center flex-1">
              {currentUser?.profile?.profilePicture? (
                <Image source={{ uri: currentUser.profile.profilePicture }} className="w-10 h-10 rounded-full" />
              ) : (
                <View className="w-10 h-10 rounded-full bg-slate-200 items-center justify-center">
                  <User size={20} color="#64748b" />
                </View>
              )}
              
              <View className="ml-3 flex-1">
                <Text className="font-semibold text-slate-900 dark:text-gray-200">{currentUser?.username}</Text>
                <TouchableOpacity onPress={() => setShowPrivacyOptions(true)} className="flex-row items-center mt-1">
                  {privacy === 'public' && <Earth size={16} color="#10b981" />}
                  {privacy === 'friends' && <Users size={16} color="#3b82f6" />}
                  {privacy === 'private' && <Lock size={16} color="#ef4444" />}
                  <Text className="text-slate-500 dark:text-gray-400 text-sm ml-1">
                    {privacy === 'public' && 'Public'}
                    {privacy === 'friends' && 'Amis seulement'}
                    {privacy === 'private' && 'Privé'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Text input */}
          <View className="p-4">
            <TextInput
              ref={textInputRef}
              value={text}
              onChangeText={(value) => {
                setText(value);
                setCharacterCount(value.length);
              }}
              placeholder="Quoi de neuf ? Partagez avec votre réseau..."
              placeholderTextColor="#94a3b8"
              multiline
              maxLength={500}
              className="text-slate-900 dark:text-gray-200 text-lg min-h-[150px] leading-6"
              textAlignVertical="top"
              autoFocus
            />
          </View>

          {renderMediaPreviews()}

          {/* Options */}
          <View className="mx-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
            <Text className="text-slate-700 font-medium mb-3">Ajouter à votre publication</Text>
            
            <View className="flex-row justify-between">
              <TouchableOpacity onPress={() => setShowMediaOptions(true)} className="flex-row items-center px-4 py-3 rounded-lg active:bg-white">
                <ImageIcon size={20} color="#3b82f6" />
                <Text className="ml-2 text-slate-700 font-medium">Média</Text>
              </TouchableOpacity>

          
            </View>
          </View>

          <View className="px-4 py-3">
            <Text className="text-slate-500 text-sm text-right">
              {characterCount}/500 caractères
            </Text>
          </View>
        </ScrollView>

        {/* Modals */}
        <Modal visible={showMediaOptions} transparent animationType="slide">
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-slate-900">Ajouter un média</Text>
                <TouchableOpacity onPress={() => setShowMediaOptions(false)}>
                  <X size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-around">
                <TouchableOpacity onPress={takePhoto} className="items-center p-4">
                  <View className="w-16 h-16 bg-blue-100 rounded-2xl items-center justify-center mb-2">
                    <Camera size={28} color="#3b82f6" />
                  </View>
                  <Text className="text-slate-700 font-medium">Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => pickMedia('image')} className="items-center p-4">
                  <View className="w-16 h-16 bg-green-100 rounded-2xl items-center justify-center mb-2">
                    <ImageIcon size={28} color="#10b981" />
                  </View>
                  <Text className="text-slate-700 font-medium">Galerie</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => pickMedia('video')} className="items-center p-4">
                  <View className="w-16 h-16 bg-purple-100 rounded-2xl items-center justify-center mb-2">
                    <Video size={28} color="#8b5cf6" />
                  </View>
                  <Text className="text-slate-700 font-medium">Vidéo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={showPrivacyOptions} transparent animationType="slide">
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white dark:bg-black rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-slate-900 dark:text-gray-100">Confidentialité</Text>
                <TouchableOpacity onPress={() => setShowPrivacyOptions(false)}>
                  <X size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View className="space-y-3 gap-y-2">
                {(['public', 'friends', 'private'] as PrivacyType[]).map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => {
                      setPrivacy(option);
                      setShowPrivacyOptions(false);
                    }}
                    className={`flex-row items-center p-4 rounded-xl border-2 ${
                      privacy === option ? 'border-blue-500 bg-blue-50 dark:bg-gray-800' : 'border-slate-200 dark:border-slate-500'
                    }`}
                  >
                    <View className="w-10 h-10 rounded-full bg-slate-100  items-center justify-center mr-3">
                      {option === 'public' && <Earth size={20} color="#10b981" />}
                      {option === 'friends' && <Users size={20} color="#3b82f6" />}
                      {option === 'private' && <Lock size={20} color="#ef4444" />}
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-slate-900 dark:text-gray-200">
                        {option === 'public' && 'Public'}
                        {option === 'friends' && 'Amis seulement'}
                        {option === 'private' && 'Privé'}
                      </Text>
                    </View>
                    {privacy === option && <Text className="text-blue-500 font-bold">✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </Modal>
  );
}
};

export default CreatePost;