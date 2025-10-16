// app/(modals)/edit-profile.tsx
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import type { RootState } from "@/redux/store"
import { updateUserProfile } from "@/redux/userSlice"
import { router } from "expo-router"
import { X, Camera, User, MapPin, Link, Calendar } from "lucide-react-native"

export default function EditProfileModal() {
  const dispatch = useAppDispatch()
  const { currentUser, loading } = useSelector((state: RootState) => state.user)
  
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    profile: {
      fullName: currentUser?.profile?.fullName || '',
      bio: currentUser?.profile?.bio || '',
      location: currentUser?.profile?.location || '',
      website: currentUser?.profile?.website || '',
      birthDate: currentUser?.profile?.birthDate || '',
    }
  })

  const handleSave = async () => {
    try {
      await dispatch(updateUserProfile(formData)).unwrap()
      Alert.alert("Succès", "Profil mis à jour avec succès")
      router.back()
    } catch (error: any) {
      Alert.alert("Erreur", error || "Impossible de mettre à jour le profil")
    }
  }

  const handleChangePhoto = () => {
    Alert.alert(
      "Changer la photo",
      "Fonctionnalité à implémenter avec expo-image-picker",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Ouvrir la galerie" },
        { text: "Prendre une photo" }
      ]
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <X size={24} color="#64748b" />
        </TouchableOpacity>
        
        <Text className="text-lg font-semibold text-slate-900">Modifier le profil</Text>
        
        <TouchableOpacity 
          onPress={handleSave}
          disabled={loading}
          className="bg-blue-600 px-4 py-2 rounded-full"
        >
          <Text className="text-white font-semibold">
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Photo de profil */}
        <View className="items-center py-6 border-b border-slate-100">
          <View className="relative">
            {currentUser?.profile?.profilePicture ? (
              <Image
                source={{ uri: currentUser.profile.profilePicture }}
                className="w-24 h-24 rounded-full"
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-slate-300 items-center justify-center">
                <User size={32} color="#64748b" />
              </View>
            )}
            <TouchableOpacity 
              onPress={handleChangePhoto}
              className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full border-2 border-white items-center justify-center"
            >
              <Camera size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-blue-600 font-medium mt-3">Changer la photo</Text>
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
            />
          </View>

          {/* Prénom */}
          <View>
            <Text className="text-slate-700 font-medium mb-2">Nom complet</Text>
            <TextInput
              value={formData.profile.fullName}
              onChangeText={(text) => setFormData(prev => ({ 
                ...prev, 
                profile: { ...prev.profile, firstName: text }
              }))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900"
              placeholder="nom & prénom"
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
            />
            <Text className="text-slate-400 text-xs mt-1 text-right">
              {formData.profile.bio.length}/160
            </Text>
          </View>

          {/* Localisation */}
          <View>
            <Text className="text-slate-700 font-medium mb-2">
              <MapPin size={16} color="#64748b" className="mr-2" />
              Localisation
            </Text>
            <TextInput
              value={formData.profile.location}
              onChangeText={(text) => setFormData(prev => ({ 
                ...prev, 
                profile: { ...prev.profile, location: text }
              }))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900"
              placeholder="Où habitez-vous ?"
            />
          </View>

          {/* Site web */}
          <View>
            <Text className="text-slate-700 font-medium mb-2">
              <Link size={16} color="#64748b" className="mr-2" />
              Site web
            </Text>
            <TextInput
              value={formData.profile.website}
              onChangeText={(text) => setFormData(prev => ({ 
                ...prev, 
                profile: { ...prev.profile, website: text }
              }))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900"
              placeholder="https://example.com"
              keyboardType="url"
            />
          </View>

          {/* Date de naissance */}
          <View>
            <Text className="text-slate-700 font-medium mb-2">
              <Calendar size={16} color="#64748b" className="mr-2" />
              Date de naissance
            </Text>
            <TextInput
              value={formData.profile.birthDate}
              onChangeText={(text) => setFormData(prev => ({ 
                ...prev, 
                profile: { ...prev.profile, birthDate: text }
              }))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900"
              placeholder="JJ/MM/AAAA"
            />
          </View>
        </View>

        {/* Espace en bas */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  )
}