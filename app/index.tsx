"use client"

import { View, Text, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useState } from "react"
import LoginScreen from "@/components/Auth/Login"
import SignIn from "@/components/Auth/SignIn"

export default function HomeScreen() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-slate-50">
      <View className="flex-1 w-full justify-center items-center px-6">
        {/* Rendu des écrans */}
        {isLogin ? <SignIn /> : <LoginScreen />}

        {/* Boutons de bascule */}
        <View className="flex-row justify-center items-center mt-8 w-full max-w-md bg-white rounded-2xl p-1.5 shadow">
          <TouchableOpacity onPress={() => setIsLogin(true)} className="flex-1">
            <View className={`py-3.5 px-4 rounded-xl ${
              isLogin ? "bg-blue-600" : "bg-transparent"
            }`}>
              <Text className={`text-center ${
                isLogin ? "text-white font-bold" : "text-slate-600 font-medium"
              }`}>
                Inscrivez-vous
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(false)} className="flex-1">
            <View className={`py-3.5 px-4 rounded-xl ${
              !isLogin ? "bg-blue-600" : "bg-transparent"
            }`}>
              <Text className={`text-center ${
                !isLogin ? "text-white font-bold" : "text-slate-600 font-medium"
              }`}>
                Connectez-vous
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}
