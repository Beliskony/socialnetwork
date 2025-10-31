import React, { useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

const { width, height } = Dimensions.get('window');

interface Props {
  uri: string;
  isVisible: boolean;
}

const StoryVideoPlayer: React.FC<Props> = ({ uri, isVisible }) => {
  const player = useVideoPlayer(
    { uri },
    (player) => {
      player.loop = false;
      player.muted = false; // 🔊 Son activé par défaut
    }
  );

  // Lecture automatique quand la vidéo est visible
  useEffect(() => {
    if (!player) return;

    if (isVisible) {
      player.play();
    } else {
      player.pause();
    }
  }, [isVisible, player]);

  return (
    <View
      style={{
        width: width,
        height: height,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <VideoView
        player={player}
        style={{ 
          width: '100%', 
          height: '100%' 
        }}
        contentFit="contain"
        allowsPictureInPicture={false}
        showsTimecodes={false}
        nativeControls={false}
      />
    </View>
  );
};

export default StoryVideoPlayer;