import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity} from 'react-native';
import { Play } from 'lucide-react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

interface Props {
  uri: string;
  isVisible: boolean; // 👈 visibilité déterminée depuis le parent (flatlist ou scrollview)
  autoPlay?: boolean;
}

const VideoPlayerItem: React.FC<Props> = ({ uri, isVisible, autoPlay=false }) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const player = useVideoPlayer(
    { uri },
    (player) => {
      player.loop = false;
    }
  );

  // Gérer play/pause basé sur isVisible
  useEffect(() => {
    if (!player || !isPlaying) return;
    if (isVisible && autoPlay) {
      player.play();
      setIsPlaying(true)
    } else if (!isVisible) {
      player.pause();
      setIsPlaying(false);
    }
  }, [isVisible, player, autoPlay]);

   const handlePlay = () => {
    if (!player) return;
    player.play();
    setIsPlaying(true);
  };

  return (
    <View
      style={{
        width: 350,
        height: 470,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        position:'relative'
      }}
    >
      <VideoView
        player={player}
        fullscreenOptions={{enable:true , orientation:'default'}}
        allowsPictureInPicture={false}
        showsTimecodes={true}
        nativeControls={true}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
      />

      {!isPlaying &&(
        <TouchableOpacity 
          onPress={handlePlay}
          className="absolute inset-0 bg-black/30 justify-center items-center"
          activeOpacity={0.8}
        >
          <View className="w-20 h-20 rounded-full bg-white/20 justify-center items-center border-2 border-white/50">
            <Play size={40} color="white" fill="white" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default VideoPlayerItem;
