// app/(app)/profile/[userId].tsx
import { View, Text, Image, TouchableOpacity, ScrollView, RefreshControl, Alert, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { getUserById, toggleFollow } from "@/redux/userSlice"
import { router, useLocalSearchParams } from "expo-router"
import { ArrowLeft, Share2, Mail, MoreHorizontal, UserPlus, UserCheck, Globe, Cake, MapPin } from "lucide-react-native"
import UserPostsList from "@/components/Posts/UserPostList"
import { formatCount } from "@/services/Compteur"
import { useTheme } from "@/hooks/toggleChangeTheme"
import formatDateBirthDay from "@/services/FormatDate"

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams()
  const dispatch = useAppDispatch()
  const { currentUser, loading } = useAppSelector((state) => state.user)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'likes'>('posts')

  // Charger le profil utilisateur
  useEffect(() => {
    if (userId) {
      loadUserProfile()
    }
  }, [userId])

  const loadUserProfile = async () => {
    try {
      const result = await dispatch(getUserById(userId as string)).unwrap()
      setUserProfile(result)
      
      // Vérifier si l'utilisateur courant suit cet utilisateur
      if (currentUser && result.social?.followers) {
        const isUserFollowing = result.social.followers.some((follower: any) => {
          const followerId = typeof follower === 'object' ? follower._id || follower.$oid : follower
          return followerId === currentUser._id
        })
        setIsFollowing(isUserFollowing)
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error)
      Alert.alert("Erreur", "Impossible de charger le profil")
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadUserProfile()
    setRefreshing(false)
  }

  const handleFollowToggle = async () => {
    if (!userProfile) return
    
    try {
      await dispatch(toggleFollow(userProfile._id)).unwrap()
      setIsFollowing(!isFollowing)
      
      // Recharger le profil pour mettre à jour les compteurs
      await loadUserProfile()
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Erreur lors du follow/unfollow")
    }
  }


  // Handlers pour ProfilePostsList
  const handlePostPress = (post: any) => {
    console.log('Post press:', post._id)
    // router.push(`/post/${post._id}`)
  }

  const handleUserPress = (userId: string) => {
    if (userId !== currentUser?._id) {
      router.push(`../(app)/profile/${userId}`)
    }
  }

  const handleCommentPress = (post: any) => {
    console.log('Comment press:', post._id)
  }

  if (loading && !userProfile) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-slate-500 mt-4">Chargement du profil...</Text>
      </SafeAreaView>
    )
  }

  if (!userProfile) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-black justify-center items-center px-8">
        <Text className="text-lg font-semibold text-slate-900 text-center mb-4">
          Profil non trouvé
        </Text>
        <TouchableOpacity 
          className="bg-blue-600 px-6 py-3 rounded-full active:bg-blue-700"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  // Vérifier si c'est le profil de l'utilisateur connecté
  const isOwnProfile = currentUser?._id === userProfile._id

  const stats = {
    posts: userProfile.content?.posts?.length || 0,
    followers: userProfile.social?.followers?.length || 0,
    following: userProfile.social?.following?.length || 0,
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-black">
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
          {userProfile.profile?.coverPicture ? (
            <Image 
              source={{ uri: userProfile.profile.coverPicture }} 
              className="w-full h-full"
              resizeMode="cover" 
            />
          ) : (
            <View className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
          )}
          
          {/* Boutons d'action header */}
          <View className="absolute top-12 left-4 right-4 flex-row justify-between items-center">
            <TouchableOpacity 
              className="w-10 h-10 bg-gray-900 dark:bg-black/40 rounded-full items-center justify-center "
              onPress={() => router.back()}
            >
              <ArrowLeft size={20} color="white" />
            </TouchableOpacity>
            
          </View>
        </View>

        {/* Section informations profil */}
        <View className="w-full bg-white rounded-t-3xl -mt-8 pt-6 px-6 dark:bg-black">
          {/* Photo de profil */}
          <View className="absolute -top-16 left-6">
            <View className="w-32 h-32 rounded-full border-4 border-white bg-white dark:bg-black shadow-xl">
              {userProfile.profile?.profilePicture ? (
                <Image 
                  source={{ uri: userProfile.profile.profilePicture }} 
                  className="w-full h-full rounded-full" 
                  resizeMode="cover" 
                />
              ) : (
                <View className="w-full h-full rounded-full bg-slate-300 items-center justify-center">
                  <Text className="text-white text-2xl font-bold">
                    {userProfile.username?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Nom et actions */}
          <View className="ml-36 pb-4">
            <Text className="text-2xl font-bold text-slate-900 dark:text-gray-100">
              {userProfile.profile?.fullName || userProfile.username}
            </Text>
            <Text className="text-slate-500 dark:text-gray-300 mt-1">@{userProfile.username}</Text>
          </View>

          {/* Boutons d'action */}
          {!isOwnProfile && (
            <View className="flex-row space-x-3 gap-x-3 mt-4 pb-6">
              <TouchableOpacity 
                className={`flex-1 py-3 rounded-xl shadow-sm flex-row items-center justify-center ${
                  isFollowing 
                    ? 'bg-slate-100 active:bg-slate-200' 
                    : 'bg-blue-600 active:bg-blue-700'
                }`}
                onPress={handleFollowToggle}
                disabled={loading}
              >
                {isFollowing ? (
                  <>
                    <UserCheck size={16} color="#64748b" />
                    <Text className="text-slate-700 font-semibold ml-2">Abonné</Text>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} color="white" />
                    <Text className="text-white font-semibold ml-2">Suivre</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Informations */}
          <View className="my-2">
            {/* Bio */}
            {userProfile.profile?.bio ? (
              <Text className="text-slate-700 dark:text-gray-300 mt-3 leading-5 text-sm">
                {userProfile.profile.bio}
              </Text>
            ) : (
              <Text className="text-slate-400 dark:text-gray-300 mt-3 leading-5 text-sm italic">
                Aucune bio pour le moment
              </Text>
            )}
            
            {/* Informations supplémentaires */}
            <View className="flex-row flex-wrap gap-4 mt-4 justify-around">
              {userProfile.profile?.location ? (
                <View className="flex flex-row items-center gap-x-2">
                  <MapPin size={20} color={isDark ? 'white' : 'black'} />
                  <Text className="text-gray-900 text-lg">{userProfile.profile.location}</Text>
                </View>
              ) : null}

              {userProfile.profile?.birthDate ? (
                <View className="flex flex-row items-center gap-x-2">
                  <Cake size={20} color={isDark ? 'white' : 'black'} />
                  <Text className="text-gray-900 dark:text-gray-100 text-lg"> 
                    {formatDateBirthDay(userProfile.profile.birthDate)}
                  </Text>
                </View>
              ) : null}
            </View>
                 
            {userProfile.profile?.website ? (
              <View className="flex flex-row items-center justify-center gap-x-2 mt-2">
                <Globe size={20} color={isDark ? 'white' : 'black'} />
                <TouchableOpacity className="text-blue-600 text-lg">
                  <Text className="text-blue-600 text-lg">
                    {userProfile.profile.website}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          {/* Statistiques */}
          <View className="flex-row justify-between py-4 border-t border-slate-100 dark:border-slate-500">
            <View className="items-center flex-1">
              <Text className="text-xl font-bold text-slate-900 dark:text-gray-100">
                {formatCount(stats.posts)}
              </Text>
              <Text className="text-slate-500 text-sm mt-1 dark:text-gray-300">Publications</Text>
            </View>
            
            <TouchableOpacity 
              className="items-center flex-1 border-x border-slate-100 active:opacity-70"
              onPress={() => router.push(`/follows/userFollowers?userId=${userProfile._id}`)}
            >
              <Text className="text-xl font-bold text-slate-900 dark:text-gray-100">
                {formatCount(stats.followers)}
              </Text>
              <Text className="text-slate-500 dark:text-gray-300 text-sm mt-1">Abonnés</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="items-center flex-1 active:opacity-70"
              onPress={() => router.push(`/follows/userFollowings?userId=${userProfile._id}`)}
            >
              <Text className="text-xl font-bold text-slate-900 dark:text-gray-100">
                {formatCount(stats.following)}
              </Text>
              <Text className="text-slate-500 dark:text-gray-300 text-sm mt-1">Abonnements</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Navigation par onglets */}
        <View className="bg-white dark:bg-black mt-2 mx-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-500">
          <View className="flex-row border-b border-slate-100">
            {[
              { id: 'posts' as const, label: 'Publications' },
            ].map((tab) => (
              <TouchableOpacity 
                key={tab.id}
                className={`flex-1 py-4 items-center ${activeTab === tab.id ? 'border-b-2 border-blue-600' : ''}`}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text className={`font-semibold text-sm ${
                  activeTab === tab.id ? 'text-blue-600' : 'text-slate-500'
                } dark:text-gray-100`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Contenu des onglets */}
          <View className="min-h-96">
            {activeTab === 'posts' && (
              <UserPostsList
                userId={userProfile._id}
                showActions={!isOwnProfile}
                onPostPress={handlePostPress}
                onUserPress={handleUserPress}
                onCommentPress={handleCommentPress}
              />
            )}
          </View>
        </View>

        {/* Espace en bas */}
        <View className="h-20" />
      </ScrollView>
    </View>
  )
}