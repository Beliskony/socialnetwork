// app/(tabs)/profile.tsx
import { View, Text, Image, TouchableOpacity, ScrollView, RefreshControl, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import MePost from "@/components/Posts/MePost"
import { formatCount } from "@/services/Compteur"
import { useState } from "react"
import { useAppDispatch } from "@/redux/hooks"
import { logout } from "@/redux/userSlice"
import { router } from "expo-router"
import { Settings, Edit3, Share2, Mail, Camera } from "lucide-react-native"

function ProfileScreen() {
  const { currentUser, token } = useSelector((state: RootState) => state.user)
  const dispatch = useAppDispatch()
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'likes'>('posts')

  const onRefresh = async () => {
    setRefreshing(true)
    // TODO: Implémenter le refresh des données utilisateur
    // await dispatch(getCurrentUser()).unwrap()
    setTimeout(() => setRefreshing(false), 1000)
  }

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Déconnexion", 
          style: "destructive",
          onPress: () => {
            dispatch(logout())
            //router.replace('/(auth)/login')
          }
        }
      ]
    )
  }

  const handleEditProfile = () => {
    //router.push('/(modals)/edit-profile')
  }

  const handleShareProfile = () => {
    // TODO: Implémenter le partage de profil
    Alert.alert("Partager", "Fonctionnalité de partage à implémenter")
  }

  if (!currentUser || !token) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center px-8">
        <Text className="text-lg font-semibold text-slate-900 text-center mb-4">
          Connectez-vous pour voir votre profil
        </Text>
        <TouchableOpacity 
          className="bg-blue-600 px-6 py-3 rounded-full active:bg-blue-700"
          //onPress={() => router.push('/(auth)/login')}
        >
          <Text className="text-white font-semibold">Se connecter</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  // Calcul des statistiques depuis l'interface User
  const stats = {
    posts: currentUser.content?.posts?.length || 0,
    followers: currentUser.social?.followers?.length || 0,
    following: currentUser.social?.following?.length || 0,
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
      >
        {/* Header avec bannière */}
        <View className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
          {currentUser.profile?.coverPicture ? (
            <Image 
              source={{ uri: currentUser.profile.coverPicture }} 
              className="w-full h-full"
              resizeMode="cover" 
            />
          ) : (
            <View className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
          )}
          
          {/* Boutons d'action header */}
          <View className="absolute top-12 right-4 flex-row space-x-2">
            <TouchableOpacity 
              className="w-10 h-10 bg-white/20 rounded-full items-center justify-center active:bg-white/30"
              onPress={handleShareProfile}
            >
              <Share2 size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              className="w-10 h-10 bg-white/20 rounded-full items-center justify-center active:bg-white/30"
              //onPress={() => router.push('/(modals)/settings')}
            >
              <Settings size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section informations profil */}
        <View className="w-full bg-white rounded-t-3xl -mt-8 pt-6 px-6">
          {/* Photo de profil */}
          <View className="absolute -top-16 left-6">
            <View className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-xl">
              {currentUser.profile?.profilePicture ? (
                <Image 
                  source={{ uri: currentUser.profile.profilePicture }} 
                  className="w-full h-full rounded-full" 
                  resizeMode="cover" 
                />
              ) : (
                <View className="w-full h-full rounded-full bg-slate-300 items-center justify-center">
                  <Text className="text-white text-2xl font-bold">
                    {currentUser.username?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <TouchableOpacity 
                className="absolute bottom-1 right-1 w-8 h-8 bg-blue-600 rounded-full border-2 border-white items-center justify-center active:bg-blue-700"
                onPress={handleEditProfile}
              >
                <Camera size={12} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Nom et informations */}
          <View className="ml-36 pb-4">
            <Text className="text-2xl font-bold text-slate-900">
              {currentUser.profile?.fullName || currentUser.username}
  
            </Text>
            <Text className="text-slate-500 mt-1">@{currentUser.username}</Text>
            
            {currentUser.profile?.bio && (
              <Text className="text-slate-700 mt-3 leading-5 text-sm">
                {currentUser.profile.bio}
              </Text>
            )}
            
            {/* Informations supplémentaires */}
            <View className="flex-row flex-wrap gap-4 mt-3">
              {currentUser.profile?.location && (
                <Text className="text-slate-500 text-sm">📍 {currentUser.profile.location}</Text>
              )}
              {currentUser.profile?.website && (
                <Text className="text-blue-600 text-sm">🌐 {currentUser.profile.website}</Text>
              )}
            </View>
          </View>

          {/* Boutons d'action */}
          <View className="flex-row space-x-3 mt-4 pb-6">
            <TouchableOpacity 
              className="flex-1 bg-blue-600 py-3 rounded-xl shadow-sm active:bg-blue-700 flex-row items-center justify-center"
              onPress={handleEditProfile}
            >
              <Edit3 size={16} color="white" />
              <Text className="text-white font-semibold ml-2">Modifier le profil</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="w-12 h-12 border-2 border-slate-200 rounded-xl items-center justify-center active:bg-slate-50"
              onPress={() => Alert.alert("Messages", "Fonctionnalité messages à implémenter")}
            >
              <Mail size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Statistiques */}
          <View className="flex-row justify-between py-4 border-t border-slate-100">
            <View className="items-center flex-1">
              <Text className="text-xl font-bold text-slate-900">{formatCount(stats.posts)}</Text>
              <Text className="text-slate-500 text-sm mt-1">Publications</Text>
            </View>
            
            <TouchableOpacity 
              className="items-center flex-1 border-x border-slate-100 active:opacity-70"
              //onPress={() => router.push('/(modals)/followers')}
            >
              <Text className="text-xl font-bold text-slate-900">{formatCount(stats.followers)}</Text>
              <Text className="text-slate-500 text-sm mt-1">Abonnés</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="items-center flex-1 active:opacity-70"
              //onPress={() => router.push('/(modals)/following')}
            >
              <Text className="text-xl font-bold text-slate-900">{formatCount(stats.following)}</Text>
              <Text className="text-slate-500 text-sm mt-1">Abonnements</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Navigation par onglets */}
        <View className="bg-white mt-2 mx-4 rounded-xl shadow-sm border border-slate-200">
          <View className="flex-row border-b border-slate-100">
            {[
              { id: 'posts' as const, label: 'Publications' },
              { id: 'media' as const, label: 'Médias' },
              { id: 'likes' as const, label: 'J\'aime' }
            ].map((tab) => (
              <TouchableOpacity 
                key={tab.id}
                className={`flex-1 py-4 items-center ${activeTab === tab.id ? 'border-b-2 border-blue-600' : ''}`}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text className={`font-semibold text-sm ${
                  activeTab === tab.id ? 'text-blue-600' : 'text-slate-500'
                }`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Contenu des onglets */}
          <View className="min-h-96">
            {activeTab === 'posts' && <MePost />}
            {activeTab === 'media' && (
              <View className="items-center py-12">
                <Text className="text-slate-500 text-lg mb-2">Aucun média</Text>
                <Text className="text-slate-400 text-sm">Les photos et vidéos que vous publiez apparaîtront ici</Text>
              </View>
            )}
            {activeTab === 'likes' && (
              <View className="items-center py-12">
                <Text className="text-slate-500 text-lg mb-2">Aucun like</Text>
                <Text className="text-slate-400 text-sm">Les posts que vous likez apparaîtront ici</Text>
              </View>
            )}
          </View>
        </View>

        {/* Espace en bas */}
        <View className="h-20" />
      </ScrollView>
    </View>
  )
}

export default ProfileScreen