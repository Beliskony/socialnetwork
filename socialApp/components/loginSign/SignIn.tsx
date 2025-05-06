import React, { useState } from 'react';
import axios from 'axios';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
} from 'react-native';

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

    const sendOtp = async () => {
        if (!formData.contact) {
            Alert.alert('Error', 'Please enter your contact number.');
            return;
        }
        try {
            const response = await axios.post('https://your-backend-url.com/send-otp', {
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
            const response = await axios.post('https://your-backend-url.com/verify-otp', {
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
    };

    return (
        <View className="flex-1 p-5 bg-white">
            {!otpSent ? (
                <>
                    <Text className="text-lg mb-2 text-gray-800">First Name</Text>
                    <TextInput
                        className="border border-gray-300 rounded-md p-3 mb-4"
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChangeText={(text) => handleInputChange('firstName', text)}
                    />

                    <Text className="text-lg mb-2 text-gray-800">Last Name</Text>
                    <TextInput
                        className="border border-gray-300 rounded-md p-3 mb-4"
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChangeText={(text) => handleInputChange('lastName', text)}
                    />

                    <Text className="text-lg mb-2 text-gray-800">Contact</Text>
                    <TextInput
                        className="border border-gray-300 rounded-md p-3 mb-4"
                        placeholder="Enter your contact number"
                        keyboardType="phone-pad"
                        value={formData.contact}
                        onChangeText={(text) => handleInputChange('contact', text)}
                    />

                    <Text className="text-lg mb-2 text-gray-800">Date of Birth</Text>
                    <TextInput
                        className="border border-gray-300 rounded-md p-3 mb-4"
                        placeholder="YYYY-MM-DD"
                        value={formData.birthDate}
                        onChangeText={(text) => handleInputChange('birthDate', text)}
                    />

                    <Text className="text-lg mb-2 text-gray-800">Password</Text>
                    <View className="flex-row items-center">
                        <TextInput
                            className="flex-1 border border-gray-300 rounded-md p-3"
                            placeholder="Enter your password"
                            secureTextEntry={!showPassword}
                            value={formData.password}
                            onChangeText={(text) => handleInputChange('password', text)}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            className="ml-3"
                        >
                            <Text className="text-blue-500">{showPassword ? 'Hide' : 'Show'}</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        className="bg-blue-500 p-4 rounded-md mt-5"
                        onPress={sendOtp}
                    >
                        <Text className="text-white text-center text-lg">Send OTP</Text>
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
                        onPress={verifyOtpAndSignIn}
                    >
                        <Text className="text-white text-center text-lg">Verify and Sign In</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

export default SignIn;
