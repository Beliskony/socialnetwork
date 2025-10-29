// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router"
import { Platform, View } from "react-native"
import { HapticTab } from "@/components/HapticTab"
import TabBarBackground from "@/components/ui/TabBarBackground"
import { useTheme } from "@/hooks/toggleChangeTheme"
import { 
  Home, 
  User, 
  Bell, 
  Users,
} from "lucide-react-native"

export default function TabLayout() {
  const { isDark } = useTheme()

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
            position: 'absolute',
            backgroundColor: isDark ? "#000000" : "#FFFFFF", // Noir pur en dark
            elevation: 0,
            borderTopWidth: 1,
            shadowOpacity: isDark ? 0 : 0.1, // Pas d'ombre en dark
            shadowOffset: { width: 0, height: -4 },
            shadowRadius: 20,
            shadowColor: isDark ? "transparent" : "#000000",
            bottom: 0,
            left: 0,
            right: 0,
            marginHorizontal: 0,
            height: 50, // Hauteur pour couvrir safe area
            borderColor: "#94A3B8",
            paddingTop: 8,
            paddingBottom: 34, // Compensation safe area iPhone
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          },
          default: {
            position: 'absolute',
            backgroundColor: isDark ? "#000000" : "#FFFFFF", // Noir pur en dark
            borderTopWidth: 1,
            elevation: isDark ? 0 : 16, // Pas d'élévation en dark
            shadowOpacity: isDark ? 0 : 0.1,
            shadowOffset: { width: 0, height: -4 },
            shadowRadius: 20,
            shadowColor: isDark ? "transparent" : "#000000",
            bottom: 0,
            left: 0,
            right: 0,
            marginHorizontal: 0,
            height: 50,
            borderColor: "#94A3B8",
            paddingTop: 8,
            paddingBottom: 8,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
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
            <View className={`p-2 rounded-2xl ${focused ? (isDark ? 'bg-gray-800' : 'bg-blue-50') : ''}`}>
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

      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, size, focused }) => (
            <View className={`p-2 rounded-2xl ${focused ? (isDark ? 'bg-gray-800' : 'bg-blue-50') : ''}`}>
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
            <View className={`p-2 rounded-2xl ${focused ? (isDark ? 'bg-gray-800' : 'bg-blue-50') : ''}`}>
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

       {/* Tab centrale spéciale pour la création */}
      <Tabs.Screen
        name="follow"
        options={{
          title: "follow",
          tabBarIcon: ({ color, size, focused }) => (
            <View className={`p-2 rounded-2xl ${focused ? (isDark ? 'bg-gray-800' : 'bg-blue-50') : ''}`}>
              <Users
                size={22} 
                color={focused ? "#3B82F6" : color}
                fill={focused ? "#3B82F6" : "transparent"}
                strokeWidth={focused ? 2.5 : 2}
              />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
    </Tabs>
  )
}