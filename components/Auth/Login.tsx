import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Image, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setUser } from '@/redux/userSlice';

const LoginScreen = () => {
  const [identifiant, setIdentifiant] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    if (!identifiant || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
      
    }
    setIsLoading(true);

    try {
      const res = await axios.post('https://apisocial-g8z6.onrender.com/api/user/login', {
        identifiant,
        password,
      });

      const { token, id, username, email, profilePicture, posts, followers } = res.data;

      const userData = {
        _id: id,
        username,
        email,
        profilePicture,
        token,
        followersCount: followers?.length || 0,
        postsCount: posts?.length || 0,
      };

        await AsyncStorage.setItem('user', JSON.stringify(userData));

      dispatch(setUser(userData));

      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert('Échec', error?.response?.data?.message || 'Identifiants invalides.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex flex-col w-full justify-center items-center my-14 bg-white p-5">
      <Text className="text-3xl font-bold mb-8 text-[#F1895C]">Bon retour</Text>

      <TextInput
        className="w-full h-12 bg-white rounded-lg px-4 mb-4 border border-[#C5C6C6]"
        placeholder="Email ou numéro"
        placeholderTextColor="#aaa"
        keyboardType="default"
        autoCapitalize="none"
        value={identifiant}
        onChangeText={setIdentifiant}
      />

      <View className="w-full relative">
        <TextInput
          className="w-full h-12 bg-white rounded-lg px-4 mb-4 border border-[#C5C6C6]"
          placeholder="Mot de passe"
          placeholderTextColor="#aaa"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
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
        className="w-full h-12 bg-[#2E3244] rounded-lg justify-center items-center mt-0"
        onPress={handleLogin}
        disabled={isLoading}
      >  
      {isLoading ? ( <ActivityIndicator size="small" color="#FFFFFF" /> ) : <Text className="text-white text-xl font-bold">Connexion</Text>}
        
      </TouchableOpacity>

      <TouchableOpacity>
        <Text className="text-[#516079] my-4 text-sm">Mot de passe oublié ?</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default LoginScreen;
