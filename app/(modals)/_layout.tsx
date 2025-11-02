// app/(modals)/_layout.tsx
import { Stack } from "expo-router";
import { useTheme } from "@/hooks/toggleChangeTheme";

export default function ModalsLayout() {
  const { isDark } = useTheme();
  return (
    <Stack
      screenOptions={{
        presentation: "modal",
        headerShown: false,
        animation: "slide_from_bottom",
        gestureEnabled: true,
        gestureDirection: "vertical",
        contentStyle: {
          backgroundColor: "white",
        },
      }}
    >
      <Stack.Screen 
        name="editProfile" 
        options={{
          title: "Modifier le profil",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen 
        name="settings" 
        options={{
          title: "Paramètres",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen 
        name="followers" 
        options={{
          title: "Abonnés",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen 
        name="following" 
        options={{
          title: "Abonnements", 
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen 
        name="blocked-users" 
        options={{
          title: "Utilisateurs bloqués",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen 
        name="userProfile/[userId]" 
        options={{
          title: "Profil utilisateur",
          animation: "slide_from_right",
        }}
      />

      <Stack.Screen 
        name="follows/[userFollowers]" 
        options={{
          title: "userFollowers",
          animation: "slide_from_right",
        }}
      />

      <Stack.Screen 
        name="follows/[userFollowings]" 
        options={{
          title: "userFollowings",
          animation: "slide_from_right",
        }}
      />

      <Stack.Screen 
        name="help" 
        options={{
          title: "Aide et support",
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}