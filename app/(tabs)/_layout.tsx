// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router"
import { Platform, View } from "react-native"
import { HapticTab } from "@/components/HapticTab"
import TabBarBackground from "@/components/ui/TabBarBackground"
import { useColorScheme } from "@/hooks/useColorScheme"
import { 
  Home, 
  User, 
  Bell, 
  Search,
  Plus,
  MessageCircle
} from "lucide-react-native"

export default function TabLayout() {
  const colorScheme = useColorScheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarShowLabel: false,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            backgroundColor: "#FFFFFF",
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0.1,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: -4 },
            shadowColor: "#000000",
            marginBottom: 0,
            height: 45,
            paddingTop: 8,
            paddingBottom: 2,
            borderRadius: 24,
            borderTopRightRadius: 24,
            marginHorizontal: 7,
            width: 'auto',
          },
          default: {
            position: "absolute",
            backgroundColor: "#FFFFFF",
            borderTopWidth: 0,
            elevation: 16,
            shadowOpacity: 0.1,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: -4 },
            shadowColor: "#000000",
            marginBottom: 0,
            height: 45,
            paddingTop: 8,
            paddingBottom: 2,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            marginHorizontal: 7,
            width: 'auto',
          },
        }),
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size, focused }) => (
            <View className={`p-2 rounded-2xl ${focused ? 'bg-blue-50' : ''}`}>
              <Home 
                size={24} 
                color={focused ? "#3B82F6" : color}
                fill={focused ? "#3B82F6" : "transparent"}
                strokeWidth={focused ? 2.5 : 2}
              />
            </View>
          ),
        }}
      />


      {/* Tab centrale spéciale pour la création */}
      <Tabs.Screen
        name="create"
        options={{
          title: "Créer",
          tabBarIcon: ({ color, size, focused }) => (
            <View className="bg-blue-600 p-3 rounded-2xl -mt-6 shadow-lg shadow-blue-600/30">
              <Plus 
                size={22} 
                color="#FFFFFF"
                strokeWidth={2.5}
              />
            </View>
          ),
          tabBarLabel: () => null, // Cache le label pour cette tab
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, size, focused }) => (
            <View className={`p-2 rounded-2xl ${focused ? 'bg-blue-50' : ''}`}>
              <Bell 
                size={24} 
                color={focused ? "#3B82F6" : color}
                fill={focused ? "#3B82F6" : "transparent"}
                strokeWidth={focused ? 2.5 : 2}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size, focused }) => (
            <View className={`p-2 rounded-2xl ${focused ? 'bg-blue-50' : ''}`}>
              <User 
                size={24} 
                color={focused ? "#3B82F6" : color}
                fill={focused ? "#3B82F6" : "transparent"}
                strokeWidth={focused ? 2.5 : 2}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  )
}