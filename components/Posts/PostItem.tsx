"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, Image, TouchableOpacity, TextInput, Alert, ScrollView } from "react-native"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch } from "@/redux/store"
import { toggleLikePostAsync } from "@/redux/postSlice"
import { selectCurrentUser } from "@/redux/userSlice"
import { addCommentAsync, fetchCommentsByPostAsync } from "@/redux/commentSlice"
import { deletePostAsync } from "@/redux/postSlice"
import MediaSlider from "./MediaSlider"
import { formatRelativeDate } from "@/services/FormatDate"
import type { Post } from "@/intefaces/post.Interface"

// Types
type User = {
  _id: string
  username: string
  profilePicture?: string
}

type Comment = {
  _id: string
  user: User
  content: string
  createdAt: string
}

type Media = {
  images?: string[]
  videos?: string[]
}

type PostItemProps = {
  post: Post
  onDelete: (postId: string) => void
  onLike?: (postId: string) => void | Promise<void>
  onComment?: (postId: string, comment: string) => void | Promise<void>
  onEdit?: (post: Post) => void
}

const PostItem: React.FC<PostItemProps> = ({ post, onDelete, onEdit }) => {
  const [likes, setLikes] = useState<string[]>(post.likes || [])
  const [comments, setComments] = useState<Comment[]>(post.comments || [])
  const [commentInput, setCommentInput] = useState("")
  const [showComments, setShowComments] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(post.text || "")
  const [showOptions, setShowOptions] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editableImages, setEditableImages] = useState<string[]>(post.media?.images || [])
  const [editableVideos, setEditableVideos] = useState<string[]>(post.media?.videos || [])

  const currentUser = useSelector(selectCurrentUser)
  const dispatch = useDispatch<AppDispatch>()

  // Fetch comments
  useEffect(() => {
    dispatch(fetchCommentsByPostAsync({ postId: post._id }))
      .unwrap()
      .then((fetchedComments: Comment[]) => setComments(fetchedComments))
      .catch(console.error)
  }, [dispatch, post._id])

  // Like logic
  const handleLike = async () => {
    if (!currentUser) return
    const alreadyLiked = likes.includes(currentUser._id)
    setLikes((prev) => (alreadyLiked ? prev.filter((id) => id !== currentUser._id) : [...prev, currentUser._id]))
    try {
      await dispatch(toggleLikePostAsync({ postId: post._id })).unwrap()
    } catch {
      setLikes((prev) => (alreadyLiked ? [...prev, currentUser._id] : prev.filter((id) => id !== currentUser._id)))
    }
  }

  // Comment logic
  const handleCommentSubmit = async () => {
    const trimmed = commentInput.trim()
    if (!trimmed) return
    try {
      const result: Comment = await dispatch(addCommentAsync({ postId: post._id, content: trimmed })).unwrap()
      setComments((prev) => [result, ...prev])
      setCommentInput("")
    } catch {
      Alert.alert("Erreur", "Impossible d'ajouter le commentaire.")
    }
  }

  //Delete Logic
  const handleDelete = () => {
    if (deleting) return
    Alert.alert("Confirmer la suppression", "Êtes-vous sûr de vouloir supprimer ce post ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            setDeleting(true)
            await dispatch(deletePostAsync(post._id)).unwrap()
            onDelete(post._id)
          } catch (error) {
            Alert.alert("Erreur", "Impossible de supprimer le post.")
          } finally {
            setDeleting(false)
          }
        },
      },
    ])
  }

  const isLiked = currentUser ? likes.includes(currentUser._id) : false

  return (
    <View className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5 mb-5">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Image
            source={{ uri: post.user.profilePicture }}
            className="w-12 h-12 rounded-full mr-3 border-2 border-slate-100"
          />
          <View>
            <Text className="font-semibold text-slate-900 text-base">{post.user.username}</Text>
            <Text className="text-slate-500 text-xs mt-0.5">
              {post.createdAt ? formatRelativeDate(post.createdAt) : "Date inconnue"}
            </Text>
          </View>
        </View>
        {currentUser?._id && (
          <TouchableOpacity onPress={() => setShowOptions(!showOptions)}>
            <Image source={require("../../assets/images/option.png")} style={{ width: 22, height: 22 }} />
          </TouchableOpacity>
        )}
      </View>
      {showOptions && currentUser && (
        <View className="absolute right-5 top-16 bg-white border border-slate-200 rounded-xl shadow-xl z-10 overflow-hidden">
          <TouchableOpacity
            onPress={() => {
              setShowOptions(false)
              onEdit?.(post)
              console.log("PostItem: onEdit click, post:", post)
            }}
            className="px-5 py-3 active:bg-slate-50"
          >
            <Text className="text-base text-slate-700 font-medium">Modifier</Text>
          </TouchableOpacity>
          <View className="h-px bg-slate-100" />
          <TouchableOpacity
            onPress={() => {
              setShowOptions(false)
              handleDelete()
            }}
            className="px-5 py-3 active:bg-red-50"
          >
            <Text className="text-base text-red-600 font-medium">Supprimer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Texte */}
      {post.text && <Text className="text-slate-800 text-base leading-6 mb-4 pl-12">{post.text}</Text>}

      {/* Media */}
      {post.media && <MediaSlider post={post} />}

      {/* Actions */}
      <View className="flex-row justify-around mt-4 pt-4 border-t border-slate-100">
        <TouchableOpacity onPress={handleLike} className="flex-row items-center gap-2">
          <Image
            source={isLiked ? require("@/assets/images/redHeart.png") : require("@/assets/images/heartOutline.png")}
            className="w-7 h-7"
          />
          <Text className={`font-semibold text-base ${isLiked ? "text-red-600" : "text-slate-600"}`}>
            {likes.length}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowComments(!showComments)} className="flex-row items-center gap-2">
          <Image source={require("@/assets/images/comment.png")} className="w-7 h-7" />
          <Text className={`font-semibold text-base ${showComments ? "text-blue-600" : "text-slate-600"}`}>
            {comments.length}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Comments */}
      {showComments && (
        <View className="mt-4 pt-4 border-t border-slate-100">
          <View className="flex-row items-center mb-4 gap-2">
            <TextInput
              value={commentInput}
              onChangeText={setCommentInput}
              placeholder="Ajouter un commentaire..."
              placeholderTextColor="#94a3b8"
              className="flex-1 bg-slate-50 rounded-xl px-4 py-3 text-slate-800 border border-slate-200"
            />
            <TouchableOpacity
              onPress={handleCommentSubmit}
              className="bg-blue-600 px-5 py-3 rounded-xl active:bg-blue-700"
            >
              <Text className="text-white font-semibold">Publier</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="max-h-60">
            {comments.map((c: Comment) => (
              <View
                key={c._id}
                className="flex-row items-start mb-3 bg-slate-50 rounded-xl p-3 border border-slate-100"
              >
                <Image
                  source={{ uri: c.user.profilePicture }}
                  className="w-9 h-9 rounded-full mr-3 border border-slate-200"
                />
                <View className="flex-1">
                  <Text className="font-semibold text-sm text-slate-900">{c.user.username}</Text>
                  <Text className="text-slate-700 text-sm mt-1 leading-5">{c.content}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

export default PostItem
