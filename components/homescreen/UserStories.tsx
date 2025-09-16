import React, { useState } from "react";
import { View, Image, Modal, TouchableOpacity, Text } from "react-native";
import { Video, ResizeMode } from "expo-av";

interface Story {
  id: string;
  mediaUrl: string;
  type: "image" | "video"; // 👈 ajoute ce champ pour savoir si c'est une image ou vidéo
}

interface Props {
  stories: Story[];
}

export default function UserStories({ stories }: Props) {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      {stories.map((story) => (
        <TouchableOpacity key={story.id} onPress={() => setSelectedStory(story)}>
          <Image
            source={{ uri: story.mediaUrl }}
            style={{ width: 60, height: 60, borderRadius: 30 }}
          />
        </TouchableOpacity>
      ))}

      {/* Modal pour afficher le story en plein écran */}
      <Modal visible={!!selectedStory} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "black",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {selectedStory?.type === "image" ? (
            <Image
              source={{ uri: selectedStory.mediaUrl }}
              style={{ width: "90%", height: "70%", borderRadius: 12 }}
              resizeMode="contain"
            />
          ) : (
            <Video
              source={{ uri: selectedStory?.mediaUrl ?? "" }}
              style={{ width: "90%", height: "70%", borderRadius: 12 }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping
              shouldPlay
            />
          )}

          <TouchableOpacity
            style={{ position: "absolute", top: 50, right: 20 }}
            onPress={() => setSelectedStory(null)}
          >
            <Text style={{ color: "white", fontSize: 18 }}>✕ Fermer</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
