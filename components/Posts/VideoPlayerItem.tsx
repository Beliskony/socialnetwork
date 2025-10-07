import React, { useEffect, useRef } from 'react';
import { View} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

interface Props {
  uri: string;
  isVisible: boolean; // 👈 visibilité déterminée depuis le parent (flatlist ou scrollview)
}

const VideoPlayerItem: React.FC<Props> = ({ uri, isVisible }) => {
  const lastVisible = useRef<boolean | null>(null);
  const player = useVideoPlayer(
    { uri },
    (player) => {
      player.loop = true;
      
    }
  );

  // Gérer play/pause basé sur isVisible
  useEffect(() => {
    if (!player) return;
    if (isVisible && lastVisible.current !== true) {
      player.play();
    } else if (!isVisible && lastVisible.current !== false) {
      player.pause();
      
    }
  }, [isVisible, player]);

  return (
    <View
      style={{
        width: 350,
        height: 370,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <VideoView
        player={player}
        fullscreenOptions={{enable:true , orientation:'default'}}
        allowsPictureInPicture={false}
        showsTimecodes={true}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
      />
    </View>
  );
};

export default VideoPlayerItem;
