import Actuality from '@/components/homescreen/Actuality'
import { View } from 'react-native'
import { useTheme } from '@/hooks/toggleChangeTheme'
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import RetourConnexion from '@/components/homescreen/RetourConnexion';


export default function home() {
  const { isDark } = useTheme()
  const { currentUser, token } = useSelector((state: RootState) => state.user);

  if (!currentUser) {
    return(
      <RetourConnexion/>
    )
  }
  return (
    <View className='w-full h-full py-2 bg-white dark:bg-black'>
        <Actuality />
    </View>
  )
}

