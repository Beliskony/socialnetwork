import { useRef, useState } from 'react';
import { View, FlatList, TouchableOpacity, Image, ViewToken, Dimensions, Text, Modal } from 'react-native';
import { X } from 'lucide-react-native';
import VideoPlayerItem from '../VideoPlayerItem';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const MediaFullScreen = ({ post, initialIndex, onClose, isVisible }: any) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const flatListRef = useRef<FlatList>(null);

  // ✅ COMBINER IMAGES ET VIDÉOS POUR LE FULLSCREEN
  const allMedia = [
    ...(post?.content?.media?.images?.map((image: any) => ({ 
      uri: image.url || image, 
      type: 'image' as const 
    })) || []),
    ...(post?.content?.media?.videos?.map((video: any) => ({ 
      uri: video.url || video, 
      type: 'video' as const 
    })) || [])
  ];

  //console.log('🎯 MediaFullScreen allMedia:', allMedia);
  //console.log('🎯 MediaFullScreen currentIndex:', currentIndex);

  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index || 0);
      }
    }
  ).current;

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  if (!isVisible || allMedia.length === 0) return null;

  return (
    <Modal visible={isVisible} transparent={false} animationType="fade">
      <View className="flex-1 bg-black">
        {/* Header */}
        <View className="absolute top-16 left-5 right-5 z-10 flex-row justify-between items-center">
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 rounded-full bg-black/50 justify-center items-center"
          >
            <X size={24} color="white" />
          </TouchableOpacity>

          <View className="w-10" />
        </View>

        {/* ✅ SLIDER PRINCIPAL - IMAGES ET VIDÉOS */}
        <FlatList
          ref={flatListRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          data={allMedia}
          keyExtractor={(item, index) => `${post._id}-${item.type}-${index}`}
          initialScrollIndex={initialIndex}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          renderItem={({ item, index }) => (
            <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }} className="justify-center items-center">
              {item.type === 'image' ? (
                // ✅ RENDU IMAGE
                <Image
                  source={{ uri: item.uri }}
                  style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
                  resizeMode="contain"
                />
              ) : (
                // ✅ RENDU VIDÉO
                <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }} className="bg-black flex justify-center items-center h-full">
                  <VideoPlayerItem
                    uri={item.uri}
                    isVisible={currentIndex === index} // ✅ Joue seulement si visible
                  />
                </View>
              )}
            </View>
          )}
        />

        {/* ✅ POINTS INDICATEURS AVEC TYPE */}
        {allMedia.length > 1 && (
          <View className="absolute bottom-10 left-0 right-0 items-center">
            <View className="bg-black/50 px-4 py-2 rounded-xl flex-row items-center">
              <Text className="text-white text-sm mr-2">
                {currentIndex + 1} / {allMedia.length}
              </Text>
              {/* ✅ INDICATEUR DE TYPE */}
              <View className="bg-white/20 px-2 py-1 rounded">
                <Text className="text-white text-xs font-medium">
                  {allMedia[currentIndex]?.type === 'video' ? 'VIDÉO' : 'IMAGE'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default MediaFullScreen;