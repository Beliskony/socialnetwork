import { Tabs } from "expo-router"
import { Platform } from "react-native"
import { HapticTab } from "@/components/HapticTab"
import TabBarBackground from "@/components/ui/TabBarBackground"
import { useColorScheme } from "@/hooks/useColorScheme"
import { Image } from "react-native"

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
          tabBarIcon: ({ color, focused }) => {
            return (
              <Image
                source={focused ? require("@/assets/images/home.png") : require("@/assets/images/homeOutline.png")}
                style={{ width: 28, height: 28, tintColor: color }}
              />
            )
          },
        }}
      />

      <Tabs.Screen
        name="me"
        options={{
          tabBarIcon: ({ color, focused }) => {
            return (
              <Image
                source={focused ? require("@/assets/images/compte.png") : require("@/assets/images/compteOutline.png")}
                style={{ width: 28, height: 28, tintColor: color }}
              />
            )
          },
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          tabBarIcon: ({ color, focused }) => {
            return (
              <Image
                source={
                  focused
                    ? require("@/assets/images/notification.png")
                    : require("@/assets/images/notificationOutline.png")
                }
                style={{ width: 28, height: 28, tintColor: color }}
              />
            )
          },
        }}
      />

      <Tabs.Screen
        name="follow"
        options={{
          tabBarIcon: ({ color, focused }) => {
            return (
              <Image
                source={focused ? require("@/assets/images/follows.png") : require("@/assets/images/follows.png")}
                style={{ width: 28, height: 28, tintColor: color }}
              />
            )
          },
        }}
      />
    </Tabs>
  )
}
