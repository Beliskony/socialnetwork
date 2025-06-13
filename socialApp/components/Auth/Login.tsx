import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';



const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

const router = useRouter();




   /* const handleLogin = async () => {
        try {
            const response = await axios.post('https://apisocial.railway.internal/api/user/login', {
                email,
                password,
            });

            const { token, user } = response.data;

            //Stocker le token
            await AsyncStorage.setItem('token', response.data.token);
            //Stocker l'utilisateur
            await AsyncStorage.setItem('user', response.data.user);
            //Rediriger l'utilisateur vers la page d'accueil

            Alert.alert('Success', 'Login successful!');
            console.log(response.data);
            router.replace('/(tabs)/HomeScreen');
        } catch (error) {
            Alert.alert('Error', 'Login failed. Please try again.');
            console.error(error);
        } 
    };*/

    return (
        <SafeAreaView className="flex flex-col w-full h-2/3 justify-center items-center bg-white p-5">
            
            <Text className="text-3xl font-bold mb-8 text-[#F1895C]">Bon retour</Text>
            <TextInput
                className="w-full h-12 bg-white rounded-lg px-4 mb-4 border border-[#C5C6C6]"
                placeholder="Email"
                placeholderTextColor="#aaa"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />
            <View className="w-full relative">
                <TextInput
                    className="w-full h-12 bg-white rounded-lg px-4 mb-4 border border-[#C5C6C6]"
                    placeholder="Password"
                    placeholderTextColor="#aaa"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                />
                <TouchableOpacity
                    onPress={togglePasswordVisibility}
                    className="absolute right-4 top-3"
                >
                    <Text className="flex">
                        {showPassword ? <Image source={{uri: "https://img.icons8.com/?size=100&id=96181&format=png&color=000000"}} className='h-6 w-6' /> : 
                        <Image source={{uri: "https://img.icons8.com/?size=100&id=986&format=png&color=000000"}} className='h-6 w-6' />}
                    </Text>
                </TouchableOpacity>
            </View>


            <TouchableOpacity
                className="w-full h-12 bg-[#2E3244] rounded-lg justify-center items-center mt-5"
                onPress={() =>router.replace('/(tabs)/home') }
            >
                <Text className="text-white text-xl font-bold">Login</Text>
            </TouchableOpacity>

            <TouchableOpacity>
                <Text className="text-[#516079] my-4 text-sm">Mot de passe oublier ?</Text>
            </TouchableOpacity>

        </SafeAreaView>
    );
};

export default LoginScreen;
