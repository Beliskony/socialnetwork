import Actuality from '@/components/homescreen/Actuality'
import HeaderOfApp from '@/components/homescreen/HeaderOfApp'
import LoadUser from '@/components/LoadUser'
import { SafeAreaView, View } from 'react-native'

export default function home() {
  return (
    <SafeAreaView className='w-full h-full py-2 bg-white'>
      
        <HeaderOfApp />
        <LoadUser />
        <Actuality />

    </SafeAreaView>
  )
}

