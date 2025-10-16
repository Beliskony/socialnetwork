// components/Comments/CreateComment.tsx
import { View, TextInput, TouchableOpacity, Alert, Image, Text } from "react-native"
import { ScrollView } from "react-native"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { createComment } from "@/redux/commentSlice"
import type { RootState, AppDispatch } from "@/redux/store"
import { Send, Image as ImageIcon, X, User } from "lucide-react-native"

interface CreateCommentProps {
  postId: string
  parentCommentId?: string
  onSuccess?: () => void
  onCancel?: () => void
  placeholder?: string
  autoFocus?: boolean
}

const CreateComment: React.FC<CreateCommentProps> = ({
  postId,
  parentCommentId,
  onSuccess,
  onCancel,
  placeholder = "Écrivez un commentaire...",
  autoFocus = false
}) => {
  const [text, setText] = useState("")
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const dispatch = useDispatch<AppDispatch>()
  const { currentUser } = useSelector((state: RootState) => state.user)

  // Vérifier si le formulaire est valide
  const isValidForm = text.trim().length > 0

  // Soumettre le commentaire
  const handleSubmit = async () => {
    if (!isValidForm || isSubmitting || !currentUser) return

    setIsSubmitting(true)

    try {
      const commentData = {
        postId,
        content: {
          text: text.trim(),
          ...(selectedImages.length > 0 && {
            media: { images: selectedImages }
          })
        },
        ...(parentCommentId && { parentComment: parentCommentId })
      }

      await dispatch(createComment(commentData)).unwrap()
      
      // Réinitialiser
      setText("")
      setSelectedImages([])
      onSuccess?.()
      
    } catch (error: any) {
      Alert.alert("Erreur", error || "Impossible de publier le commentaire")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Gérer la sélection d'image
  const handleSelectImage = () => {
    // TODO: Intégrer expo-image-picker
    Alert.alert(
      "Ajouter une image",
      "Fonctionnalité de sélection d'image à implémenter",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Simuler", 
          onPress: () => {
            const mockImage = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809"
            setSelectedImages(prev => [...prev, mockImage])
          }
        }
      ]
    )
  }

  // Supprimer une image
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  if (!currentUser) {
    return (
      <View className="bg-slate-50 rounded-xl p-4">
        <Text className="text-slate-600 text-sm text-center">
          Connectez-vous pour commenter
        </Text>
      </View>
    )
  }

  return (
    <View className="bg-white border-t border-slate-200 p-4">
      
      {/* Images preview */}
      {selectedImages.length > 0 && (
        <View className="mb-3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedImages.map((image, index) => (
              <View key={index} className="relative mr-2">
                <Image
                  source={{ uri: image }}
                  className="w-16 h-16 rounded-lg"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => removeImage(index)}
                  className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center"
                >
                  <X size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View className="flex-row items-end space-x-3">
        {/* User avatar */}
        {currentUser.profile?.profilePicture ? (
          <Image
            source={{ uri: currentUser.profile.profilePicture }}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <View className="w-8 h-8 rounded-full bg-slate-200 items-center justify-center">
            <User size={16} color="#64748b" />
          </View>
        )}

        {/* Text input */}
        <View className="flex-1 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-200">
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor="#94a3b8"
            multiline
            className="text-slate-800 text-sm min-h-[20px] max-h-[80px]"
            textAlignVertical="center"
            autoFocus={autoFocus}
            editable={!isSubmitting}
          />
        </View>

        {/* Actions */}
        <View className="flex-row items-center space-x-2">
          {/* Image button */}
          <TouchableOpacity 
            onPress={handleSelectImage}
            disabled={isSubmitting}
            className="p-2"
          >
            <ImageIcon size={18} color="#64748b" />
          </TouchableOpacity>

          {/* Send button */}
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={!isValidForm || isSubmitting}
            className={`p-2 rounded-full ${
              isValidForm && !isSubmitting 
                ? "bg-blue-600 active:bg-blue-700" 
                : "bg-slate-300"
            }`}
          >
            <Send 
              size={18} 
              color={isValidForm && !isSubmitting ? "white" : "#94a3b8"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Character count */}
      <Text className="text-slate-400 text-xs text-right mt-2">
        {text.length}/500
      </Text>
    </View>
  )
}

export default CreateComment