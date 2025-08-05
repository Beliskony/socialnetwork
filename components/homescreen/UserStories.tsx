import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, Modal } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'react-native-image-picker';

const UserStories = () => {
    const [stories, setStories] = useState<string[]>([]);
    const [selectedStory, setSelectedStory] = useState<string | null>(null);

  /*  const addStory = async () => {
        try {
            const result = await ImagePicker.launchImageLibrary({
                mediaType: 'mixed', // Permet de choisir des images ou vidéos
                selectionLimit: 1,
            });

            if (result.assets && result.assets.length > 0) {
                const newStory = result.assets[0].uri as string;
                await axios.post('https://apisocial.railway.internal/api/story/getUser', { url: newStory });
                setStories([...stories, newStory]);
            }
        } catch (error) {
            console.error('Error adding story:', error);
        }
    };

    const captureStory = async () => {
        try {
            const result = await ImagePicker.launchCamera({
                mediaType: 'mixed', // Permet de capturer des images ou vidéos
            });

            if (result.assets && result.assets.length > 0) {
                const newStory = result.assets[0].uri as string;
                await axios.post('http://10.0.2.2:3001/api/story/getUser', { url: newStory });
                setStories([...stories, newStory]);
            }
        } catch (error) {
            console.error('Error capturing story:', error);
        }
    };

    const deleteStory = async (story: string) => {
        try {
            await axios.delete(`http://10.0.2.2:3001/api/story/delete/:userId/:story`, { data: { url: story } });
            setStories(stories.filter((s) => s !== story));
            setSelectedStory(null);
        } catch (error) {
            console.error('Error deleting story:', error);
        }
    }; */

    return (
        <View className="flex-1 bg-white p-4">
            <Text className="text-lg font-bold mb-4">Your Stories</Text>
            <FlatList
                data={stories}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => setSelectedStory(item)} className="mr-4">
                        <Image source={{ uri: item }} className="w-20 h-20 rounded-lg" />
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <Text className="text-gray-500">No stories yet. Add one!</Text>
                }
            />
            <TouchableOpacity
                //onPress={addStory}
                className="mt-4 bg-blue-500 p-3 rounded-lg items-center"
            >
                <Text className="text-white font-bold">Add Story from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
                //onPress={captureStory}
                className="mt-4 bg-green-500 p-3 rounded-lg items-center"
            >
                <Text className="text-white font-bold">Capture Story</Text>
            </TouchableOpacity>

            <Modal visible={!!selectedStory} transparent animationType="slide">
                <View className="flex-1 bg-black justify-center items-center">
                    {selectedStory && (
                        <>
                            <Image source={{ uri: selectedStory }} className="w-80 h-80 mb-4" />
                            <TouchableOpacity
                                //onPress={() => deleteStory(selectedStory)}
                                className="bg-red-500 p-3 rounded-lg"
                            >
                                <Text className="text-white font-bold">Delete Story</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setSelectedStory(null)}
                                className="mt-4 bg-gray-500 p-3 rounded-lg"
                            >
                                <Text className="text-white font-bold">Close</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </Modal>
        </View>
    );
};

export default UserStories;
