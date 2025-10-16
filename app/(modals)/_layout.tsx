// app/(modals)/_layout.tsx
import { Stack } from "expo-router";

export default function ModalsLayout() {
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
        name="edit-profile" 
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
        name="user-profile" 
        options={{
          title: "Profil utilisateur",
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