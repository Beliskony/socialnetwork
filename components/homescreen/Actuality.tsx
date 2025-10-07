
import PostsList from '../Posts/PostList'
import { View } from 'react-native'
import HeaderOfApp from './HeaderOfApp'
import { ScrollView } from 'react-native-gesture-handler'

const Actuality = () => {
  return (
    <ScrollView className="flex h-[85%] mt-0">
        <HeaderOfApp />
        <PostsList />
    </ScrollView>
  )
}

export default Actuality