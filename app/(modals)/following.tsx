// app/(modals)/following.tsx
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { router } from "expo-router"
import { X, User, UserMinus } from "lucide-react-native"

export default function FollowingModal() {
  const dispatch = useDispatch()
  const { currentUser } = useSelector((state: RootState) => state.user)
  const [following, setFollowing] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFollowing()
  }, [])

  const loadFollowing = async () => {
    // Simulation - À remplacer par un appel API réel
    setTimeout(() => {
      setFollowing([
        {
          _id: "1",
          username: "mariecurie",
          profile: { profilePicture: null, firstName: "Marie", lastName: "Curie" }
        },
        {
          _id: "2",
          username: "alberteinstein", 
          profile: { profilePicture: null, firstName: "Albert", lastName: "Einstein" }
        },
        {
          _id: "3",
          username: "adalovelace",
          profile: { profilePicture: null, firstName: "Ada", lastName: "Lovelace" }
        }
      ])
      setLoading(false)
    }, 1000)
  }

  const handleUnfollow = (userId: string, username: string) => {
    Alert.alert(
      "Se désabonner",
      `Êtes-vous sûr de vouloir vous désabonner de ${username} ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Se désabonner", 
          style: "destructive",
          onPress: () => {
            // TODO: Implémenter le unfollow
            setFollowing(prev => prev.filter(user => user._id !== userId))
            Alert.alert("Succès", `Vous ne suivez plus ${username}`)
          }
        }
      ]
    )
  }

  const renderFollowingItem = ({ item }: any) => (
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
        onPress={() => handleUnfollow(item._id, item.username)}
        className="border border-slate-300 px-4 py-2 rounded-full active:bg-slate-50"
      >
        <Text className="text-slate-700 text-sm font-medium">Abonné</Text>
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
          <Text className="text-lg font-semibold text-slate-900">Abonnements</Text>
          <Text className="text-slate-500 text-sm">{following.length} personnes</Text>
        </View>
        
        <View className="w-10" />
      </View>

      {/* Liste */}
      <FlatList
        data={following}
        keyExtractor={(item) => item._id}
        renderItem={renderFollowingItem}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-12">
            {loading ? (
              <>
                <Text className="text-slate-500 text-lg">Chargement...</Text>
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