"use client"

import { useState } from "react"
import axios from "axios"
import { useRouter } from "expo-router"
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useDispatch } from "react-redux"
import { setUser } from "@/redux/userSlice"

const LoginScreen = () => {
  const [identifiant, setIdentifiant] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const dispatch = useDispatch()

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleLogin = async () => {
    if (!identifiant || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.")
      return
    }
    setIsLoading(true)

    try {
      const res = await axios.post("https://apisocial-g8z6.onrender.com/api/user/login", {
        identifiant,
        password,
      })

      const { token, id, username, email, profilePicture, posts, followers } = res.data

      const userData = {
        _id: id,
        username,
        email,
        profilePicture,
        token,
        followersCount: followers?.length || 0,
        postsCount: posts?.length || 0,
      }

      await AsyncStorage.setItem("user", JSON.stringify(userData))

      dispatch(setUser(userData))

      router.replace("/(tabs)/home")
    } catch (error: any) {
      Alert.alert("Échec", error?.response?.data?.message || "Identifiants invalides.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex flex-col w-full justify-center items-center bg-slate-50 px-6">
      <View className="w-full max-w-md mb-10">
        <Text className="text-4xl font-bold mb-2 text-slate-900">Bon retour</Text>
        <Text className="text-base text-slate-500">Connectez-vous pour continuer</Text>
      </View>

      <View className="w-full max-w-md gap-y-4">
        <View>
          <Text className="text-sm font-medium text-slate-700">Email ou numéro</Text>
          <TextInput
            className="w-full h-14 bg-white rounded-xl px-4 border border-slate-200 shadow-sm text-slate-900"
            placeholder="Entrez votre email ou numéro"
            placeholderTextColor="#94a3b8"
            keyboardType="default"
            autoCapitalize="none"
            value={identifiant}
            onChangeText={setIdentifiant}
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-slate-700">Mot de passe</Text>
          <View className="w-full relative">
            <TextInput
              className="w-full h-14 bg-white rounded-xl px-4 pr-12 border border-slate-200 shadow-sm text-slate-900"
              placeholder="Entrez votre mot de passe"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
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
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-white text-lg font-bold">Connexion</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity className="self-center mt-4">
          <Text className="text-blue-600 text-sm font-medium">Mot de passe oublié ?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default LoginScreen
