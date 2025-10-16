// app/(auth)/signin.tsx
import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { Eye, EyeOff, User, Mail, Phone, Lock } from "lucide-react-native"
import { registerUser } from "@/redux/userSlice"
import type { RootState } from "@/redux/store"
import type { RegisterData } from "@/intefaces/user.Interface"

const SignInScreen = () => {
  const [formData, setFormData] = useState<RegisterData>({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    profile: {
      fullName: "",
      gender: "prefer_not_to_say"
    }
  })
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { authLoading, error } = useAppSelector((state: RootState) => state.user)

  const togglePasswordVisibility = () => setShowPassword(!showPassword)
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword)

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('profile.')) {
      const profileField = field.replace('profile.', '')
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile!,
          [profileField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }



  const validateForm = (): boolean => {
    if (!formData.username.trim() || !formData.email.trim() || !formData.password || !formData.phoneNumber.trim() || !formData.profile?.fullName) {
      Alert.alert("Champs manquants", "Veuillez remplir tous les champs obligatoires.")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      Alert.alert("Email invalide", "Veuillez entrer une adresse email valide.")
      return false
    }

    if (formData.password.length < 6) {
      Alert.alert("Mot de passe faible", "Le mot de passe doit contenir au moins 6 caractères.")
      return false
    }

    if (formData.password !== confirmPassword) {
      Alert.alert("Mots de passe différents", "Les mots de passe ne correspondent pas.")
      return false
    }

    if (!agreedToTerms) {
      Alert.alert("Conditions requises", "Veuillez accepter les conditions d'utilisation.")
      return false
    }

    return true
  }

  const handleSignUp = async () => {
    if (!validateForm()) return

    try {
      const result = await dispatch(registerUser(formData)).unwrap()
      
      Alert.alert(
        "Bienvenue !", 
        `Votre compte a été créé avec succès. Bienvenue ${result.user.username} !`,
        [
          { 
            text: "Explorer", 
            onPress: () => router.replace("/(tabs)/home") 
          }
        ]
      )
    } catch (error: any) {
      console.log("Registration error:", error)
    }
  }

  const navigateToLogin = () => {
    router.push("../Login")
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="flex-1 px-6 pt-8">
          {/* En-tête compact */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-slate-900 mb-2">
              Créer un compte
            </Text>
            <Text className="text-slate-600">
              Rejoignez notre communauté
            </Text>
          </View>

          {/* Formulaire compact */}
          <View className="space-y-4">
            {/* Nom d'utilisateur */}
            <View>
              <Text className="text-sm font-medium text-slate-700 mb-2">
                Nom d'utilisateur *
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-3.5 z-10">
                  <User size={20} color="#64748b" />
                </View>
                <TextInput
                  className="w-full h-12 bg-slate-50 rounded-xl pl-12 pr-4 border-2 border-slate-200 text-slate-900 text-base"
                  placeholder="Votre nom d'utilisateur"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={formData.username}
                  onChangeText={(value) => handleInputChange('username', value)}
                />
              </View>
            </View>

            {/* Email */}
            <View>
              <Text className="text-sm font-medium text-slate-700 mb-2">
                Email *
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-3.5 z-10">
                  <Mail size={20} color="#64748b" />
                </View>
                <TextInput
                  className="w-full h-12 bg-slate-50 rounded-xl pl-12 pr-4 border-2 border-slate-200 text-slate-900 text-base"
                  placeholder="votre@email.com"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                />
              </View>
            </View>

            {/* Téléphone */}
            <View>
              <Text className="text-sm font-medium text-slate-700 mb-2">
                Téléphone *
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-3.5 z-10">
                  <Phone size={20} color="#64748b" />
                </View>
                <TextInput
                  className="w-full h-12 bg-slate-50 rounded-xl pl-12 pr-4 border-2 border-slate-200 text-slate-900 text-base"
                  placeholder="+33 6 12 34 56 78"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  value={formData.phoneNumber}
                  onChangeText={(value) => handleInputChange('phoneNumber', value)}
                />
              </View>
            </View>

            {/* Nom complet - UN SEUL INPUT */}
            <View>
              <Text className="text-sm font-medium text-slate-700 mb-2">
                Nom complet (optionnel)
              </Text>
              <TextInput
                className="w-full h-12 bg-slate-50 rounded-xl px-4 border-2 border-slate-200 text-slate-900 text-base"
                placeholder="Prénom et Nom"
                placeholderTextColor="#94a3b8"
                value={formData.profile?.fullName || "" }
                onChangeText={(value) => handleInputChange('profile.fullName', value)}
              />
            </View>

            {/* Mot de passe */}
            <View>
              <Text className="text-sm font-medium text-slate-700 mb-2">
                Mot de passe *
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-3.5 z-10">
                  <Lock size={20} color="#64748b" />
                </View>
                <TextInput
                  className="w-full h-12 bg-slate-50 rounded-xl pl-12 pr-12 border-2 border-slate-200 text-slate-900 text-base"
                  placeholder="6 caractères minimum"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                />
                <TouchableOpacity 
                  onPress={togglePasswordVisibility}
                  className="absolute right-4 top-3.5"
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#64748b" />
                  ) : (
                    <Eye size={20} color="#64748b" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmation mot de passe */}
            <View>
              <Text className="text-sm font-medium text-slate-700 mb-2">
                Confirmer le mot de passe *
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-3.5 z-10">
                  <Lock size={20} color="#64748b" />
                </View>
                <TextInput
                  className="w-full h-12 bg-slate-50 rounded-xl pl-12 pr-12 border-2 border-slate-200 text-slate-900 text-base"
                  placeholder="Retapez votre mot de passe"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity 
                  onPress={toggleConfirmPasswordVisibility}
                  className="absolute right-4 top-3.5"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#64748b" />
                  ) : (
                    <Eye size={20} color="#64748b" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Conditions d'utilisation */}
            <View className="flex-row items-start space-x-3 pt-2">
              <TouchableOpacity
                onPress={() => setAgreedToTerms(!agreedToTerms)}
                className={`w-5 h-5 rounded border-2 mt-0.5 ${
                  agreedToTerms 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'bg-white border-slate-300'
                }`}
              >
                {agreedToTerms && (
                  <View className="w-full h-full items-center justify-center">
                    <Text className="text-white text-xs font-bold">✓</Text>
                  </View>
                )}
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-slate-600 text-sm">
                  J'accepte les{" "}
                  <Text className="text-blue-600 font-medium">conditions</Text>{" "}
                  et la{" "}
                  <Text className="text-blue-600 font-medium">politique de confidentialité</Text>
                </Text>
              </View>
            </View>

            {/* Message d'erreur */}
            {error && (
              <View className="bg-red-50 border border-red-200 rounded-xl p-3">
                <Text className="text-red-800 text-sm text-center">
                  {error}
                </Text>
              </View>
            )}

            {/* Bouton d'inscription */}
            <TouchableOpacity
              className={`w-full h-12 rounded-xl justify-center items-center mt-4 ${
                authLoading 
                  ? 'bg-blue-400' 
                  : 'bg-blue-600 active:bg-blue-700'
              }`}
              onPress={handleSignUp}
              disabled={authLoading}
            >
              {authLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white text-base font-semibold">
                  Créer mon compte
                </Text>
              )}
            </TouchableOpacity>

            {/* Lien vers connexion */}
            <View className="flex-row justify-center items-center pt-4">
              <Text className="text-slate-600 text-sm">
                Déjà un compte ?{" "}
              </Text>
              <TouchableOpacity onPress={navigateToLogin}>
                <Text className="text-blue-600 text-sm font-semibold">
                  Se connecter
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignInScreen