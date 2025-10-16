import Actuality from '@/components/homescreen/Actuality'
import { useLoadUser } from '@/components/LoadUser'
import { View } from 'react-native'


export default function home() {
  return (
    <View className='w-full h-full py-2 bg-white'>
        <Actuality />
    </View>
  )
}

