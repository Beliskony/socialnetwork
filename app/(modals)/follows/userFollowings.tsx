import { View, Text, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import type { RootState } from "@/redux/store"
import { getUserById } from "@/redux/userSlice"
import { router, useLocalSearchParams } from "expo-router"
import { X, User, Check, ArrowLeft } from "lucide-react-native"
import { useTheme } from "@/hooks/toggleChangeTheme"

export default function UserFollowingModal() {
  const { userId } = useLocalSearchParams()
  const dispatch = useAppDispatch()
  const { currentUser } = useAppSelector((state: RootState) => state.user)
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme()

  useEffect(() => {
    if (userId) {
      loadUserProfile();
    }
  }, [userId])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      const result = await dispatch(getUserById(userId as string)).unwrap()
      setUserProfile(result)
    } catch (error) {
      console.error('Erreur chargement profil:', error)
      Alert.alert("Erreur", "Impossible de charger les abonnements")
    } finally {
      setLoading(false)
    }
  }
    
  const handleUserPress = (followingUserId: string) => {
    if (followingUserId === currentUser?._id) {
      router.dismissTo('/profile');
    } else {
      router.push(`/(modals)/userProfile/${followingUserId}`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-black">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-slate-500 mt-4">Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }
    
  const followings = userProfile?.social?.following || [];  

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-slate-200 dark:border-slate-700">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="p-2 mr-2"
        >
          <ArrowLeft size={24} color={isDark ? 'white' : 'black'} />
        </TouchableOpacity>
        <View>
          <Text className="text-xl font-bold text-slate-900 dark:text-white">
            Abonnements
          </Text>
          <Text className="text-slate-500 dark:text-slate-400 text-sm">
            {userProfile?.username} • {followings.length} abonnements
          </Text>
        </View>
      </View>

      {/* Liste des followings */}
      <FlatList
        data={followings}
        keyExtractor={(item, index) => 
          typeof item === 'object' ? item._id || item.$oid : `following-${index}`
        }
        renderItem={({ item }) => {
          const following = typeof item === 'object' ? item : { _id: item };
          
          return (
            <TouchableOpacity 
              className="flex-row items-center p-4 border-b border-slate-100 dark:border-slate-800 active:bg-slate-50 dark:active:bg-slate-800"
              onPress={() => handleUserPress(following._id)}
            >
              {/* Photo de profil */}
              {following.profile?.profilePicture ? (
                <Image
                  source={{ uri: following.profile.profilePicture }}
                  className="w-12 h-12 rounded-full mr-3"
                />
              ) : (
                <View className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 mr-3 items-center justify-center">
                  <User size={20} color="#64748b" />
                </View>
              )}
              
              <View className="flex-1">
                <Text className="font-semibold text-slate-900 dark:text-white text-base">
                  {following.username || 'Utilisateur'}
                </Text>
                <Text className="text-slate-500 dark:text-slate-400 text-sm">
                  {following.profile?.fullName || ''}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-20 px-6">
            <Text className="text-slate-500 dark:text-slate-400 text-lg text-center mb-2">
              Aucun abonnement
            </Text>
            <Text className="text-slate-400 dark:text-slate-500 text-sm text-center">
              {userProfile?.username} ne suit personne pour le moment
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}