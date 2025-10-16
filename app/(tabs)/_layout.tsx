// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router"
import { Platform } from "react-native"
import { HapticTab } from "@/components/HapticTab"
import TabBarBackground from "@/components/ui/TabBarBackground"
import { useColorScheme } from "@/hooks/useColorScheme"
import { 
  Home, 
  User, 
  Bell, 
  Users 
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
            shadowOpacity: 0.08,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: -4 },
            marginBottom: 0,
            height: 75,
            paddingBottom: 12,
            paddingTop: 12,
          },
          default: {
            position: "absolute",
            backgroundColor: "#FFFFFF",
            borderTopWidth: 0,
            elevation: 12,
            marginBottom: 0,
            height: 75,
            paddingBottom: 12,
            paddingTop: 12,
          },
        }),
        tabBarIconStyle: {
          marginBottom: -4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size, focused }) => (
            <Home 
              size={28} 
              color={color}
              fill={focused ? color : "transparent"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size, focused }) => (
            <User 
              size={28} 
              color={color}
              fill={focused ? color : "transparent"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, size, focused }) => (
            <Bell 
              size={28} 
              color={color}
              fill={focused ? color : "transparent"}
            />
          ),
        }}
      />

    
    </Tabs>
  )
}