import Actuality from '@/components/homescreen/Actuality'
import { View } from 'react-native'
import { useTheme } from '@/hooks/toggleChangeTheme'


export default function home() {
  const { isDark } = useTheme()
  return (
    <View className='w-full h-full py-2 bg-white dark:bg-black'>
        <Actuality />
    </View>
  )
}

