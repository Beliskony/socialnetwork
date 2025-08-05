import { View, SafeAreaView, Text, Image } from 'react-native'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { useState, useEffect } from 'react'
import MePost from '@/components/Posts/MePost'

function me() {
  const correctUser = useSelector((state: RootState) => state.user)

  if (!correctUser) {
    return(
      <SafeAreaView className='flex-1 bg-[#C5C6C6] w-full items-center justify-center'>
        <Text className='text-lg font-semibold text-center'>Chargement du profil...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className='flex-1 w-full'>
       <View className='flex flex-row w-full items-center justify-between p-4'>
        {/* photo et nom de profil */}
          <View className='flex flex-row items-center gap-x-2 w-4/5'>
            <Image
              source={{ uri: correctUser.profilePicture }} // Remplace par l'URL de la photo de profil
              className='w-12 h-12 rounded-full'
            />
            <View className='flex flex-col'>
              <Text className='ml-2 text-lg font-semibold'>{correctUser.username}</Text>
              <Text className='ml-2 text-sm text-gray-500'>@{correctUser.username}</Text>
            </View>
          </View>

          {/* icone de parametre ou update profil */}
          <View className='flex flex-row border rounded-md gap-x-1 justify-center items-center p-3 w-1/5'>
            <Image source={require('@/assets/images/setting.png')} className='w-5 h-5' />
            <Text className='text-xs text-gray-500'>Modifier</Text>
          </View>

       </View>

       <View className='flex flex-row items-center justify-center gap-x-4 p-4'>
          <View className='flex flex-row w-1/3 items-center gap-x-4'>
            <Text className='text-lg font-semibold'>{correctUser.followersCount}</Text>
            <Text className='text-sm text-gray-500'>Abonnés</Text>
          </View>
          <View className='flex flex-row w-1/3 items-center gap-x-4'>
            <Text className='text-lg font-semibold'>{correctUser.postsCount}</Text>
            <Text className='text-sm text-gray-500'>Publications</Text>
          </View>
       </View>

       <View className='flex flex-col h-full gap-y-3'>
        <Text className='text-lg font-semibold text-center underline'>Publications</Text>

        {/*affichage de mes publications*/}
          <MePost/>
       </View>
       
    </SafeAreaView>
  )
}

export default me
