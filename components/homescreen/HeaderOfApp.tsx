"use client"

import { View, TextInput, Pressable, Animated, Image, TouchableOpacity, Modal } from "react-native"
import { useState, useRef } from "react"
import type { Post, PostFront } from "@/intefaces/post.Interface"
import { MaterialIcons } from "@expo/vector-icons"
import { useDispatch, useSelector } from "react-redux"
import { useTheme } from "@/hooks/toggleChangeTheme"
import type { RootState, AppDispatch } from "@/redux/store"
import CreatePost from "@/components/Posts/CreatePost" // ✅ Même composant que PostsList
import { Plus } from "lucide-react-native"


const HeaderOfApp = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false) // ✅ Même état
  const [isSubmitting, setIsSubmitting] = useState(false) // ✅ Même état
  const [editingPost, setEditingPost] = useState<PostFront | null>(null);
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

  // ✅ MÊME FONCTION QUE POSTSLIST - Création réussie
  const handleCreateSuccess = () => {
    console.log('✅ Création réussie depuis Header');
    setShowCreateModal(false);
    setIsSubmitting(false);
    
    // Optionnel: recharger les posts ou mettre à jour l'état local
    setTimeout(() => {
      // Vous pouvez ajouter une logique de rechargement ici si nécessaire
    }, 1000);
  }

  // ✅ MÊME FONCTION QUE POSTSLIST - Annulation
  const handleCancel = () => {
    console.log('❌ Création annulée depuis Header');
    setShowCreateModal(false);
    setIsSubmitting(false);
  }

  return (
    <View className="flex flex-col items-start justify-between bg-white dark:bg-black px-5 py-1 mb-2 shadow-lg border-b border-slate-100 dark:border-gray-400">
      {/* Logo et boutons */}
      <View className="flex-row items-center justify-between w-full">
        <Image source={isDark ?  require("../../assets/images/LogoWhite.png") : require("../../assets/images/Logo.png")} className="w-36 h-28" resizeMode="contain" />

        {/* Boutons d'action */}
        <View className="flex-row items-center space-x-2 gap-x-2">
          {/* ✅ MÊME BOUTON QUE POSTSLIST - Création */}
          {currentUser && (
            <TouchableOpacity
              onPress={() => {
                console.log('➕ Ouverture modal création depuis Header');
                setShowCreateModal(true);
              }}
              className="w-11 h-11 rounded-full bg-blue-600 items-center justify-center active:bg-blue-700 shadow-lg"
            >
              <Plus size={20} color="white" />
            </TouchableOpacity>
          )}

          {/* Bouton de recherche */}
          <Pressable
            onPress={toggleSearch}
            className="w-11 h-11 rounded-full bg-slate-100 items-center justify-center active:bg-slate-200"
          >
            <MaterialIcons name="search" size={26} color="#334155" />
          </Pressable>
        </View>
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

      {/* ✅ MÊME MODAL QUE POSTSLIST - Création */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancel}
      >
        {/* ✅ UTILISE LE MÊME COMPOSANT CreatePost QUE POSTSLIST */}
        <CreatePost
        isVisible={showCreateModal}
        onSuccess={handleCreateSuccess}
        onCancel={handleCancel}
        editPost={editingPost || undefined}
        />
      </Modal>
    </View>
  )
}

export default HeaderOfApp