// app/(auth)/login.tsx
import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useDispatch, useSelector } from "react-redux"
import { Eye, EyeOff, Mail, Phone, Lock, User } from "lucide-react-native"
import { loginUser } from "@/redux/userSlice"
import type { RootState, AppDispatch } from "@/redux/store"
import type { LoginCredentials } from "@/intefaces/user.Interface"

const LoginScreen = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    identifiant: "",
    password: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [inputErrors, setInputErrors] = useState<{identifiant?: string; password?: string}>({})
  
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { authLoading, error } = useSelector((state: RootState) => state.user)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (inputErrors[field]) {
      setInputErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const validateForm = () => {
    const errors: {identifiant?: string; password?: string} = {}
    
    if (!credentials.identifiant.trim()) {
      errors.identifiant = "Ce champ est requis"
    }
    
    if (!credentials.password.trim()) {
      errors.password = "Ce champ est requis"
    } else if (credentials.password.length < 6) {
      errors.password = "Le mot de passe doit contenir au moins 6 caractères"
    }
    
    setInputErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleLogin = async () => {
    if (!validateForm()) return

    try {
      const result = await dispatch(loginUser(credentials)).unwrap()
      
      // Succès - Redirection automatique sans alerte intrusive
      console.log("Login successful:", result.user.username)
      // La redirection peut être gérée par un useEffect qui écoute les changements d'état
      router.replace("/(tabs)/home")
      
    } catch (error: any) {
      // L'erreur est déjà gérée dans le slice
      console.log("Login error:", error)
    }
  }

  const navigateToRegister = () => {
    router.push("../SignIn")
  }

  const navigateToForgotPassword = () => {
    router.push("../(auth)/ResetPassword")
  }

  // Déterminer l'icône en fonction du type d'identifiant
  const getIdentifiantIcon = () => {
    const identifiant = credentials.identifiant.trim()
    
    if (identifiant.includes('@')) {
      return <Mail size={20} color={inputErrors.identifiant ? "#ef4444" : "#64748b"} />
    }
    
    if (/^\d+$/.test(identifiant)) {
      return <Phone size={20} color={inputErrors.identifiant ? "#ef4444" : "#64748b"} />
    }
    
    return <User size={20} color={inputErrors.identifiant ? "#ef4444" : "#64748b"} />
  }

  const getBorderColor = (field: 'identifiant' | 'password') => {
    if (inputErrors[field]) return "border-red-300"
    if (credentials[field].trim()) return "border-blue-300"
    return "border-slate-200"
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6 justify-center">
          {/* Header */}
          <View className="mb-10">
            <Text className="text-4xl font-bold text-slate-900 mb-2">
              Bon retour
            </Text>
            <Text className="text-lg text-slate-600">
              Connectez-vous pour continuer
            </Text>
          </View>

          {/* Formulaire */}
          <View className="space-y-6 gap-y-4">
            {/* Champ Identifiant */}
            <View className="space-y-2">
              <Text className="text-sm font-medium text-slate-700">
                Email, téléphone ou nom d'utilisateur
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  {getIdentifiantIcon()}
                </View>
                <TextInput
                  className={`w-full h-14 bg-slate-50 rounded-xl pl-12 pr-4 border-2 text-slate-900 text-base ${getBorderColor('identifiant')}`}
                  placeholder="Email, téléphone ou nom d'utilisateur"
                  placeholderTextColor="#94a3b8"
                  keyboardType="default"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  value={credentials.identifiant}
                  onChangeText={(value) => handleInputChange('identifiant', value)}
                  onSubmitEditing={() => {
                    // Focus sur le champ password si identifiant est rempli
                    if (credentials.identifiant.trim()) {
                      // Vous pouvez utiliser une ref pour focus le champ password
                    }
                  }}
                  returnKeyType="next"
                  editable={!authLoading}
                />
              </View>
              {inputErrors.identifiant && (
                <Text className="text-red-500 text-xs mt-1">{inputErrors.identifiant}</Text>
              )}
            </View>

            {/* Champ Mot de passe */}
            <View className="space-y-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-medium text-slate-700">
                  Mot de passe
                </Text>
                <TouchableOpacity 
                  onPress={navigateToForgotPassword}
                  disabled={authLoading}
                >
                  <Text className="text-blue-600 text-sm font-medium">
                    Mot de passe oublié ?
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <Lock size={20} color={inputErrors.password ? "#ef4444" : "#64748b"} />
                </View>
                <TextInput
                  className={`w-full h-14 bg-slate-50 rounded-xl pl-12 pr-12 border-2 text-slate-900 text-base ${getBorderColor('password')}`}
                  placeholder="Votre mot de passe"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  value={credentials.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  onSubmitEditing={handleLogin}
                  returnKeyType="go"
                  editable={!authLoading}
                />
                <TouchableOpacity 
                  onPress={togglePasswordVisibility}
                  className="absolute right-4 top-4"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  disabled={authLoading}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={authLoading ? "#94a3b8" : "#64748b"} />
                  ) : (
                    <Eye size={20} color={authLoading ? "#94a3b8" : "#64748b"} />
                  )}
                </TouchableOpacity>
              </View>
              {inputErrors.password && (
                <Text className="text-red-500 text-xs mt-1">{inputErrors.password}</Text>
              )}
            </View>

            {/* Message d'erreur global */}
            {error && (
              <View className="bg-red-50 border border-red-200 rounded-lg p-4">
                <Text className="text-red-800 text-sm text-center">
                  {error}
                </Text>
              </View>
            )}

            {/* Bouton de connexion */}
            <TouchableOpacity
              className={`w-full h-14 my-4 rounded-xl justify-center items-center shadow-lg ${
                authLoading 
                  ? 'bg-blue-400' 
                  : 'bg-blue-600 active:bg-blue-700'
              } ${(!credentials.identifiant.trim() || !credentials.password.trim()) ? 'opacity-50' : ''}`}
              onPress={handleLogin}
              disabled={authLoading || !credentials.identifiant.trim() || !credentials.password.trim()}
            >
              {authLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white text-lg font-semibold">
                  Se connecter
                </Text>
              )}
            </TouchableOpacity>

            {/* Lien vers inscription */}
            <View className="flex-row justify-center items-center pt-4">
              <Text className="text-slate-600 text-sm">
                Pas de compte ?{" "}
              </Text>
              <TouchableOpacity 
                onPress={navigateToRegister}
                disabled={authLoading}
              >
                <Text className="text-blue-600 text-sm font-semibold">
                  S'inscrire
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View className="absolute bottom-8 left-0 right-0 items-center">
            <Text className="text-slate-400 text-xs">
              © 2024 VotreApp. Tous droits réservés.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default LoginScreen