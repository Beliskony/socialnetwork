import { useRef, useState } from 'react';
import { View, FlatList, TouchableOpacity, Image, ViewToken, Dimensions, Text, Modal } from 'react-native';
import { X } from 'lucide-react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const MediaFullScreen = ({ post, initialIndex, onClose, isVisible }: any) => {
  //console.log('🎯 MediaFullScreen RENDER - isVisible:', isVisible);
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const flatListRef = useRef<FlatList>(null);

  // 🔥 UNIQUEMENT les images pour le fullscreen
  const imagesData = post?.content?.media?.images?.map((image: any) => ({ uri: image.url || image, type: 'image' })) || [];
  //console.log('🎯 MediaFullScreen imagesData:', imagesData);
  //console.log('🎯 MediaFullScreen post:', post);
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

  if (!isVisible || imagesData.length === 0) return null;

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

          {/* Indicateur */}
          <View className="bg-black/50 px-3 py-1.5 rounded-full">
            <Text className="text-white text-sm">
              {currentIndex + 1} / {imagesData.length}
            </Text>
          </View>

          <View className="w-10" />
        </View>

        {/* Slider principal - UNIQUEMENT des images */}
        <FlatList
          ref={flatListRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          data={imagesData}
          keyExtractor={(item, index) => `${post._id}-image-${index}`}
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
              <Image
                source={{ uri: item.uri }}
                style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
                resizeMode="contain"
              />
            </View>
          )}
        />

        {/* Points indicateurs */}
        {imagesData.length > 1 && (
              <View className='bg-black/50 px-3 py-1 rounded-xl'>
                <Text>{currentIndex + 1} / {imagesData.length}</Text>
              </View>
        )}
      </View>
    </Modal>
  );
};

export default MediaFullScreen;