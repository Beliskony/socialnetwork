// app/(modals)/followers.tsx
import { View, Text, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import type { RootState } from "@/redux/store"
import { toggleFollow, loadFollowersDetails, updateFollowerStatus } from "@/redux/userSlice"
import { router } from "expo-router"
import { X, User, Check } from "lucide-react-native"

export default function FollowersModal() {
  const dispatch = useAppDispatch()
  const { 
    currentUser, 
    followersDetails, 
    followersLoading,
    loading 
  } = useAppSelector((state: RootState) => state.user)

  const targetUserId = currentUser?._id

  useEffect(() => {
    if (currentUser?.social?.followers && currentUser.social.followers.length > 0) {
      console.log('🔍 DEBUG - Données followers disponibles:', currentUser.social.followers);
      loadFollowers()
    }
  }, [currentUser, targetUserId])

  const loadFollowers = async () => {
    try {
      // CORRECTION: utilisation correcte de dispatch avec unwrap()
      await dispatch(loadFollowersDetails(currentUser!.social.followers)).unwrap()
    } catch (error) {
      console.error("Erreur chargement abonnés:", error)
      Alert.alert("Erreur", "Impossible de charger les abonnés")
    }
  }

  const handleFollow = async (targetId: string, currentIsFollowing: boolean = false) => {
    try {
      // CORRECTION: utilisation correcte de dispatch avec unwrap()
      await dispatch(toggleFollow(targetId)).unwrap()
      
      // CORRECTION: mise à jour du statut local
      dispatch(updateFollowerStatus({ 
        userId: targetId, 
        isFollowing: !currentIsFollowing 
      }))
      
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Erreur lors du follow/unfollow")
    }
  }

  const navigateToProfile = (userId: string) => {
    //router.push(`/(app)/profile/${userId}`)
  }

  const renderFollowerItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      className="flex-row items-center justify-between p-4 border-b border-slate-100 active:bg-slate-50"
      onPress={() => navigateToProfile(item._id)}
    >
      <View className="flex-row items-center flex-1">
        {item.profile?.profilePicture ? (
          <Image
            source={{ uri: item.profile.profilePicture }}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <View className="w-12 h-12 rounded-full bg-slate-300 items-center justify-center">
            <User size={20} color="#64748b" />
          </View>
        )}
        
        <View className="ml-3 flex-1">
          <Text className="font-semibold text-slate-900" numberOfLines={1}>
            {item.profile?.fullName || item.username}
          </Text>
          <Text className="text-slate-500 text-sm">@{item.username}</Text>
        </View>
      </View>

      {item._id !== currentUser?._id && (
        <TouchableOpacity 
          onPress={() => handleFollow(item._id, item.isFollowing)}
          className={`px-4 py-2 rounded-full border ${
            item.isFollowing 
              ? 'bg-white border-slate-300' 
              : 'bg-blue-600 border-blue-600'
          }`}
          disabled={loading}
        >
          {item.isFollowing ? (
            <View className="flex-row items-center">
              <Check size={16} color="#64748b" />
              <Text className="text-slate-700 text-sm font-medium ml-1">
                Suivi
              </Text>
            </View>
          ) : (
            <Text className="text-white text-sm font-medium">Suivre</Text>
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <X size={24} color="#64748b" />
        </TouchableOpacity>
        
        <View className="items-center">
          <Text className="text-lg font-semibold text-slate-900">Abonnés</Text>
          <Text className="text-slate-500 text-sm">
            {followersLoading ? '...' : followersDetails.length} 
            {followersDetails.length <= 1 ? ' personne' : ' personnes'}
          </Text>
        </View>
        
        <View className="w-10" />
      </View>

      {/* Liste */}
      <FlatList
        data={followersDetails}
        keyExtractor={(item) => item._id}
        renderItem={renderFollowerItem}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-12">
            {followersLoading ? (
              <>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="text-slate-500 text-lg mt-4">Chargement des abonnés...</Text>
              </>
            ) : (
              <>
                <User size={48} color="#cbd5e1" />
                <Text className="text-slate-500 text-lg mt-4">Aucun abonné</Text>
                <Text className="text-slate-400 text-sm mt-2 text-center px-8">
                  Les personnes qui vous suivent apparaîtront ici
                </Text>
              </>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  )
}