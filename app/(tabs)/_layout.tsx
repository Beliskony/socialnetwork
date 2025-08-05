import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import AnimatedTabBarBackground from '@/components/ui/AnimatedTabBarBg';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor:'#F1895C',
        tabBarInactiveTintColor:'#2E3244',
        tabBarShowLabel: false,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
            backgroundColor: 'white',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0.1,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: -5 },
            marginBottom: 0,
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
            
          },
          default: {
            position:'absolute',
            backgroundColor: 'white',
            borderTopWidth: 0,
            elevation: 8,
            marginBottom: 0,
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
          },
        }),
        tabBarIconStyle:{
          marginBottom: -4
        }
        
      }}>


      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, focused }) =>{
            return (<Image source={ focused ? require('@/assets/images/home.png') : require('@/assets/images/homeOutline.png')
         } style = {{width: 30, height: 30, tintColor:color}}
         />
        )}
        }}
      />

      <Tabs.Screen
        name="me"
        options={{
          tabBarIcon: ({ color, focused }) =>{
            return (<Image source={ focused ? require('@/assets/images/compte.png') : require('@/assets/images/compteOutline.png')
         } style = {{width: 30, height: 30, tintColor:color}}
         />
        )}
        }}
      />

      <Tabs.Screen
        name="creater"
        options={{
          tabBarIcon: ({ color, focused }) =>{
            return (<Image source={ focused ? require('@/assets/images/create.png') : require('@/assets/images/createOutline.png')
         } style = {{width: 30, height: 30, tintColor:color}}
         />
        )}
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          tabBarIcon: ({ color, focused }) =>{
            return (<Image source={ focused ? require('@/assets/images/notification.png') : require('@/assets/images/notificationOutline.png')
         } style = {{width: 30, height: 30, tintColor:color}}
         />
        )}
        }}
      />

      <Tabs.Screen
        name="follow"
        options={{
          tabBarIcon: ({ color, focused }) =>{
            return (<Image source={ focused ? require('@/assets/images/follows.png') : require('@/assets/images/follows.png')
         } style = {{width: 30, height: 30, tintColor:color}}
         />
        )}
        }}
      />
      
    </Tabs>
  );
}
