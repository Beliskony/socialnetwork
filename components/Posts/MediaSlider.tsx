import { useRef, useState } from 'react';
import { View, FlatList, TouchableOpacity, Image, ViewToken, StyleSheet, Modal, Dimensions, Text } from 'react-native';
import VideoPlayerItem from './VideoPlayerItem';
import { PinchGestureHandler, PinchGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {useSharedValue, useAnimatedStyle, withTiming} from 'react-native-reanimated';

const WIDTH  = 350;
const HEIGHT = 370;

type MediaItem = {
  uri: string;
  type: 'image' | 'video';
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const MediaSlider = ({ post }: any) => {
  const [fullScreenImage, setFullscreenImage] = useState<MediaItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scale = useSharedValue(1);

  const onPinchEvent = (event: PinchGestureHandlerGestureEvent) => {
    scale.value = event.nativeEvent.scale;
  };

  const onPinchEnd = () => {
    scale.value = withTiming(1); // Reset zoom when gesture ends
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const mediaData: MediaItem[] = [
    ...(post.media?.images?.map((uri: string) => ({ uri, type: 'image' })) || []),
    ...(post.media?.videos?.map((uri: string) => ({ uri, type: 'video' })) || []),
  ];

  const isSingleMedia = mediaData.length === 1;

  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index || 0);
      }
    }
  ).current;

  if (mediaData.length === 0) return null;


  return (
    <View style={{ flex: 1, marginHorizontal:10 }}>
    <View style={{ width: WIDTH, height: HEIGHT, justifyContent:'center', alignItems:'center' }}>
      <FlatList
        horizontal
        pagingEnabled={!isSingleMedia}
        scrollEnabled={!isSingleMedia}
        showsHorizontalScrollIndicator={false}
        data={mediaData}
        keyExtractor={(item, index) => `${post._id}-${item.type}-${index}`}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
                if (item.type === 'image') setFullscreenImage(item);
              }}
              activeOpacity={1}
          >
            {item.type === 'image' ? (
              <Image
                source={{ uri: item.uri }}
                style={{
                  width: WIDTH,
                  height: HEIGHT,
                  resizeMode: 'contain',
                  borderRadius: 8,
                }}
              />
            ) : (
              <VideoPlayerItem uri={item.uri} isVisible />
            )}
          </TouchableOpacity>
        )}
      />

      {/* Affiche les dots uniquement si plusieurs médias */}
      {!isSingleMedia && (
        <View
          style={{
            position: 'absolute',
            bottom: 10,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          {mediaData.map((_, index) => (
            <View
              key={index}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                marginHorizontal: 4,
                backgroundColor: currentIndex === index ? '#F1895C' : '#ccc',
              }}
            />
          ))}
        </View>
      )}
    </View>

         {/* ✅ Plein écran local */}
       <Modal visible={!!fullScreenImage} transparent={false} animationType="fade">
        <View style={styles.fullscreenWrapper}>
          {/* ✕ bouton pour fermer */}
          <TouchableOpacity onPress={() => setFullscreenImage(null)} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <PinchGestureHandler onGestureEvent={onPinchEvent} onEnded={onPinchEnd}>
            <Animated.Image
              source={{ uri: fullScreenImage?.uri }}
              style={[styles.fullscreenImage, animatedStyle]}
              resizeMode="contain"
            />
          </PinchGestureHandler>
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
   fullscreenWrapper: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 10,
  },
  closeText: {
    color: 'white',
    fontSize: 20,
  },

})

export default MediaSlider;
