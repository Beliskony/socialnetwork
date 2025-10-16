// app/(modals)/help.tsx
import { View, Text, TouchableOpacity, ScrollView, Linking, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"
import { X, HelpCircle, Mail, MessageCircle, FileText, Shield } from "lucide-react-native"

export default function HelpModal() {
  const helpItems = [
    {
      icon: HelpCircle,
      title: "Centre d'aide",
      description: "Trouvez des réponses à vos questions",
      onPress: () => Linking.openURL('https://help.votre-app.com')
    },
    {
      icon: Mail,
      title: "Nous contacter",
      description: "Envoyez-nous un email",
      onPress: () => Linking.openURL('mailto:support@votre-app.com')
    },
    {
      icon: MessageCircle,
      title: "Chat en direct",
      description: "Discutez avec notre équipe",
      onPress: () => Alert.alert("Chat", "Fonctionnalité à venir")
    },
    {
      icon: FileText,
      title: "Conditions d'utilisation",
      description: "Lisez nos conditions de service",
      onPress: () => Linking.openURL('https://votre-app.com/terms')
    },
    {
      icon: Shield,
      title: "Politique de confidentialité",
      description: "Comment nous protégeons vos données",
      onPress: () => Linking.openURL('https://votre-app.com/privacy')
    }
  ]

  const HelpItem = ({ icon: Icon, title, description, onPress }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      className="flex-row items-center p-4 border-b border-slate-100 active:bg-slate-50"
    >
      <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
        <Icon size={20} color="#3b82f6" />
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-slate-900">{title}</Text>
        <Text className="text-slate-500 text-sm mt-1">{description}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <X size={24} color="#64748b" />
        </TouchableOpacity>
        
        <Text className="text-lg font-semibold text-slate-900">Aide et support</Text>
        
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {helpItems.map((item, index) => (
            <HelpItem key={index} {...item} />
          ))}
        </View>

        {/* Version de l'app */}
        <View className="items-center py-8">
          <Text className="text-slate-400 text-sm">Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}