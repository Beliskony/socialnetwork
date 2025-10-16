import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";

interface MediaPickerProps {
  onMediaSelect: (uri: string, type: "image" | "video") => void;
}

const MediaPicker: React.FC<MediaPickerProps> = ({ onMediaSelect }) => {
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);

  const pickMedia = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission refusée", "L’accès à la galerie est nécessaire.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // 👈 Images + vidéos
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const type = result.assets[0].type === "video" ? "video" : "image";
      setPreviewUri(uri);
      setMediaType(type);
      onMediaSelect(uri, type);
    }
  };

  const recordVideo = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission refusée", "L’accès à la caméra est nécessaire.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
      videoMaxDuration: 60,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const type = result.assets[0].type === "video" ? "video" : "image";
      setPreviewUri(uri);
      setMediaType(type);
      onMediaSelect(uri, type);
    }
  };

  return (
    <View className="items-center space-y-4">
      <View className="flex-row space-x-4">
        <TouchableOpacity
          onPress={pickMedia}
          className="bg-blue-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold">Choisir un média</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={recordVideo}
          className="bg-green-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold">Prendre une vidéo</Text>
        </TouchableOpacity>
      </View>

      {previewUri && (
        <View className="mt-4">
          {mediaType === "image" ? (
            <Image
              source={{ uri: previewUri }}
              style={{ width: 250, height: 250, borderRadius: 10 }}
            />
          ) : (
            <Video
              source={{ uri: previewUri }}
              style={{ width: 250, height: 250, borderRadius: 10 }}
              useNativeControls
              
            />
          )}
        </View>
      )}
    </View>
  );
};

export default MediaPicker;
