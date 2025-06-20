import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import LoginScreen from '@/components/Auth/Login';
import SignIn from '@/components/Auth/SignIn';

export default function HomeScreen() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <SafeAreaView className='flex flex-col h-screen w-screen justify-center items-center bg-white'>
        <View className='h-screen w-screen items-center'>
           
            {/*Le rendu*/}

            <View className='flex flex-col justify-center items-center w-full h-full p-5'>
              
              {isLogin? <SignIn/> : <LoginScreen/> }


              <View className='flex-row justify-center items-center'>

                <View className='flex flex-row items-center justify-center w-[80%] py-5 gap-x-5 bg-[#F1895C] rounded-3xl'>
                  <TouchableOpacity onPress={() => setIsLogin(true)}>
                    <Text className={`text-lg ${isLogin ? "text-[#2E3244] font-bold bg-white rounded-xl p-2" : "text-[#C5C6C6] font-normal"} `}>Inscrivez-vous </Text>
                  </TouchableOpacity>


                  <TouchableOpacity onPress={() => setIsLogin(false)}>
                    <Text className={`text-lg ${isLogin ? "text-[#C5C6C6] font-normal" : "text-[#2E3244] font-bold bg-white rounded-xl p-2"} `}>Connectez-vous</Text>
                  </TouchableOpacity>

                </View>

            </View>
            </View>
        </View>
    </SafeAreaView>
  );
}

