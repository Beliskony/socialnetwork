import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import MePost from "@/components/Posts/MePost"
import { formatCount } from "@/services/Compteur"

function Me() {
  const correctUser = useSelector((state: RootState) => state.user)

  if (!correctUser) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 w-full items-center justify-center">
        <Text className="text-lg font-semibold text-center text-slate-700">Chargement du profil...</Text>
      </SafeAreaView>
    )
  }

  return (
    <View className="flex-1 gap-y-4 bg-slate-50">
      <ScrollView contentContainerStyle={{ alignItems: "center" }}>
        <View className="w-full h-40 bg-gradient-to-br from-slate-800 to-slate-900 relative">
          <Image source={{ uri: correctUser.profilePicture }} className="w-full h-full opacity-40" resizeMode="cover" />
        </View>

        <View className="w-full items-center bg-white mb-1 shadow-lg rounded-t-3xl -mt-6 pt-2">
          <View className="-mt-16 w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
            <Image source={{ uri: correctUser.profilePicture }} className="w-full h-full" resizeMode="cover" />
          </View>

          <Text className="text-2xl font-bold mt-3 text-slate-900">{correctUser.username}</Text>
          <Text className="text-base text-slate-500 mt-1">@{correctUser.username}</Text>

          <View className="flex-row mt-5 space-x-4 gap-x-3">
            <TouchableOpacity className="px-7 py-3 border-2 border-slate-200 rounded-full shadow-sm active:bg-slate-50">
              <Text className="text-sm font-semibold text-slate-700">Message</Text>
            </TouchableOpacity>
            <TouchableOpacity className="px-7 py-3 bg-blue-500 rounded-full shadow-md active:bg-blue-600">
              <Text className="text-sm font-semibold text-white">Modifier</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between gap-x-8 w-full px-10 mt-7 pb-6">
            <View className="items-center">
              <Text className="text-2xl font-bold text-slate-900">{formatCount(correctUser.followersCount)}</Text>
              <Text className="text-sm text-slate-500 mt-1">Abonnés</Text>
            </View>

            <View className="items-center">
              <Text className="text-2xl font-bold text-slate-900">{formatCount(1000)}</Text>
              <Text className="text-sm text-slate-500 mt-1">Abonnements</Text>
            </View>

            <View className="items-center">
              <Text className="text-2xl font-bold text-slate-900">{correctUser.postsCount}</Text>
              <Text className="text-sm text-slate-500 mt-1">Publications</Text>
            </View>
          </View>
        </View>

        <View className="w-full px-4 mt-2 mb-20 bg-white rounded-xl">
          <MePost />
        </View>
      </ScrollView>
    </View>
  )
}

export default Me
