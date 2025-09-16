import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';

const SkeletonPostItem = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity,
        padding: 12,
        marginVertical: 6,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#e0e0e0', marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <View style={{ width: '50%', height: 10, backgroundColor: '#e0e0e0', borderRadius: 4, marginBottom: 4 }} />
          <View style={{ width: '30%', height: 8, backgroundColor: '#e0e0e0', borderRadius: 4 }} />
        </View>
      </View>

      {/* Texte */}
      <View style={{ width: '100%', height: 60, backgroundColor: '#e0e0e0', borderRadius: 8, marginBottom: 10 }} />

      {/* Media */}
      <View style={{ width: '100%', height: 200, borderRadius: 12, backgroundColor: '#e0e0e0', marginBottom: 10 }} />

      {/* Actions */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
        <View style={{ width: 60, height: 20, backgroundColor: '#e0e0e0', borderRadius: 10 }} />
        <View style={{ width: 60, height: 20, backgroundColor: '#e0e0e0', borderRadius: 10 }} />
        <View style={{ width: 60, height: 20, backgroundColor: '#e0e0e0', borderRadius: 10 }} />
      </View>

      {/* Commentaire */}
      <View style={{ width: '100%', height: 40, borderRadius: 8, backgroundColor: '#e0e0e0' }} />
    </Animated.View>
  );
};

export default SkeletonPostItem;
