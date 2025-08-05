import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import OtherProfilePostsList from "@/components/Posts/OtherProfilePost";

const PostDetails = () => {
    const correctUser = useSelector((state: RootState) => state.user);
    
    return (
        <View style={{ flex: 1, padding: 16 }}>
        <ScrollView>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Post Details</Text>
            <Text style={{ fontSize: 16, marginBottom: 8 }}>User ID: {correctUser._id}</Text>
            <Text style={{ fontSize: 16, marginBottom: 8 }}>Username: {correctUser.username}</Text>
            {/* Add more post details here */}
        </ScrollView>

        <OtherProfilePostsList/>
        </View>
    );
}

export default PostDetails;