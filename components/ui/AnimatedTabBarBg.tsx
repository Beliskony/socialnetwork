import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function TabBarBackground() {
  return (
    <View style={styles.container}>
      <View style={styles.bubble} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -10,
    left: width / 2 - 35, // Centrer la bulle
    zIndex: 10,
  },
  bubble: {
    width: 70,
    height: 70,
    backgroundColor: '#fff',
    borderRadius: 35,
    elevation: 6,
  },
});
