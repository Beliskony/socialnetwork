import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity} from 'react-native';
import { Play } from 'lucide-react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

interface Props {
  uri: string;
  isVisible: boolean; // 👈 visibilité déterminée depuis le parent (flatlist ou scrollview)
}

const VideoPlayerItem: React.FC<Props> = ({ uri, isVisible}) => {
  const [isPlaying, setIsPlaying] = useState(Boolean);
  const player = useVideoPlayer(
    { uri },
    (player) => {
      player.loop = false;
    }
  );

  // Gérer play/pause basé sur isVisible
  useEffect(() => {
    if (!player || !isPlaying) return;
    if (isVisible) {
      player.play();
      setIsPlaying(true)
    } else if (!isVisible) {
      player.pause();
      setIsPlaying(false);
    }
  }, [isVisible, player]);

   const handlePlay =  async() => {
    if (!player) return;

    player.play();
    setIsPlaying(true);
  };

  return (
    <View
      style={{
        width: '100%',
        height: '100%',
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
        style={{ width: '100%', height: '75%' }}
        contentFit="cover"
      />

     
    </View>
  );
};

export default VideoPlayerItem;
