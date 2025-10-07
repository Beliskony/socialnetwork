"use client"

import type React from "react"
import { useState } from "react"
import axios from "axios"
import { useRouter } from "expo-router"
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native"

const SignIn: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
  })

  const [isLoading, setIsLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const router = useRouter()

  const handleSignUp = async () => {
    if (!formData.username || !formData.password || !formData.email || !formData.phoneNumber) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires.")
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.post(`https://apisocial-g8z6.onrender.com/api/user/register`, formData)

      if (response.status === 201) {
        // Rediriger ou enregistrer le token ici si nécessaire
        router.replace("/(tabs)/home")
      }
    } catch (error: any) {
      console.error(error)
      Alert.alert("Erreur", error.response?.data?.message || "Échec de l'inscription")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View className="flex flex-col justify-center items-center w-full bg-slate-50 px-6 gap-y-1">
      <View className="w-full max-w-md mb-10">
        <Text className="text-4xl font-bold mb-2 text-slate-900">Bienvenue</Text>
        <Text className="text-base text-slate-500">Créez votre compte pour commencer</Text>
      </View>

      <View className="w-full max-w-md gap-y-2">
        <View>
          <Text className="text-sm font-medium text-slate-700">Nom d'utilisateur</Text>
          <TextInput
            className="w-full h-14 bg-white rounded-xl px-4 border border-slate-200 shadow-sm text-slate-900"
            placeholder="Entrez votre nom"
            placeholderTextColor="#94a3b8"
            value={formData.username}
            onChangeText={(text) => handleInputChange("username", text)}
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-slate-700">Contact</Text>
          <TextInput
            className="w-full h-14 bg-white rounded-xl px-4 border border-slate-200 shadow-sm text-slate-900"
            placeholder="Numéro de téléphone"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
            value={formData.phoneNumber}
            onChangeText={(text) => handleInputChange("phoneNumber", text)}
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-slate-700">Email</Text>
          <TextInput
            className="w-full h-14 bg-white rounded-xl px-4 border border-slate-200 shadow-sm text-slate-900"
            placeholder="votre@email.com"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => handleInputChange("email", text)}
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-slate-700">Mot de passe</Text>
          <View className="w-full relative">
            <TextInput
              className="w-full h-14 bg-white rounded-xl px-4 pr-12 border border-slate-200 shadow-sm text-slate-900"
              placeholder="Créez un mot de passe"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={(text) => handleInputChange("password", text)}
            />
            <TouchableOpacity onPress={togglePasswordVisibility} className="absolute right-4 top-4">
              <Image
                source={{
                  uri: showPassword
                    ? "https://img.icons8.com/?size=100&id=96181&format=png&color=94a3b8"
                    : "https://img.icons8.com/?size=100&id=986&format=png&color=94a3b8",
                }}
                className="h-6 w-6"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          className="w-full h-14 bg-blue-600 rounded-xl justify-center items-center mt-6 shadow-lg active:bg-blue-700"
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-white text-lg font-bold">Inscription</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default SignIn
