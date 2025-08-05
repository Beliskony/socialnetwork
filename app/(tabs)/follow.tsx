import { View, Text, SafeAreaView } from 'react-native'
import React from 'react'

const follow = () => {
  return (
    <SafeAreaView className='flex-1 bg-[#C5C6C6] w-full items-center justify-center'>
      <View className='flex flex-col items-center justify-center'>
        <Text className='text-lg font-semibold text-center'>Page de suivi</Text>
        <Text className='text-sm text-gray-500'>Cette page est en cours de développement.</Text>
      </View>
    </SafeAreaView>
  )
}

export default follow