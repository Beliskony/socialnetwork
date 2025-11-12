import React, { useEffect, useRef, useState } from 'react';
import { View, Dimensions } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

const { width, height } = Dimensions.get('window');

interface Props {
  uri: string;
  isVisible: boolean;
  onVideoEnd?: () => void;
}

const StoryVideoPlayer: React.FC<Props> = ({ uri, isVisible, onVideoEnd }) => {
  const videoRef = useRef<Video>(null);
  const [hasError, setHasError] = useState(false);
  
   useEffect(() => {
    const handleVideoPlayback = async () => {
      if (!videoRef.current) return;

      try {
        if (isVisible) {
          console.log('🎬 Starting video playback:', uri);
          // Réinitialiser et jouer
          await videoRef.current.playFromPositionAsync(0)
        } else {
          await videoRef.current.pauseAsync();
        }
      } catch (error) {
        console.error('❌ Video playback error:', error);
        setHasError(true);
      }
    };

    handleVideoPlayback();
  }, [isVisible, uri]);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      if (status.didJustFinish) {
        console.error('❌ Video error:', status);
        onVideoEnd?.()
      }
    }
  };


  return (
    <View style={{ width, height }}>
      <Video
        ref={videoRef}
        source={{ uri }}
        style={{ 
          width: '100%', 
          height: '100%',
          backgroundColor: 'black'
        }}
        resizeMode={ResizeMode.COVER}
        isLooping={false}
        shouldPlay={isVisible}
        isMuted={false}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        onError={(error) => {
          console.error('❌ Video component error:', error);
          setHasError(true);
        }}
      />
    </View>
  );
};

export default StoryVideoPlayer;