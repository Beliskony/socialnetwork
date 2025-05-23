import { View, Text, SafeAreaView } from 'react-native';
import { useState } from 'react';
import { Switch } from 'react-native';
import LoginScreen from '@/components/loginSign/Login';
import SignIn from '@/components/loginSign/SignIn';

export default function HomeScreen() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleSwitch = () => { setIsLogin((previousState) => !previousState) };

  const toggleAuthScreen = () => { setIsLogin((previousState) => !previousState) };


  return (
    <SafeAreaView className='flex h-full w-full justify-center items-center my-7'>
        <View className='h-screen w-full items-center'>
           <View className='flex-row justify-start items-center'>

                <Text className={`text-xs font-bold ${isLogin ? "font-bold"  : "text-gray"}`}>Connexion</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={isLogin ? "#f5dd4b" : "#f4f3f4"}
                    onValueChange={toggleSwitch}
                    value={isLogin}
                />
                <Text className={`text-xs font-bold ${!isLogin ? "font-bold"  : "text-gray"}`}>Inscription</Text>

            </View>
            {/*Le rendu*/}

            <View className='w-full h-full px-5'>
              {isLogin? <LoginScreen/> : <SignIn/>}
            </View>
        </View>
    </SafeAreaView>
  );
}

