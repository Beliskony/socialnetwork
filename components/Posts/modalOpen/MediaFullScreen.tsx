import { useRef, useState } from 'react';
import { View, FlatList, TouchableOpacity, Image, ViewToken, Dimensions, Text, Modal } from 'react-native';
import VideoPlayerItem from '../VideoPlayerItem';
import { X } from 'lucide-react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const MediaFullScreen = ({ post, initialIndex, onClose, isVisible }: any) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const flatListRef = useRef<FlatList>(null);

  // Préparer les médias exactement comme dans ton MediaSlider
  const mediaData = [
    ...(post.media?.images?.map((uri: string) => ({ uri, type: 'image' })) || []),
    ...(post.media?.videos?.map((uri: string) => ({ uri, type: 'video' })) || []),
  ];

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

  if (!isVisible || mediaData.length === 0) return null;

  return (
    <Modal visible={isVisible} transparent={false} animationType="fade">
      <View className="flex-1 bg-black">
        {/* Header - style similaire à ton MediaSlider */}
        <View className="absolute top-16 left-5 right-5 z-10 flex-row justify-between items-center">
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 rounded-full bg-black/50 justify-center items-center"
          >
            <X size={24} color="white" />
          </TouchableOpacity>

          {/* Indicateur */}
          <View className="bg-black/50 px-3 py-1.5 rounded-full">
            <Text className="text-white text-sm">
              {currentIndex + 1} / {mediaData.length}
            </Text>
          </View>

          <View className="w-10" />
        </View>

        {/* Slider principal - même logique que ton MediaSlider */}
        <FlatList
          ref={flatListRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          data={mediaData}
          keyExtractor={(item, index) => `${post._id}-${item.type}-${index}`}
          initialScrollIndex={initialIndex}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          renderItem={({ item }) => (
            <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }} className="justify-center items-center">
              {item.type === 'image' ? (
                <Image
                  source={{ uri: item.uri }}
                  style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
                  resizeMode="contain"
                />
              ) : (
                <VideoPlayerItem uri={item.uri} isVisible={true} />
              )}
            </View>
          )}
        />

        {/* Points indicateurs - même style que ton MediaSlider */}
        {mediaData.length > 1 && (
          <View className="absolute bottom-8 left-0 right-0 flex-row justify-center space-x-2">
            {mediaData.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => scrollToIndex(index)}
                className={`w-2 h-2 rounded-full ${
                  currentIndex === index ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
};

export default MediaFullScreen;