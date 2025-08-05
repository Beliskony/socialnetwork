import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';

const SignIn: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phoneNumber: '',
        password: '',
    });

    const [isLoading, setIsLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const handleInputChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const router = useRouter();

    const handleSignUp = async () => {
        if (!formData.username || !formData.password || !formData.email || !formData.phoneNumber) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(`https://apisocial-g8z6.onrender.com/api/user/register`, formData);

            if (response.status === 201) {
                // Rediriger ou enregistrer le token ici si nécessaire
                router.replace('/(tabs)/home')
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert('Erreur', error.response?.data?.message || 'Échec de l’inscription');
        } finally{
            setIsLoading(false);
        }
    };

    return (
        <View className="flex flex-col justify-center items-center w-full bg-white my-16 px-4">
            <Text className="text-3xl font-bold mb-8 text-[#F1895C]">Bienvenue</Text>

            <TextInput
                className="w-full border border-gray-300 rounded-md p-3 mb-4"
                placeholder="Entrer votre Nom"
                placeholderTextColor="#aaa"
                value={formData.username}
                onChangeText={(text) => handleInputChange('username', text)}
            />

            <TextInput
                className="w-full border border-gray-300 rounded-md p-3 mb-4"
                placeholder="Contact"
                placeholderTextColor="#aaa"
                keyboardType="phone-pad"
                value={formData.phoneNumber}
                onChangeText={(text) => handleInputChange('phoneNumber', text)}
            />

            <TextInput
                className="w-full border border-gray-300 rounded-md p-3 mb-4"
                placeholder="email"
                placeholderTextColor="#aaa"
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
            />

            <View className="w-full relative">
                <TextInput
                    className="w-full h-12 bg-white rounded-lg px-4 mb-4 border border-[#C5C6C6]"
                    placeholder="Mot de passe"
                    placeholderTextColor="#aaa"
                    secureTextEntry={!showPassword}
                    value={formData.password}
                    onChangeText={(text) => handleInputChange('password', text)}
                />
                <TouchableOpacity
                    onPress={togglePasswordVisibility}
                    className="absolute right-4 top-3"
                >
                    <Image
                        source={{
                            uri: showPassword
                                ? 'https://img.icons8.com/?size=100&id=96181&format=png&color=000000'
                                : 'https://img.icons8.com/?size=100&id=986&format=png&color=000000',
                        }}
                        className="h-6 w-6"
                    />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                className="w-full h-12 bg-[#2E3244] text-xl font-bold justify-center items-center rounded-lg mt-5"
                onPress={handleSignUp}
            >
                <Text className="text-white text-center text-lg">Inscription</Text>
            </TouchableOpacity>
        </View>
    );
};

export default SignIn;
