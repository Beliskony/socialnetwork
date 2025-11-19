// app/(modals)/following.tsx
import { View, Text, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { loadFollowingsDetails, toggleFollow, updateFollowerStatus } from "@/redux/userSlice"
import { router } from "expo-router"
import { X, User, UserMinus, Check } from "lucide-react-native"

export default function FollowingModal() {
  const dispatch = useAppDispatch()
  const { 
    currentUser, 
    followingDetails, 
    followingLoading,
    loading 
  } = useAppSelector((state) => state.user)
  const [localLoading, setLocalLoading] = useState<string | null>(null)
  const [optimisticFollowing, setOptimisticFollowing] = useState<any[]>([])

    useEffect(() => {
    if (followingDetails.length > 0) {
      setOptimisticFollowing(followingDetails)
    }
  }, [followingDetails])


  useEffect(() => {
    if (currentUser?.social?.following && currentUser.social.following.length > 0) {
      console.log('🔍 DEBUG - Données followers disponibles:', currentUser.social.following);
      loadFollowing()
    }
  }, [currentUser])

  const loadFollowing = async () => {
    try {
      await dispatch(loadFollowingsDetails(currentUser!.social.following)).unwrap()
    } catch (error) {
      console.error("Erreur chargement des abonnements:", error)
      Alert.alert("Erreur", "Impossible de charger les abonnements")
    }
  }

   // Fonction pour vérifier si l'utilisateur suit cette personne
  const isUserFollowing = (userId: string): boolean => {
    return currentUser?.social?.following?.includes(userId) || false
  }

  const handleFollowToggle = async (targetId: string, username: string) => {
    setLocalLoading(targetId)
    
    try {
      const currentUserItem = optimisticFollowing.find(user => user._id === targetId)
      const currentIsFollowing = currentUserItem?.isFollowing ?? true
      const newFollowingStatus = !currentIsFollowing
       // Mise à jour OPTIMISTE IMMÉDIATE
      if (newFollowingStatus === false) {
        // Si on se désabonne, retirer immédiatement de la liste
        setOptimisticFollowing(prev => 
          prev.filter(user => user._id !== targetId)
        )
      } else {
        // Si on follow à nouveau, mettre à jour le statut
        setOptimisticFollowing(prev => 
          prev.map(user => 
            user._id === targetId 
              ? { ...user, isFollowing: newFollowingStatus }
              : user
          )
        )
      }
      // Mettre à jour le state Redux
      dispatch(updateFollowerStatus({ 
        userId: targetId, 
        isFollowing: newFollowingStatus 
      }))

      // Action API (silencieuse)
      await dispatch(toggleFollow(targetId)).unwrap()
      
    } catch (error: any) {
      console.error("Erreur follow/unfollow:", error)
      
      await loadFollowing()
      
      Alert.alert("Erreur", error.message || "Erreur lors de l'action")
    } finally {
      setLocalLoading(null)
    }
  }

  const handleUnfollowWithConfirmation = (targetId: string, username: string) => {
    Alert.alert(
      "Se désabonner",
      `Êtes-vous sûr de vouloir vous désabonner de ${username} ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Se désabonner", 
          style: "destructive",
          onPress: () => handleFollowToggle(targetId, username)
        }
      ]
    )
  }

  const navigateToProfile = (userId: string) => {
    if (userId === currentUser?._id) {
      router.push("/profile")
    } else {
      router.push(`/userProfile/${userId}`)
    }
  }

  const renderFollowingItem = ({ item }: { item: any }) => {
    const isFollowing = isUserFollowing(item._id)
    const isLoading = localLoading === item._id

    return (
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
            onPress={(e) => {
              e.stopPropagation()
              handleUnfollowWithConfirmation(item._id, item.username)
            }}
            className={`px-4 py-2 rounded-full border min-w-[80px] items-center justify-center ${
              isFollowing 
                ? 'bg-white border-slate-300' 
                : 'bg-blue-600 border-blue-600'
            } ${isLoading ? 'opacity-60' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={isFollowing ? "#64748b" : "#ffffff"} />
            ) : isFollowing ? (
              <View className="flex-row items-center">
                <UserMinus size={16} color="#64748b" />
                <Text className="text-slate-700 text-sm font-medium ml-1">
                  Abonné
                </Text>
              </View>
            ) : (
              <Text className="text-white text-sm font-medium">Suivre</Text>
            )}
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    )
  }


  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <X size={24} color="#64748b" />
        </TouchableOpacity>
        
        <View className="items-center">
          <Text className="text-lg font-semibold text-slate-900">Abonnements</Text>
          <Text className="text-slate-500 text-sm">
            {followingLoading ? '...' : followingDetails.length} 
            {followingDetails.length <= 1 ? ' personne' : ' personnes'}
          </Text>
        </View>
        
        <View className="w-10" />
      </View>

      {/* Liste */}
      <FlatList
        data={followingDetails}
        keyExtractor={(item) => item._id}
        renderItem={renderFollowingItem}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-12">
            {followingLoading ? (
              <>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="text-slate-500 text-lg mt-4">Chargement des abonnements...</Text>
              </>
            ) : (
              <>
                <User size={48} color="#cbd5e1" />
                <Text className="text-slate-500 text-lg mt-4">Aucun abonnement</Text>
                <Text className="text-slate-400 text-sm mt-2 text-center px-8">
                  Les personnes que vous suivez apparaîtront ici
                </Text>
              </>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  )
}