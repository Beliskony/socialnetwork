import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import {  useSelector } from 'react-redux';
import { useAppDispatch} from '@/redux/hooks';
import { useRouter } from 'expo-router';
import { 
  initiatePasswordReset, 
  verifyResetCode, 
  resetPassword,
} from '@/redux/userSlice';
import { RootState } from '@/redux/store';

const ResetPassword = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { resetStep, resetLoading, verifyLoading } = useSelector((state: RootState) => state.user);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [usernameOrFullName, setUsernameOrFullName] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Étape 1: Initier la réinitialisation
  const handleInitiateReset = () => {
    if (!phoneNumber.trim() || !usernameOrFullName.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    dispatch(initiatePasswordReset({
      phoneNumber: phoneNumber.trim(),
      usernameOrFullName: usernameOrFullName.trim()
    }));
  };

  // Étape 2: Vérifier le code
  const handleVerifyCode = () => {
    if (!code.trim() || code.length !== 6) {
      Alert.alert('Erreur', 'Veuillez entrer le code à 6 chiffres');
      return;
    }
    dispatch(verifyResetCode({
      phoneNumber: phoneNumber.trim(),
      code: code.trim()
    }));
  };

  // Étape 3: Réinitialiser le mot de passe
  const handleResetPassword = () => {
    if (newPassword.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    dispatch(resetPassword({
      phoneNumber: phoneNumber.trim(),
      code: code.trim(),
      newPassword: newPassword.trim()
    }));
  };

  // Renvoyer le code
  const handleResendCode = () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Erreur', 'Numéro de téléphone requis');
      return;
    }
    dispatch(initiatePasswordReset({
      phoneNumber: phoneNumber.trim(),
      usernameOrFullName: usernameOrFullName.trim()
    }));
  };

  const renderStep1 = () => (
    <View className="w-full">
      <Text className="text-3xl font-bold text-center mb-3 text-gray-800">
        Mot de passe oublié
      </Text>
      <Text className="text-lg text-center mb-8 text-gray-600 leading-7">
        Nous allons vous envoyer un code de vérification par SMS
      </Text>

      <TextInput
        className="border-2 border-gray-200 rounded-xl p-5 mb-4 text-lg bg-white shadow-sm"
        placeholder="+2250707070707"
        placeholderTextColor="#9CA3AF"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />

      <TextInput
        className="border-2 border-gray-200 rounded-xl p-5 mb-6 text-lg bg-white shadow-sm"
        placeholder="Nom d'utilisateur ou nom complet"
        placeholderTextColor="#9CA3AF"
        value={usernameOrFullName}
        onChangeText={setUsernameOrFullName}
      />

      <TouchableOpacity
        className={`bg-blue-500 rounded-xl p-5 items-center shadow-lg ${resetLoading ? 'opacity-50' : ''}`}
        onPress={handleInitiateReset}
        disabled={resetLoading}
      >
        {resetLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-lg font-bold">
            Envoyer le code
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        className="mt-4 p-3 items-center"
        onPress={() => router.back()}
      >
        <Text className="text-gray-600 text-base">
          ← Retour à la connexion
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View className="w-full">
      <Text className="text-3xl font-bold text-center mb-3 text-gray-800">
        Vérification
      </Text>
      <Text className="text-lg text-center mb-8 text-gray-600 leading-7">
        Code envoyé au {phoneNumber}
      </Text>

      <TextInput
        className="border-2 border-blue-300 rounded-xl p-5 mb-6 text-2xl font-bold text-center bg-blue-50 shadow-sm"
        placeholder="000000"
        placeholderTextColor="#9CA3AF"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={6}
      />

      <View className="flex-row gap-3 mb-4">
        <TouchableOpacity
          className="flex-1 border-2 border-gray-300 rounded-xl p-4 items-center bg-white"
          onPress={() => router.back()}
        >
          <Text className="text-gray-700 text-lg font-semibold">
            Annuler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 bg-blue-500 rounded-xl p-4 items-center shadow-lg ${verifyLoading ? 'opacity-50' : ''}`}
          onPress={handleVerifyCode}
          disabled={verifyLoading}
        >
          {verifyLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-lg font-bold">
              Vérifier
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        className="items-center mt-2"
        onPress={handleResendCode}
      >
        <Text className="text-blue-500 text-base font-medium">
          Renvoyer le code
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View className="w-full">
      <Text className="text-3xl font-bold text-center mb-3 text-gray-800">
        Nouveau mot de passe
      </Text>

      <TextInput
        className="border-2 border-gray-200 rounded-xl p-5 mb-4 text-lg bg-white shadow-sm"
        placeholder="Nouveau mot de passe"
        placeholderTextColor="#9CA3AF"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      <TextInput
        className="border-2 border-gray-200 rounded-xl p-5 mb-6 text-lg bg-white shadow-sm"
        placeholder="Confirmer le mot de passe"
        placeholderTextColor="#9CA3AF"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <Text className="text-sm text-gray-500 mb-4 text-center">
        Le mot de passe doit contenir au moins 6 caractères
      </Text>

      <TouchableOpacity
        className={`bg-blue-500 rounded-xl p-5 items-center shadow-lg ${resetLoading ? 'opacity-50' : ''}`}
        onPress={handleResetPassword}
        disabled={resetLoading}
      >
        {resetLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-lg font-bold">
            Réinitialiser
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderSuccess = () => (
    <View className="w-full items-center">
      <Text className="text-4xl mb-4">🎉</Text>
      <Text className="text-2xl font-bold text-center mb-3 text-green-600">
        Succès !
      </Text>
      <Text className="text-lg text-center mb-8 text-gray-600 leading-7">
        Votre mot de passe a été réinitialisé avec succès
      </Text>

      <TouchableOpacity
        className="w-full bg-blue-500 rounded-xl p-5 items-center shadow-lg"
        onPress={() => router.replace('../login')}
      >
        <Text className="text-white text-lg font-bold">
          Se connecter
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        className="p-6 flex-1 mt-28"
        showsVerticalScrollIndicator={false}
      >
        {/* Indicateur de progression */}
        <View className="flex-row justify-center mb-8">
          {[1, 2, 3].map((step) => (
            <View
              key={step}
              className={`w-4 h-4 rounded-full mx-2 ${
                (step === 1 && resetStep === 'init') ||
                (step === 2 && resetStep === 'verify') ||
                (step === 3 && resetStep === 'complete') 
                  ? 'bg-blue-500' 
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </View>

        {/* Contenu selon l'étape */}
        {resetStep === 'init' && renderStep1()}
        {resetStep === 'verify' && renderStep2()}
        {resetStep === 'complete' && !resetLoading && renderSuccess()}
        {resetStep === 'complete' && resetLoading && (
          <View className="w-full items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-lg text-center mt-4 text-gray-600">
              Finalisation...
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ResetPassword;