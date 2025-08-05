import React, { useEffect } from 'react';
import { View } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

type Props = {
  uri: string;
};

const VideoPlayerItem: React.FC<Props> = ({ uri }) => {
  const player = useVideoPlayer(
    { uri },
    (player) => {
      player.loop = true;
    }
  );

  // visibilite de la video
const [isVisible, setIsVisible] = React.useState(false);
  useEffect(() => {
  if(player){
    if (isVisible) {
      player.play();
    } else {
      player.pause();
  }
 }
}, [isVisible]);


  return (
    <View style={{ width: 400, height: 450, backgroundColor:'black', alignItems:'center', justifyContent:'center'}}>
      <VideoView player={player} allowsFullscreen nativeControls
      showsTimecodes style={{width: '100%', height:'100%', alignContent:'center', display:'flex' }} />
    </View>
  );
};

export default VideoPlayerItem;
