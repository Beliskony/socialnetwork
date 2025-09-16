import { View, Text, Image, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/redux/userSlice";
import { router } from "expo-router";

const HeaderOfApp = () => {
  const correctUser = useSelector(selectCurrentUser);

  return (
    <View className="flex flex-row w-full h-20 px-3 justify-between items-center bg-white">
      {/* Logo */}
      <View className="flex flex-row font-black gap-x-1">
        <Text className="text-2xl text-[#F1895C]">SOCIAL</Text>
        <View className="flex flex-col justify-center items-center text-4xl gap-0 text-[#2E3244]">
          <Text>-</Text>
        </View>
        <Text className="text-2xl text-[#F1895C]">APP</Text>
      </View>

      {/* Profil */}
      <View className="flex flex-row">
        <TouchableOpacity onPress={() => router.push('/(tabs)/me')}>
          {correctUser?.profilePicture ? (
            <Image
              source={{ uri: correctUser.profilePicture }}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <View className="w-12 h-12 rounded-full bg-gray-300" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HeaderOfApp;
