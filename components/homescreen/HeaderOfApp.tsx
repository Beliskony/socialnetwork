"use client"

import { View, TextInput, Pressable, Animated, Image, TouchableOpacity, Modal, Text } from "react-native"
import { useState, useRef } from "react"
import type { Post, PostFront } from "@/intefaces/post.Interface"
import { MaterialIcons } from "@expo/vector-icons"
import { useDispatch, useSelector } from "react-redux"
import { useTheme } from "@/hooks/toggleChangeTheme"
import type { RootState, AppDispatch } from "@/redux/store"
import CreatePost from "@/components/Posts/CreatePost"
import SearchBar from "./SearchBar"
import { Plus, X } from "lucide-react-native"

const HeaderOfApp = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingPost, setEditingPost] = useState<PostFront | null>(null)
  const { isDark } = useTheme()

  const searchHeight = useRef(new Animated.Value(0)).current
  const dispatch = useDispatch<AppDispatch>()
  const { currentUser } = useSelector((state: RootState) => state.user)

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

  const handleCreateSuccess = () => {
    console.log('✅ Création réussie depuis Header')
    setShowCreateModal(false)
    setIsSubmitting(false)
  }

  const handleCancel = () => {
    console.log('❌ Création annulée depuis Header')
    setShowCreateModal(false)
    setIsSubmitting(false)
  }

  // Fonction pour fermer la recherche
  const closeSearch = () => {
    setShowSearch(false)
  }

  return (
    <View className="flex flex-col items-start justify-between bg-white dark:bg-black px-5 py-1 mb-2 shadow-lg border-b border-slate-100 dark:border-gray-400">
      {/* Logo et boutons */}
      <View className="flex-row items-center justify-between w-full">
        <Image 
          source={isDark ? require("../../assets/images/LogoWhite.png") : require("../../assets/images/Logo.png")} 
          className="w-36 h-28" 
          resizeMode="contain" 
        />

        {/* Boutons d'action */}
        <View className="flex-row items-center space-x-2 gap-x-2">
          {/* Bouton de création de post */}
          {currentUser && (
            <TouchableOpacity
              onPress={() => {
                console.log('➕ Ouverture modal création depuis Header')
                setShowCreateModal(true)
              }}
              className="w-11 h-11 rounded-full bg-blue-600 items-center justify-center active:bg-blue-700 shadow-lg"
            >
              <Plus size={20} color="white" />
            </TouchableOpacity>
          )}

          {/* Bouton de recherche */}
          <Pressable
            onPress={() => setShowSearch(true)}
            className="w-11 h-11 rounded-full bg-slate-100 items-center justify-center active:bg-slate-200"
          >
            <MaterialIcons name="search" size={26} color="#334155" />
          </Pressable>
        </View>
      </View>

 
      {/* Modal de recherche complète */}
      <Modal
        visible={showSearch}
        animationType="slide"
        onRequestClose={closeSearch}
      >

          {/* Contenu de recherche */}
          <View className="flex-1">
            <SearchBar onClose={closeSearch} />
          </View>
      </Modal>

      {/* Modal de création de post */}
      <CreatePost
        isVisible={showCreateModal}
        onSuccess={handleCreateSuccess}
        onCancel={handleCancel}
        editPost={editingPost || undefined}
      />
    </View>
  )
}

export default HeaderOfApp