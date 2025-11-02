// app/(modals)/followers.tsx
import { View, Text, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import type { RootState } from "@/redux/store"
import { getUserById } from "@/redux/userSlice"
import { router, useLocalSearchParams } from "expo-router"
import { X, User, Check, ArrowLeft } from "lucide-react-native"
import { useTheme } from "@/hooks/toggleChangeTheme"

export default function UserFollowersModal() {
  const { userId } = useLocalSearchParams()
  const dispatch = useAppDispatch()
  const { currentUser } = useAppSelector((state: RootState) => state.user)
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme()

  useEffect(() => {
    console.log('🎯 Followers Modal - userId:', userId);
    
    if (userId) {
      loadUserProfile();
    }
  }, [userId])

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement du profil:', userId);
      
      const result = await dispatch(getUserById(userId as string)).unwrap();
      
      console.log('✅ Profil chargé avec followers:', {
        username: result.username,
        followersCount: result.social?.followers?.length,
        followers: result.social?.followers
      });
      
      setUserProfile(result);
    } catch (error: any) {
      console.error('❌ Erreur chargement profil:', error);
      Alert.alert("Erreur", error.message || "Impossible de charger les abonnés");
    } finally {
      setLoading(false);
    }
  }

  const handleUserPress = (followerUserId: string) => {
    console.log('👤 Navigation vers:', followerUserId);
    
    if (followerUserId === currentUser?._id) {
      router.dismissTo('/profile');
    } else {
      router.push(`/(modals)/userProfile/${followerUserId}`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-black">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-slate-500 mt-4">Chargement des abonnés...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ⭐ CORRECTION: Accéder correctement aux followers
  const followers = userProfile?.social?.followers || [];

  console.log('📊 RENDU - Followers à afficher:', followers.length);
  console.log('🔍 Détail followers:', followers);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View className="flex-row items-center p-4 border-b border-slate-200 dark:border-slate-700">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="p-2 mr-2"
        >
          <ArrowLeft size={24} color={isDark ? 'white' : 'black'} />
        </TouchableOpacity>
        <View>
          <Text className="text-xl font-bold text-slate-900 dark:text-white">
            Abonnés
          </Text>
          <Text className="text-slate-500 dark:text-slate-400 text-sm">
            {userProfile?.username} • {followers.length} abonnés
          </Text>
        </View>
      </View>

      {/* ⭐ CORRECTION: Vérifier que followers est un array avant de render */}
      {Array.isArray(followers) && followers.length > 0 ? (
        <FlatList
          data={followers}
          keyExtractor={(item, index) => {
            // Les followers sont déjà des objets complets
            return item._id || `follower-${index}`;
          }}
          renderItem={({ item }) => {
            // item est déjà un objet utilisateur complet
            const follower = item;
            
            console.log('🎨 Rendu follower:', follower._id, follower.username);

            return (
              <TouchableOpacity 
                className="flex-row items-center p-4 border-b border-slate-100 dark:border-slate-800 active:bg-slate-50 dark:active:bg-slate-800"
                onPress={() => handleUserPress(follower._id)}
              >
                {/* Photo de profil */}
                {follower.profile?.profilePicture ? (
                  <Image
                    source={{ uri: follower.profile.profilePicture }}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                ) : (
                  <View className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 mr-3 items-center justify-center">
                    <User size={20} color="#64748b" />
                  </View>
                )}
                
                <View className="flex-1">
                  <Text className="font-semibold text-slate-900 dark:text-white text-base">
                    {follower.username || 'Utilisateur'}
                  </Text>
                  <Text className="text-slate-500 dark:text-slate-400 text-sm">
                    {follower.profile?.fullName || ''}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        // ⭐ CORRECTION: Message vide amélioré
        <View className="flex-1 justify-center items-center py-20 px-6">
          <Text className="text-slate-500 dark:text-slate-400 text-lg text-center mb-2">
            Aucun abonné
          </Text>
          <Text className="text-slate-400 dark:text-slate-500 text-sm text-center">
            {userProfile?.username} n'a pas encore d'abonnés
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}