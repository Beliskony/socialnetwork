"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, TextInput, TouchableOpacity, ActivityIndicator, Text, Image, ScrollView } from "react-native"
import { useDispatch, useSelector } from "react-redux"
import * as ImagePicker from "expo-image-picker"
import { MaterialIcons } from "@expo/vector-icons"

import type { AppDispatch, RootState } from "@/redux/store"
import { addPost, updatePostAsync } from "@/redux/postSlice"
import type { Post } from "@/intefaces/post.Interface"

import VideoPreviewItem from "./VideoPreview"
import { selectCurrentUser } from "@/redux/userSlice"
import { router } from "expo-router"

interface NewPostProps {
  initialPost?: Post // ← si présent = mode édition
  onPostCreated?: (post: Post) => void
  onPostUpdated?: (post: Post) => void
  onClose?: () => void
}

type MediaState = {
  images: string[]
  videos: string[]
}

const NewPost: React.FC<NewPostProps> = ({ initialPost, onPostCreated, onPostUpdated, onClose }) => {
  const [content, setContent] = useState("")
  const [media, setMedia] = useState<MediaState>({ images: [], videos: [] })
  const [isLoading, setIsLoading] = useState(false)
  const correctUser = useSelector(selectCurrentUser)
  const dispatch = useDispatch<AppDispatch>()
  const { error } = useSelector((state: RootState) => state.posts)

  const isEditMode = !!initialPost
  const initial = correctUser?.username?.[0]?.toUpperCase() || "?"

  useEffect(() => {
    if (initialPost) {
      setContent(initialPost.text || "")
      setMedia({
        images: initialPost.media?.images || [],
        videos: initialPost.media?.videos || [],
      })
    }
  }, [initialPost])

  // 📸 Ajouter médias
  const handleAddMedia = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permissionResult.granted) return alert("Permission refusée à la galerie.")

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
      quality: 1,
    })

    if (!pickerResult.canceled && pickerResult.assets) {
      const newImages: string[] = []
      const newVideos: string[] = []

      pickerResult.assets.forEach((asset) => {
        if (asset.type?.startsWith("image")) newImages.push(asset.uri)
        else if (asset.type?.startsWith("video")) newVideos.push(asset.uri)
      })

      setMedia((prev) => ({
        images: [...prev.images, ...newImages],
        videos: [...prev.videos, ...newVideos],
      }))
    }
  }

  // ❌ Supprimer média
  const handleRemoveMedia = (uri: string, type: "image" | "video") => {
    setMedia((prev) => ({
      ...prev,
      [type === "image" ? "images" : "videos"]: prev[type === "image" ? "images" : "videos"].filter((u) => u !== uri),
    }))
  }

  // 🚀 Poster
  const handleSubmit = async () => {
    if (!content.trim() && media.images.length === 0 && media.videos.length === 0) return
    setIsLoading(true)

    const payload = {
      text: content,
      media: {
        images: media.images,
        videos: media.videos,
      },
    }

    try {
      if (isEditMode && initialPost) {
        const updatedPost = await dispatch(updatePostAsync({ postId: initialPost._id, data: payload })).unwrap()
        onPostUpdated?.(updatedPost)
      } else {
        const newPost = await dispatch(addPost(payload)).unwrap()
        onPostCreated?.(newPost)
      }

      if (!isEditMode) {
        setContent("")
        setMedia({ images: [], videos: [] })
      }
      onClose?.()
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View className="w-full py-4 mb-2">
      {/* Zone de texte + Bouton média */}
      <View className="flex-row items-center gap-3 mb-3">
        {/* Avatar */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/me")}
          activeOpacity={0.8}
          className="w-12 h-12 rounded-full overflow-hidden shadow-sm border-2 border-slate-100"
        >
          {correctUser?.profilePicture ? (
            <Image source={{ uri: correctUser.profilePicture }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="w-full h-full bg-slate-200 flex items-center justify-center">
              <Text className="text-lg font-semibold text-slate-600">{initial}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Exprimez-vous..."
          placeholderTextColor="#94a3b8"
          multiline
          editable={!isLoading}
          className="flex-1 text-base rounded-xl px-4 py-3 bg-slate-50 text-slate-800 border border-slate-200"
        />
        <TouchableOpacity
          onPress={handleAddMedia}
          className="rounded-xl flex items-center justify-center w-11 h-11 bg-slate-100 active:bg-slate-200"
        >
          <MaterialIcons name="add-photo-alternate" size={24} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Médias - Images */}
      {media.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 mb-2">
          {media.images.map((img, idx) => (
            <View key={idx} className="relative mr-3 mt-1">
              <Image
                source={{ uri: img }}
                className="w-28 h-28 rounded-xl object-cover border border-slate-200 shadow-sm"
              />
              <TouchableOpacity
                onPress={() => handleRemoveMedia(img, "image")}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1.5 shadow-md"
              >
                <MaterialIcons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Médias - Vidéos */}
      {media.videos.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          {media.videos.map((vid, idx) => (
            <View key={idx} className="relative mr-3 mt-1">
              <View className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <VideoPreviewItem uri={vid} />
              </View>
              <View className="absolute inset-0 items-center justify-center flex">
                <View className="bg-black/50 rounded-full p-2">
                  <MaterialIcons name="play-circle-outline" size={32} color="#fff" />
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveMedia(vid, "video")}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1.5 shadow-md"
              >
                <MaterialIcons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Bouton Publier */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isLoading || (!content.trim() && media.images.length === 0 && media.videos.length === 0)}
        className={`mt-2 rounded-xl py-3.5 shadow-sm ${
          isLoading || (!content.trim() && media.images.length === 0 && media.videos.length === 0)
            ? "bg-slate-300"
            : "bg-blue-600 active:bg-blue-700"
        }`}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-center text-base font-semibold">{isEditMode ? "Modifier" : "Publier"}</Text>
        )}
      </TouchableOpacity>

      {/* Message d'erreur */}
      {typeof error === "string" && (
        <View className="mt-3 bg-red-50 rounded-xl px-4 py-3 border border-red-200">
          <Text className="text-red-600 text-sm">{error}</Text>
        </View>
      )}
    </View>
  )
}

export default NewPost
