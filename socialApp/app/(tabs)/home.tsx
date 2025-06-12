
import Actuality from '@/components/homescreen/Actuality'
import SearchBar from '@/components/homescreen/SearchBar'
import { ScrollView, View, SafeAreaView } from 'react-native'

export default function home() {
  return (
    <SafeAreaView className='h-full bg-white'>
        <ScrollView>
            <View className="flex flex-col items-center justify-center">
                <SearchBar />
                <Actuality />
            </View>
        </ScrollView>
    </SafeAreaView>
  )
}

