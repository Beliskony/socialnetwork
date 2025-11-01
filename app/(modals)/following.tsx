// app/(modals)/following.tsx
import { View, Text, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useEffect } from "react"
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

  const handleUnfollow = async (targetId: string, username: string) => {
    Alert.alert(
      "Se désabonner",
      `Êtes-vous sûr de vouloir vous désabonner de ${username} ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Se désabonner", 
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(toggleFollow(targetId)).unwrap()
              
              // Mettre à jour localement le statut
              dispatch(updateFollowerStatus({ 
                userId: targetId, 
                isFollowing: false 
              }))
              
              // Recharger la liste
              await dispatch(loadFollowingsDetails(currentUser!.social.following)).unwrap()
              
              Alert.alert("Succès", `Vous ne suivez plus ${username}`)
            } catch (error: any) {
              Alert.alert("Erreur", error.message || "Erreur lors du désabonnement")
            }
          }
        }
      ]
    )
  }

  const navigateToProfile = (userId: string) => {
    //router.push(`/(app)/profile/${userId}`)
  }

  const renderFollowingItem = ({ item }: { item: any }) => (
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
          onPress={() => handleUnfollow(item._id, item.username)}
          className="border border-slate-300 px-4 py-2 rounded-full active:bg-slate-50"
          disabled={loading}
        >
          <View className="flex-row items-center">
            <Check size={16} color="#64748b" />
            <Text className="text-slate-700 text-sm font-medium ml-1">
              Abonné
            </Text>
          </View>
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