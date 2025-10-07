import React, { useEffect } from 'react';
import { View } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

type Props = {
  uri: string;
};

const VideoPreviewItem: React.FC<Props> = ({ uri }) => {
  const player = useVideoPlayer(
    { uri },
    (player) => {
      player.loop = false;
      player.volume = 0;
    }
  );

  // Stoppe à 5s
  useEffect(() => {
    if (!player) return;

    player.play();

    const interval = setInterval(async () => {
      const time = await player.currentTime;
      if (time >= 5) {
        player.pause();
        player.seekBy; // Optionnel : retour au début
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [player]);

  return (
    <View style={{ width: 112, height: 112, borderRadius: 12, overflow: 'hidden' }}>
      <VideoView
        player={player}
        style={{ width: '100%', height: '100%' }}
        contentFit="fill"
        allowsPictureInPicture={false}
        showsTimecodes={false}
      />
    </View>
  );
};

export default VideoPreviewItem;
