// app/(modals)/followers.tsx
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { getUserById } from "@/redux/userSlice"
import { router } from "expo-router"
import { X, User, UserPlus, UserCheck } from "lucide-react-native"

export default function FollowersModal() {
  const dispatch = useDispatch()
  const { currentUser } = useSelector((state: RootState) => state.user)
  const [followers, setFollowers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFollowers()
  }, [])

  const loadFollowers = async () => {
    // Simulation - À remplacer par un appel API réel
    setTimeout(() => {
      setFollowers([
        {
          _id: "1",
          username: "johndoe",
          profile: { profilePicture: null, firstName: "John", lastName: "Doe" }
        },
        {
          _id: "2", 
          username: "janesmith",
          profile: { profilePicture: null, firstName: "Jane", lastName: "Smith" }
        }
      ])
      setLoading(false)
    }, 1000)
  }

  const handleFollow = (userId: string) => {
    // TODO: Implémenter le follow/unfollow
    Alert.alert("Follow", `Follow user ${userId}`)
  }

  const renderFollowerItem = ({ item }: any) => (
    <TouchableOpacity 
      className="flex-row items-center justify-between p-4 border-b border-slate-100 active:bg-slate-50"
      onPress={() => {
        //router.push(`/(modals)/user-profile?userId=${item._id}`)
      }}
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
          <Text className="font-semibold text-slate-900">
            {item.profile?.firstName} {item.profile?.lastName}
          </Text>
          <Text className="text-slate-500 text-sm">@{item.username}</Text>
        </View>
      </View>

      <TouchableOpacity 
        onPress={() => handleFollow(item._id)}
        className="bg-blue-600 px-4 py-2 rounded-full"
      >
        <Text className="text-white text-sm font-medium">Suivre</Text>
      </TouchableOpacity>
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
          <Text className="text-slate-500 text-sm">{followers.length} personnes</Text>
        </View>
        
        <View className="w-10" />
      </View>

      {/* Liste */}
      <FlatList
        data={followers}
        keyExtractor={(item) => item._id}
        renderItem={renderFollowerItem}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-12">
            {loading ? (
              <>
                <Text className="text-slate-500 text-lg">Chargement...</Text>
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