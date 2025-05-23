import React, { useState } from 'react';
import axios from 'axios';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

   /* const handleLogin = async () => {
        try {
            const response = await axios.post('http://10.0.2.2:3001/api/user/login', {
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
        } catch (error) {
            Alert.alert('Error', 'Login failed. Please try again.');
            console.error(error);
        } 
    };*/

    return (
        <SafeAreaView className="flex-1 h-full justify-center items-center bg-gray-100 px-5">
            <Text className="text-2xl font-bold mb-8 text-gray-800">Welcome Back</Text>
            <TextInput
                className="w-full h-12 bg-white rounded-lg px-4 mb-4 border border-gray-300"
                placeholder="Email"
                placeholderTextColor="#aaa"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />
            <View className="w-full relative">
                <TextInput
                    className="w-full h-12 bg-white rounded-lg px-4 mb-4 border border-gray-300"
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
                    <Text className="text-blue-500 font-bold">
                        {showPassword ? 'Hide' : 'Show'}
                    </Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                
                className="w-full h-12 bg-blue-500 rounded-lg justify-center items-center mt-5"
            >
                <Text className="text-white text-lg font-bold">Login</Text>
            </TouchableOpacity>
            <TouchableOpacity>
                <Text className="text-blue-500 mt-4 text-sm">Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity>
                <Text className="text-blue-500 mt-2 text-sm">
                    Don't have an account? Sign Up
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default LoginScreen;
