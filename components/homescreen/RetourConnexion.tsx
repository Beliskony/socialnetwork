import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

const RetourConnexion = () => {
    const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center px-8">
            <Text className="text-lg font-semibold text-slate-900 text-center mb-4">
              Connectez-vous pour voir votre profil
            </Text>
            <TouchableOpacity 
              className="bg-blue-600 px-6 py-3 rounded-full active:bg-blue-700"
              onPress={() => router.push('../../(auth)/Login')}
            >
              <Text className="text-white font-semibold">Se connecter</Text>
            </TouchableOpacity>
    </SafeAreaView>
  )
}

export default RetourConnexion