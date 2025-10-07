"use client"

import { View, TextInput, Pressable, Animated, Image } from "react-native"
import { useState, useRef } from "react"
import type { Post } from "@/intefaces/post.Interface"
import NewPost from "../Posts/NewPost"
import { MaterialIcons } from "@expo/vector-icons"

const HeaderOfApp = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [searchText, setSearchText] = useState("")

  const searchHeight = useRef(new Animated.Value(0)).current

  const toggleSearch = () => {
    const toValue = showSearch ? 0 : 40
    setShowSearch(!showSearch)
    Animated.timing(searchHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }

  const handleNewPost = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev])
  }

  return (
    <View className="flex flex-col items-start justify-between bg-white px-5 py-1 mb-2 shadow-lg border-b border-slate-100">
      {/* Logo */}
      <View className="flex-row items-center justify-between w-full">
        <Image source={require("../../assets/images/Logo.png")} className="w-36 h-28" resizeMode="contain" />

        {/* Bouton de recherche */}
        <Pressable
          onPress={toggleSearch}
          className="w-11 h-11 rounded-full bg-slate-100 items-center justify-center active:bg-slate-200"
        >
          <MaterialIcons name="search" size={26} color="#334155" />
        </Pressable>
      </View>

      {/* Input déroulant de recherche */}
      <Animated.View style={{ height: searchHeight, overflow: "hidden", width: "100%" }}>
        <TextInput
          className="border border-slate-200 rounded-xl px-4 py-2.5 mt-1 w-full bg-slate-50 text-slate-800"
          placeholder="Rechercher..."
          placeholderTextColor="#94a3b8"
          value={searchText}
          onChangeText={setSearchText}
        />
      </Animated.View>

      <NewPost onPostCreated={handleNewPost} />
    </View>
  )
}

export default HeaderOfApp
