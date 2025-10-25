// app/(auth)/index.tsx
import { View, Text, TouchableOpacity, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { UserPlus, LogIn } from "lucide-react-native"

export default function AuthHomeScreen() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 justify-center">
        
        {/* Header */}
        <View className="items-center mb-16">
          <Image source={require('@/assets/images/Found-Me.png')} className="h-64 object-cover"/>
          <Text className="text-xl text-slate-600 text-center">
            Connectez-vous à votre communauté
          </Text>
        </View>

        {/* Buttons */}
        <View className="space-y-4 gap-y-6">
          {/* Bouton Inscription */}
          <TouchableOpacity
            onPress={() => router.push("../SignIn")}
            className="w-full h-16 bg-blue-600 rounded-2xl justify-center items-center flex-row space-x-3 gap-x-2"
          >
            <UserPlus size={20} color="#FFFFFF" />
            <Text className="text-white text-lg font-semibold">
              Créer un compte
            </Text>
          </TouchableOpacity>

          {/* Bouton Connexion */}
          <TouchableOpacity
            onPress={() => router.push("../Login")}
            className="w-full h-16 bg-white border-2 border-slate-200 rounded-2xl justify-center items-center flex-row space-x-3 gap-x-2"
          >
            <LogIn size={20} color="#374151" />
            <Text className="text-slate-900 text-lg font-semibold">
              Se connecter
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  )
}