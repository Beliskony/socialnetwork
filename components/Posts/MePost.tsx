// components/Posts/MePost.tsx
import { View, Text, FlatList, ActivityIndicator } from "react-native"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getPostsByUser } from "@/redux/postSlice"
import type { RootState, AppDispatch } from "@/redux/store"
import PostCard from "./PostCard"

const MePost = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { currentUser } = useSelector((state: RootState) => state.user)
  const { userPosts, userPostsLoading } = useSelector((state: RootState) => state.posts)

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getPostsByUser(currentUser._id))
    }
  }, [currentUser?._id, dispatch])

  if (userPostsLoading) {
    return (
      <View className="py-8 items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-slate-500 mt-4">Chargement de vos publications...</Text>
      </View>
    )
  }

  if (!userPosts || userPosts.length === 0) {
    return (
      <View className="py-12 items-center px-8">
        <Text className="text-slate-500 text-lg mb-2">Aucune publication</Text>
        <Text className="text-slate-400 text-sm text-center">
          Créez votre première publication pour la voir apparaître ici
        </Text>
      </View>
    )
  }

  return (
    <View>
    {/*  <FlatList
        data={userPosts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PostCard 
            post={item} 
            variant="compact"
            showActions={false}
          />
        )}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      /> */}
    </View>
  )
}

export default MePost