"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, Image, TouchableOpacity, TextInput, Alert, ScrollView } from "react-native"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/redux/store"
import { toggleLike, toggleLikePostAsync, updatePostAsync } from "@/redux/postSlice"
import { useSelector } from "react-redux"
import { selectCurrentUser } from "@/redux/userSlice"
import { addCommentAsync } from "@/redux/commentSlice"
import { formatRelativeDate } from "@/services/FormatDate"
import MediaSlider from "./MediaSlider"

type Comment = {
  _id: string
  user: {
    _id: string
    username: string
    profilePicture?: string
  }
  content: string
  createdAt: string
  updatedAt: string
}

type Media = {
  images?: string[]
  videos?: string[]
}

type Post = {
  _id: string
  user: {
    _id: string
    username: string
    profilePicture?: string
  }
  text?: string
  createdAt: string
  likes?: string[]
  comments?: Comment[]
  media?: Media
}

type PostItemProps = {
  post: Post
  onComment: (postId: string, comment: string) => void
  onEdit: (postId: string) => void
  onDelete: (postId: string) => void
}

const PostItemForCurrent: React.FC<PostItemProps> = ({ post, onComment, onEdit, onDelete }) => {
  const [showOptions, setShowOptions] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentInput, setCommentInput] = useState("")
  const [likes, setLikes] = useState<string[]>(post.likes || [])
  const [localComments, setLocalComments] = useState<Comment[]>(post.comments || [])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [editedText] = useState(post.text || "")
  const [editedImages] = useState<string[]>(post.media?.images || [])
  const [editedVideos] = useState<string[]>(post.media?.videos || [])

  const currentUser = useSelector(selectCurrentUser)
  const dispatch = useDispatch<AppDispatch>()

  const postUser = post.user || {
    _id: currentUser?._id,
    username: currentUser?.username,
    profilePicture: currentUser?.profilePicture,
  }
  const isAuthor = postUser._id === currentUser?._id

  useEffect(() => {
    if (post) {
      setLocalComments(post.comments || [])
      setLikes(post.likes || [])
    }
  }, [post])

  if (!post || !post._id) return null
  if (!currentUser || !currentUser._id) return null

  const isLiked = currentUser._id ? likes.includes(currentUser._id) : false
  const updateLikes = isLiked ? likes.filter((id) => id !== currentUser._id) : [...likes, currentUser._id]

  const handleLike = async (postId: string, userId: string) => {
    const alreadyLiked = likes.includes(userId)

    setLikes((prev) => (alreadyLiked ? prev.filter((id) => id !== userId) : [...prev, userId]))

    try {
      const result = await dispatch(toggleLikePostAsync({ postId })).unwrap()

      if (result.liked !== !alreadyLiked) {
        setLikes((prev) => (alreadyLiked ? [...prev, userId] : prev.filter((id) => id !== userId)))
      } else {
        dispatch(toggleLike({ postId, userId }))
      }
    } catch (error) {
      console.error("Erreur lors du like:", error)
      setLikes((prev) => (alreadyLiked ? [...prev, userId] : prev.filter((id) => id !== userId)))
    }
  }

  const handleCommentSubmit = async () => {
    const trimmed = commentInput.trim()
    if (!trimmed) return

    try {
      const result = await dispatch(addCommentAsync({ postId: post._id, content: trimmed })).unwrap()
      console.log("resultat comment", result)
      if (!result._id) {
        console.error("Le commentaire retourné n'a pas de _id :", result)
      }

      const userObj =
        typeof result.user === "object" && result.user !== null
          ? result.user
          : {
              _id: currentUser._id,
              username: currentUser.username,
              profilePicture: currentUser.profilePicture,
            }

      const commentWithUserObj: Comment = { ...result, user: userObj }

      setLocalComments((prev) => [commentWithUserObj, ...prev])
      setCommentInput("")
    } catch (error) {
      Alert.alert("Erreur", "Une erreur est survenue lors de l'ajout du commentaire")
      console.log("Erreur lors du commentaire:", error)
    }
  }

  const handleUpdatePost = async () => {
    if (!currentUser || !post.text || !post.media) return

    try {
      await dispatch(
        updatePostAsync({
          postId: post._id,
          data: {
            text: editedText,
            media: {
              images: editedImages,
              videos: editedVideos,
            },
          },
        }),
      ).unwrap()
      setShowMediaModal(false)
    } catch (error) {
      Alert.alert("Erreur, mise a jour echoue")
    }
  }

  const handleDelete = () => {
    Alert.alert("Suppression", "Voulez vraiment suprimer cette publication ?", [
      { text: "Annuler", style: "cancel" },
      { text: "supprimer", style: "destructive", onPress: () => onDelete(post._id) },
    ])
  }

  const openImage = (image: string) => {
    setSelectedImage(image)
    setShowMediaModal(true)
  }

  const openVideo = (video: string) => {
    setSelectedVideo(video)
    setShowMediaModal(true)
  }

  const closeMediaModal = () => {
    setSelectedImage(null)
    setSelectedVideo(null)
    setShowMediaModal(false)
  }

  return (
    <View className="w-full p-5 mb-3 gap-y-2 justify-center items-center bg-white shadow-lg rounded-2xl border border-slate-100">
      <View className="flex-row items-center justify-around">
        <View className="w-full flex-row items-center py-2">
          {postUser.profilePicture && (
            <Image
              source={{ uri: postUser.profilePicture }}
              className="w-12 h-12 rounded-full mr-3 object-contain border-2 border-slate-100"
            />
          )}
          <View>
            <Text className="font-bold text-base text-slate-900">{postUser.username}</Text>
            <Text className="text-xs text-slate-500 mt-0.5">{formatRelativeDate(post.createdAt)}</Text>
          </View>
        </View>
        {isAuthor && (
          <TouchableOpacity
            onPress={() => setShowOptions(!showOptions)}
            className="p-2 rounded-full active:bg-slate-100"
          >
            <Image source={require("../../assets/images/option.png")} style={{ width: 22, height: 22 }} />
          </TouchableOpacity>
        )}
      </View>
      {showOptions && isAuthor && (
        <View className="absolute right-4 top-16 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
          <TouchableOpacity
            onPress={() => {
              setShowOptions(false)
              handleUpdatePost()
            }}
            className="active:bg-slate-50"
          >
            <Text className="px-5 py-3 text-base text-slate-700">Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setShowOptions(false)
              handleDelete()
            }}
            className="active:bg-red-50 border-t border-slate-100"
          >
            <Text className="px-5 py-3 text-base text-red-600 font-medium">Supprimer</Text>
          </TouchableOpacity>
        </View>
      )}

      {(post.media?.images?.length || post.media?.videos?.length) && (
        <MediaSlider post={post} openImage={openImage} openVideo={openVideo} />
      )}

      <View className="flex flex-row items-center gap-x-8 justify-center mt-2 w-full py-3 border-t border-b border-slate-100">
        <TouchableOpacity
          onPress={() => handleLike(post._id, currentUser._id)}
          className="flex-row items-center gap-x-2 px-4 py-2 rounded-full active:bg-slate-50"
        >
          {isLiked ? (
            <Image source={require("@/assets/images/redHeart.png")} style={{ width: 26, height: 26 }} />
          ) : (
            <Image source={require("@/assets/images/heartOutline.png")} style={{ width: 26, height: 26 }} />
          )}
          <Text className="text-base font-semibold text-slate-700">{likes.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowComments(!showComments)}
          className="flex flex-row items-center gap-x-2 px-4 py-2 rounded-full active:bg-slate-50"
        >
          <Image source={require("@/assets/images/comment.png")} style={{ width: 26, height: 26 }} />
          <Text className="text-base font-semibold text-slate-700">{post.comments?.length || 0}</Text>
        </TouchableOpacity>
      </View>

      {showComments && (
        <ScrollView className="mt-3 w-full max-h-80">
          <View className="flex-row items-center mb-4">
            <TextInput
              value={commentInput}
              onChangeText={setCommentInput}
              placeholder="Ajouter un commentaire..."
              className="flex-1 p-4 rounded-xl border-2 border-slate-200 mr-3 bg-slate-50 text-slate-900"
              placeholderTextColor="#94A3B8"
            />
            <TouchableOpacity
              onPress={handleCommentSubmit}
              className="px-5 py-4 rounded-xl bg-blue-500 shadow-md active:bg-blue-600"
            >
              <Text className="text-white font-semibold">Publier</Text>
            </TouchableOpacity>
          </View>
          {localComments.map((comment) => {
            if (!comment.user || !comment.user._id || !comment._id) return null

            return (
              <View
                key={comment._id || `${post._id}-temp-${Math.random()}`}
                className="mb-3 p-4 gap-3 bg-slate-50 rounded-xl border border-slate-100"
              >
                <View className="flex flex-row gap-x-3 justify-start items-center">
                  {comment.user.profilePicture && (
                    <Image
                      className="w-11 h-11 rounded-full object-contain border-2 border-white shadow-sm"
                      source={{ uri: comment.user.profilePicture }}
                    />
                  )}
                  <View className="flex flex-col justify-around items-start">
                    <Text className="font-bold text-sm text-slate-900">{comment.user.username}</Text>
                    <Text className="text-xs text-slate-500 mt-0.5">
                      {new Date(comment.createdAt).toLocaleString()}
                    </Text>
                  </View>
                </View>
                <View className="bg-white w-full rounded-xl min-h-14 justify-center p-4 shadow-sm border border-slate-100">
                  <Text className="text-sm text-slate-700 leading-5">{comment.content}</Text>
                </View>
              </View>
            )
          })}
        </ScrollView>
      )}
    </View>
  )
}

export default PostItemForCurrent
