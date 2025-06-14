// Description: This component fetches and displays user stories in a horizontal scrollable view. When a story is clicked, it opens in a modal view with an option to close it.
import { View, Text, Image, TouchableOpacity, Modal, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import axios from 'axios';



interface Story {
    id: string;
    username: string;
    avatar: string;
    storyImage: string;
}

const Stories: React.FC = () => {
    const [storiesData, setStoriesData] = useState<Story[]>([]);
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);

   /* useEffect(() => {
        const fetchStories = async () => {
            try {
                const response = await axios.get('https://apisocial.railway.internal/api/story/create/:userId');
                setStoriesData(response.data);
            } catch (error) {
                console.error('Error fetching stories:', error);
            }
        };

        fetchStories();
    }, []);

    const openStory = (story: Story) => {
        setSelectedStory(story);
    };

    const closeStory = () => {
        setSelectedStory(null);
    };*/

    return (
        <View className="flex-row p-2">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {storiesData.map((story) => (
                    <TouchableOpacity
                        key={story.id}
                        className="items-center mx-2"
                        //onPress={() => openStory(story)}
                    >
                        <Image
                            source={{ uri: story.avatar }}
                            className="w-12 h-12 rounded-full border-2 border-orange-500"
                        />
                        <Text className="mt-1 text-xs text-gray-800">{story.username}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Modal visible={!!selectedStory} animationType="fade" transparent>
                {selectedStory && (
                    <View className="flex-1 bg-black/90 justify-center items-center">
                        <Image
                            source={{ uri: selectedStory.storyImage }}
                            className="w-[90%] h-[70%] resize-contain"
                        />
                        <TouchableOpacity
                            className="mt-5 px-4 py-2 bg-orange-500 rounded"
                           // onPress={closeStory}
                        >
                            <Text className="text-white font-bold">Close</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </Modal>
        </View>
    );
};

export default Stories;
