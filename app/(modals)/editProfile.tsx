// app/(modals)/edit-profile.tsx
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Image,
  ActivityIndicator 
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { updateUserProfile, clearError } from "@/redux/userSlice"
import { router } from "expo-router"
import { X, Camera, User, MapPin, Link, Calendar, ImageIcon } from "lucide-react-native"
import * as ImagePicker from 'expo-image-picker'

export default function EditProfileModal() {
  const dispatch = useAppDispatch()
  const { currentUser, loading, error } = useAppSelector((state) => state.user)
  
  const [formData, setFormData] = useState({
    username: '',
    profile: {
      fullName: '',
      bio: '',
      profilePicture: '',
      coverPicture:'',
      location: '',
      website: '',
      birthDate: '',
      gender: '' as 'male' | 'female' | 'other' | 'prefer_not_to_say' | '',
    }
  })

  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [coverImage, setCoverImage] = useState<string | null>(null)

  // Initialiser les données avec l'utilisateur actuel
  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        profile: {
          fullName: currentUser.profile?.fullName || '',
          bio: currentUser.profile?.bio || '',
          profilePicture: currentUser.profile?.profilePicture || '',
          coverPicture: currentUser.profile.coverPicture || '',
          location: currentUser.profile?.location || '',
          website: currentUser.profile?.website || '',
          birthDate: currentUser.profile?.birthDate || '',
          gender: currentUser.profile?.gender || '',
        }
      })
      setProfileImage(currentUser.profile?.profilePicture || null)
      setCoverImage(currentUser.profile?.coverPicture || null)
    }
  }, [currentUser])

  // Gérer les erreurs
  useEffect(() => {
    if (error) {
      Alert.alert("Erreur", error)
      dispatch(clearError())
    }
  }, [error, dispatch])



  const handleSave = async () => {
  if (!formData.username.trim()) {
    Alert.alert("Erreur", "Le nom d'utilisateur est requis")
    return
  }

  try {
    // 🔥 VERSION COMPLÈTEMENT CORRIGÉE : Gérer tous les types
    const updateData = {
      username: formData.username,
      profile: {
        fullName: formData.profile.fullName || undefined,
        bio: formData.profile.bio || undefined,
        location: formData.profile.location || undefined,
        website: formData.profile.website || undefined,
        birthDate: formData.profile.birthDate || undefined,
        gender: formData.profile.gender || undefined,
        // 🔥 Convertir null en undefined
        profilePicture: profileImage || undefined,
        coverPicture: coverImage || undefined,
      }
    }

    console.log("📤 DONNÉES COMPLÈTES envoyées:", updateData)

    await dispatch(updateUserProfile(updateData)).unwrap()
    Alert.alert("Succès", "Profil mis à jour avec succès")
    router.back()
    
  } catch (error: any) {
    console.log("❌ Erreur sauvegarde:", error)
    Alert.alert("Erreur", error?.message || "Impossible de mettre à jour le profil")
  }
}


  const handleChangePhoto = async (type: 'profile' | 'cover') => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
      
      if (!permissionResult.granted) {
        Alert.alert("Permission requise", "L'accès à la galerie est nécessaire pour changer la photo.")
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: type === 'profile',
        aspect: type === 'profile' ? [1, 1] : [16, 9],
        quality: 0.8,
      })

        if (!result.canceled && result.assets[0]) {
        if (type === 'profile') {
          setProfileImage(result.assets[0].uri)
        } else {
          setCoverImage(result.assets[0].uri)
        }
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de sélectionner une image")
    }
  }

  const takePhoto = async (type: 'profile' | 'cover') => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync()
      
      if (!permissionResult.granted) {
        Alert.alert("Permission requise", "L'accès à la caméra est nécessaire pour prendre une photo.")
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: type === 'profile',
        aspect: type === 'profile' ? [1, 1] : [16, 9],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        if (type === 'profile') {
          setProfileImage(result.assets[0].uri)
        } else {
          setCoverImage(result.assets[0].uri)
        }
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de prendre une photo")
    }
  }

  const showImagePickerOptions = (type: 'profile' | 'cover') => {
    const title = type === 'profile' ? "photo de profil" : "photo de couverture"

    Alert.alert(
      `Changer la ${title}`,
      "Choisissez une option",
      [
        {
          text: "Prendre une photo",
          onPress: ()=> takePhoto(type)
        },
        {
          text: "Choisir depuis la galerie",
          onPress:()=> handleChangePhoto(type)
        },
        {
          text: "Annuler",
          style: "cancel"
        }
      ]
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-200">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="p-2"
          disabled={loading}
        >
          <X size={24} color="#64748b" />
        </TouchableOpacity>
        
        <Text className="text-lg font-semibold text-slate-900">Modifier le profil</Text>
        
        <TouchableOpacity 
          onPress={handleSave}
          disabled={loading}
          className="bg-blue-600 px-4 py-2 rounded-full min-w-20 items-center"
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-semibold">Enregistrer</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* photo de couverture */}
          <View className="relative">
          {coverImage ? (
            <Image
              source={{ uri: coverImage }}
              className="w-full h-40"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-40 bg-slate-200 dark:bg-gray-700 items-center justify-center">
              <ImageIcon size={40} color="#64748b" />
            </View>
          )}
          <TouchableOpacity 
            onPress={() => showImagePickerOptions('cover')}
            className="absolute bottom-3 right-3 bg-black/70 rounded-full p-2 flex-row items-center"
          >
            <Camera size={16} color="white" />
            <Text className="text-white text-xs ml-1">Modifier</Text>
          </TouchableOpacity>
          
          
        </View>
        
        {/* Photo de profil */}
        <View className="items-center py-6 border-b border-slate-100">
          <View className="relative">
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                className="w-24 h-24 rounded-full"
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-slate-300 items-center justify-center">
                <User size={32} color="#64748b" />
              </View>
            )}
            <TouchableOpacity 
              onPress={()=>showImagePickerOptions('profile')}
              className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full border-2 border-white items-center justify-center"
            >
              <Camera size={16} color="white" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() =>showImagePickerOptions('profile')}>
            <Text className="text-blue-600 font-medium mt-3">Changer la photo</Text>
          </TouchableOpacity>
        </View>

        {/* Formulaire */}
        <View className="p-4 space-y-4">
          {/* Nom d'utilisateur */}
          <View>
            <Text className="text-slate-700 font-medium mb-2">Nom d'utilisateur</Text>
            <TextInput
              value={formData.username}
              onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900"
              placeholder="Votre nom d'utilisateur"
              autoCapitalize="none"
            />
          </View>

          {/* Nom complet */}
          <View>
            <Text className="text-slate-700 font-medium mb-2">Nom complet</Text>
            <TextInput
              value={formData.profile.fullName}
              onChangeText={(text) => setFormData(prev => ({ 
                ...prev, 
                profile: { ...prev.profile, fullName: text }
              }))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900"
              placeholder="Votre nom complet"
            />
          </View>

          {/* Bio */}
          <View>
            <Text className="text-slate-700 font-medium mb-2">Bio</Text>
            <TextInput
              value={formData.profile.bio}
              onChangeText={(text) => setFormData(prev => ({ 
                ...prev, 
                profile: { ...prev.profile, bio: text }
              }))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 h-24"
              placeholder="Parlez de vous..."
              multiline
              textAlignVertical="top"
              maxLength={160}
            />
            <Text className="text-slate-400 text-xs mt-1 text-right">
              {formData.profile.bio.length}/160
            </Text>
          </View>

          {/* Localisation */}
          <View>
            <Text className="text-slate-700 font-medium mb-2">Localisation</Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <MapPin size={16} color="#64748b" />
              <TextInput
                value={formData.profile.location}
                onChangeText={(text) => setFormData(prev => ({ 
                  ...prev, 
                  profile: { ...prev.profile, location: text }
                }))}
                className="flex-1 ml-2 text-slate-900"
                placeholder="Où habitez-vous ?"
              />
            </View>
          </View>

          {/* Site web */}
          <View>
            <Text className="text-slate-700 font-medium mb-2">Site web</Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <Link size={16} color="#64748b" />
              <TextInput
                value={formData.profile.website}
                onChangeText={(text) => setFormData(prev => ({ 
                  ...prev, 
                  profile: { ...prev.profile, website: text }
                }))}
                className="flex-1 ml-2 text-slate-900"
                placeholder="https://example.com"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Date de naissance */}
          <View>
            <Text className="text-slate-700 font-medium mb-2">Date de naissance</Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <Calendar size={16} color="#64748b" />
              <TextInput
                value={formData.profile.birthDate}
                onChangeText={(text) => setFormData(prev => ({ 
                  ...prev, 
                  profile: { ...prev.profile, birthDate: text }
                }))}
                className="flex-1 ml-2 text-slate-900"
                placeholder="JJ/MM/AAAA"
              />
            </View>
          </View>

          {/* Genre */}
          <View>
            <Text className="text-slate-700 font-medium mb-2">Genre</Text>
            <View className="flex-row flex-wrap gap-2">
              {(['male', 'female', 'other', 'prefer_not_to_say'] as const).map((gender) => (
                <TouchableOpacity
                  key={gender}
                  onPress={() => setFormData(prev => ({
                    ...prev,
                    profile: { ...prev.profile, gender }
                  }))}
                  className={`px-4 py-2 rounded-full border ${
                    formData.profile.gender === gender
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <Text className={
                    formData.profile.gender === gender
                      ? 'text-white font-medium'
                      : 'text-slate-700'
                  }>
                    {gender === 'male' && 'Homme'}
                    {gender === 'female' && 'Femme'}
                    {gender === 'other' && 'Autre'}
                    {gender === 'prefer_not_to_say' && 'Ne pas préciser'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Espace en bas */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  )
}