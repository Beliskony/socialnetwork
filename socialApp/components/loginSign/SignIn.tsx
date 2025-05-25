import React, { useState } from 'react';
import axios from 'axios';
import { View, Text, TextInput, TouchableOpacity, Image} from 'react-native';

const SignIn: React.FC = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        contact: '',
        birthDate: '',
        password: '',
        otp: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    const handleInputChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

     const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

   /* const sendOtp = async () => {
        if (!formData.contact) {
            Alert.alert('Error', 'Please enter your contact number.');
            return;
        }
        try {
            const response = await axios.post('http://10.0.2.2:3001/api/user/register', {
                contact: formData.contact,
            });
            if (response.data.success) {
                setOtpSent(true);
                Alert.alert('OTP Sent', 'A verification code has been sent to your contact.');
            } else {
                Alert.alert('Error', response.data.message || 'Failed to send OTP.');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while sending OTP.');
        }
    };

    const verifyOtpAndSignIn = async () => {
        if (!formData.otp) {
            Alert.alert('Error', 'Please enter the OTP.');
            return;
        }
        try {
            const response = await axios.post('http://localhost:3001/api/user/register', {
                contact: formData.contact,
                otp: formData.otp,
            });
            if (response.data.success) {
                Alert.alert('Success', 'You are now signed in!');
                // Navigate to the feed or next screen
            } else {
                Alert.alert('Error', response.data.message || 'Invalid OTP. Please try again.');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while verifying OTP.');
        }
    }; */

    return (
        <View className="flex flex-col justify-center items-center w-full bg-white my-16">
            <Text className="text-3xl font-bold mb-8 text-[#F1895C]">Bienvenue </Text>

            {!otpSent ? (
                <>
                    <TextInput
                        className="w-full border border-gray-300 rounded-md p-3 mb-4"
                        placeholder="Entrer votre Nom"
                        value={formData.lastName}
                        onChangeText={(text) => handleInputChange('lastName', text)}
                    />

                    <TextInput
                        className="w-full border border-gray-300 rounded-md p-3 mb-4"
                        placeholder="Entrer votre Prénom"
                        value={formData.firstName}
                        onChangeText={(text) => handleInputChange('firstName', text)}
                    />

                    <TextInput
                        className="w-full border border-gray-300 rounded-md p-3 mb-4"
                        placeholder="Contact"
                        placeholderTextColor={"#aaa"}
                        keyboardType="phone-pad"
                        value={formData.contact}
                        onChangeText={(text) => handleInputChange('contact', text)}
                    />

                    <TextInput
                        className=" w-full border border-gray-300 rounded-md p-3 mb-4"
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={"#aaa"}
                        value={formData.birthDate}
                        onChangeText={(Date) => handleInputChange('birthDate', Date)}
                    />

                   <View className="w-full relative">
                                   <TextInput
                                       className="w-full h-12 bg-white rounded-lg px-4 mb-4 border border-[#C5C6C6]"
                                       placeholder="Password"
                                       placeholderTextColor="#aaa"
                                       secureTextEntry={!showPassword}
                                       value={formData.password}
                                       onChangeText={(text) => handleInputChange('password', text)}
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

                    <TouchableOpacity className="w-full h-12 bg-[#2E3244] text-xl font-bold justify-center items-center rounded-lg mt-5" /*onPress={sendOtp}*/ >
                        <Text className="text-white text-center text-lg">Inscription</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <Text className="text-lg mb-2 text-gray-800">Enter OTP</Text>
                    <TextInput
                        className="border border-gray-300 rounded-md p-3 mb-4"
                        placeholder="Enter the OTP"
                        keyboardType="numeric"
                        value={formData.otp}
                        onChangeText={(text) => handleInputChange('otp', text)}
                    />

                    <TouchableOpacity
                        className="bg-blue-500 p-4 rounded-md"
                        //onPress={verifyOtpAndSignIn}
                    >
                        <Text className="text-white text-center text-lg">Verify and Sign In</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

export default SignIn;
