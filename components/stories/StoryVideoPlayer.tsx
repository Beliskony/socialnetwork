import React, { useEffect, useRef } from 'react';
import { View, Dimensions } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

const { width, height } = Dimensions.get('window');

interface Props {
  uri: string;
  isVisible: boolean;
}

const StoryVideoPlayer: React.FC<Props> = ({ uri, isVisible }) => {
  const lastVisible = useRef<boolean | null>(null);
  
  const player = useVideoPlayer(
    { uri },
    (player) => {
      player.loop = true; // ✅ Loop activé pour les stories
      player.muted = false;
    }
  );

  // Gérer play/pause basé sur isVisible - même logique que VideoPlayerItem
  useEffect(() => {
    if (!player) return;
    
    if (isVisible && lastVisible.current !== true) {
      console.log('🎬 Starting story video playback');
      player.play();
    } else if (!isVisible && lastVisible.current !== false) {
      console.log('🎬 Pausing story video');
      player.pause();
    }
    
    lastVisible.current = isVisible;
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
        contentFit="cover"
        allowsPictureInPicture={false}
        showsTimecodes={false}
        nativeControls={false}
        allowsFullscreen={false}
      />
    </View>
  );
};

export default StoryVideoPlayer;