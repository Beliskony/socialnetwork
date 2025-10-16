// app/(modals)/blocked-users.tsx
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import type { RootState } from "@/redux/store"
import { unblockUser, getBlockedUsers } from "@/redux/userSlice"
import { router } from "expo-router"
import { X, User, Ban, UserCheck } from "lucide-react-native"

export default function BlockedUsersModal() {
  const dispatch = useAppDispatch()
  const { blockedUsers } = useAppSelector((state: RootState) => state.user)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadBlockedUsers()
  }, [])

  const loadBlockedUsers = async () => {
    setLoading(true)
    try {
      await dispatch(getBlockedUsers()).unwrap()
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les utilisateurs bloqués")
    } finally {
      setLoading(false)
    }
  }

  const handleUnblock = (userId: string, username: string) => {
    Alert.alert(
      "Débloquer",
      `Êtes-vous sûr de vouloir débloquer ${username} ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Débloquer", 
          onPress: async () => {
            try {
              await dispatch(unblockUser(userId)).unwrap()
              Alert.alert("Succès", `${username} a été débloqué`)
            } catch (error: any) {
              Alert.alert("Erreur", error || "Impossible de débloquer l'utilisateur")
            }
          }
        }
      ]
    )
  }

  const renderBlockedUserItem = ({ item }: any) => (
    <View className="flex-row items-center justify-between p-4 border-b border-slate-100">
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
          <Text className="font-semibold text-slate-900">
            {item.profile?.firstName} {item.profile?.lastName}
          </Text>
          <Text className="text-slate-500 text-sm">@{item.username}</Text>
        </View>
      </View>

      <TouchableOpacity 
        onPress={() => handleUnblock(item._id, item.username)}
        className="bg-green-600 px-4 py-2 rounded-full flex-row items-center"
      >
        <UserCheck size={16} color="white" />
        <Text className="text-white text-sm font-medium ml-2">Débloquer</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <X size={24} color="#64748b" />
        </TouchableOpacity>
        
        <View className="items-center">
          <Text className="text-lg font-semibold text-slate-900">Utilisateurs bloqués</Text>
          <Text className="text-slate-500 text-sm">{blockedUsers.length} personnes</Text>
        </View>
        
        <View className="w-10" />
      </View>

      {/* Liste */}
      <FlatList
        data={blockedUsers}
        keyExtractor={(item) => item._id}
        renderItem={renderBlockedUserItem}
        refreshing={loading}
        onRefresh={loadBlockedUsers}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-12">
            {loading ? (
              <>
                <Text className="text-slate-500 text-lg">Chargement...</Text>
              </>
            ) : (
              <>
                <Ban size={48} color="#cbd5e1" />
                <Text className="text-slate-500 text-lg mt-4">Aucun utilisateur bloqué</Text>
                <Text className="text-slate-400 text-sm mt-2 text-center px-8">
                  Les utilisateurs que vous bloquez apparaîtront ici
                </Text>
              </>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  )
}