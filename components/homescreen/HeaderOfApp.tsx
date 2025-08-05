import { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { UseSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/redux/userSlice";
import { router } from "expo-router";


const HeaderOfApp = () => {
    const correctUser = useSelector(selectCurrentUser)

    return (
        <View className="flex flex-row w-full h-20 px-3 justify-between items-center bg-white">
            <View className="flex flex-row font-black gap-x-1">
                <Text className="text-2xl text-[#F1895C]">SOCIAL</Text>
                <View className="flex flex-col justify-center items-center text-4xl gap-0 text-[#2E3244]">
                    <Text>-</Text>
                </View>
                <Text className="text-2xl text-[#F1895C]">APP</Text>
            </View>

            <View className="flex flex-row">
                <TouchableOpacity onPress={() => router.push('/(tabs)/me')}>
                    <Image source={{uri: correctUser?.profilePicture}} className="w-12 h-12 rounded-full"/>
                </TouchableOpacity>
            </View>

        </View>
    )
}

export default HeaderOfApp
