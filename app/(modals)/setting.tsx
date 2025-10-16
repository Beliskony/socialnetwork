// app/(modals)/settings.tsx
import { View, Text, TouchableOpacity, ScrollView, Alert, Switch } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { logout, updatePrivacySettings } from "@/redux/userSlice"
import { router } from "expo-router"
import { 
  X, 
  Bell, 
  Lock, 
  Shield, 
  Moon, 
  Globe, 
  HelpCircle, 
  LogOut,
  UserX
} from "lucide-react-native"

export default function SettingsModal() {
  const dispatch = useDispatch()
  const { currentUser } = useSelector((state: RootState) => state.user)
  
  const [notifications, setNotifications] = useState({
    newFollower: true,
    postLikes: true,
    postComments: true,
    newMessage: true,
  })

  const [privacy, setPrivacy] = useState({
    profile: currentUser?.preferences?.privacy?.profile || 'public',
    posts: currentUser?.preferences?.privacy?.posts || 'public',
  })

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Déconnexion", 
          style: "destructive",
          onPress: () => {
            dispatch(logout())
            router.replace('/')
          }
        }
      ]
    )
  }

  const handleDeactivateAccount = () => {
    Alert.alert(
      "Désactiver le compte",
      "Cette action est irréversible. Votre compte sera désactivé pendant 30 jours avant suppression définitive.",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Désactiver", 
          style: "destructive",
          onPress: () => {
            // TODO: Implémenter la désactivation
            Alert.alert("Compte désactivé", "Votre compte a été désactivé")
          }
        }
      ]
    )
  }

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onPress, 
    showSwitch,
    value,
    onValueChange 
  }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      className="flex-row items-center justify-between py-4 px-2 active:bg-slate-50 rounded-lg"
    >
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center mr-3">
          <Icon size={20} color="#64748b" />
        </View>
        <View className="flex-1">
          <Text className="font-medium text-slate-900">{title}</Text>
          {subtitle && <Text className="text-slate-500 text-sm mt-1">{subtitle}</Text>}
        </View>
      </View>
      
      {showSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
          thumbColor={value ? '#ffffff' : '#ffffff'}
        />
      ) : (
        <Text className="text-slate-400">›</Text>
      )}
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <X size={24} color="#64748b" />
        </TouchableOpacity>
        
        <Text className="text-lg font-semibold text-slate-900">Paramètres</Text>
        
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Notifications */}
        <View className="bg-white mt-4 mx-4 rounded-xl p-2">
          <Text className="font-semibold text-slate-900 text-lg px-2 py-3">
            <Bell size={20} color="#64748b" className="mr-2" />
            Notifications
          </Text>
          
          <View className="border-t border-slate-100">
            <SettingItem
              icon={UserX}
              title="Nouveaux abonnés"
              showSwitch
              value={notifications.newFollower}
              onValueChange={(value: boolean) => setNotifications(prev => ({ ...prev, newFollower: value }))}
            />
            <SettingItem
              icon={Bell}
              title="Likes sur mes posts"
              showSwitch
              value={notifications.postLikes}
              onValueChange={(value: boolean) => setNotifications(prev => ({ ...prev, postLikes: value }))}
            />
            <SettingItem
              icon={Globe}
              title="Commentaires"
              showSwitch
              value={notifications.postComments}
              onValueChange={(value: boolean) => setNotifications(prev => ({ ...prev, postComments: value }))}
            />
            <SettingItem
              icon={HelpCircle}
              title="Nouveaux messages"
              showSwitch
              value={notifications.newMessage}
              onValueChange={(value: boolean) => setNotifications(prev => ({ ...prev, newMessage: value }))}
            />
          </View>
        </View>

        {/* Confidentialité */}
        <View className="bg-white mt-4 mx-4 rounded-xl p-2">
          <Text className="font-semibold text-slate-900 text-lg px-2 py-3">
            <Lock size={20} color="#64748b" className="mr-2" />
            Confidentialité
          </Text>
          
          <View className="border-t border-slate-100">
            <SettingItem
              icon={Globe}
              title="Visibilité du profil"
              subtitle={privacy.profile === 'public' ? 'Public' : 'Privé'}
              onPress={() => {
                Alert.alert(
                  "Visibilité du profil",
                  "Qui peut voir votre profil ?",
                  [
                    { text: "Public", onPress: () => setPrivacy(prev => ({ ...prev, profile: 'public' })) },
                    { text: "Privé", onPress: () => setPrivacy(prev => ({ ...prev, profile: 'private' })) },
                    { text: "Annuler", style: "cancel" }
                  ]
                )
              }}
            />
            <SettingItem
              icon={Shield}
              title="Visibilité des posts"
              subtitle={privacy.posts === 'public' ? 'Public' : 'Privé'}
              onPress={() => {
                Alert.alert(
                  "Visibilité des posts",
                  "Qui peut voir vos posts ?",
                  [
                    { text: "Public", onPress: () => setPrivacy(prev => ({ ...prev, posts: 'public' })) },
                    { text: "Privé", onPress: () => setPrivacy(prev => ({ ...prev, posts: 'private' })) },
                    { text: "Annuler", style: "cancel" }
                  ]
                )
              }}
            />
            <SettingItem
              icon={UserX}
              title="Utilisateurs bloqués"
              subtitle="Gérer la liste"
              onPress={() => router.push('../blocked-users')}
            />
          </View>
        </View>

        {/* Apparence */}
        <View className="bg-white mt-4 mx-4 rounded-xl p-2">
          <Text className="font-semibold text-slate-900 text-lg px-2 py-3">
            <Moon size={20} color="#64748b" className="mr-2" />
            Apparence
          </Text>
          
          <View className="border-t border-slate-100">
            <SettingItem
              icon={Moon}
              title="Mode sombre"
              subtitle="Activer le thème sombre"
              showSwitch
              value={false}
              onValueChange={() => {}}
            />
          </View>
        </View>

        {/* Compte */}
        <View className="bg-white mt-4 mx-4 rounded-xl p-2">
          <Text className="font-semibold text-slate-900 text-lg px-2 py-3">
            Compte
          </Text>
          
          <View className="border-t border-slate-100">
            <SettingItem
              icon={HelpCircle}
              title="Aide et support"
              onPress={() => router.push('/')}
            />
            <SettingItem
              icon={LogOut}
              title="Déconnexion"
              onPress={handleLogout}
            />
            <SettingItem
              icon={UserX}
              title="Désactiver le compte"
              titleStyle="text-red-600"
              onPress={handleDeactivateAccount}
            />
          </View>
        </View>

        {/* Espace en bas */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  )
}