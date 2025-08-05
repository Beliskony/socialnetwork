import { useRef, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ViewToken,
} from 'react-native';
import VideoPlayerItem from './VideoPlayerItem';

const WIDTH  = 350;
const HEIGHT = 430;

type MediaItem = {
  uri: string;
  type: 'image' | 'video';
};

const MediaSlider = ({ post, openImage, openVideo }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);

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
            onPress={() =>
              item.type === 'image' ? openImage(item.uri) : openVideo(item.uri)
            }
            activeOpacity={1}
          >
            {item.type === 'image' ? (
              <Image
                source={{ uri: item.uri }}
                style={{
                  width: WIDTH,
                  height: HEIGHT,
                  resizeMode: 'cover',
                  borderRadius: 8,
                }}
              />
            ) : (
              <VideoPlayerItem uri={item.uri} />
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
    </View>
  );
};

export default MediaSlider;
