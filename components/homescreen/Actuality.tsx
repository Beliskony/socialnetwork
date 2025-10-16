
import PostsList from '../Posts/PostList'
import { View, ScrollView } from 'react-native'
import HeaderOfApp from './HeaderOfApp'


const Actuality = () => {
  return (
    <ScrollView className="flex h-[85%] mt-0">
        <HeaderOfApp />
        <PostsList />
    </ScrollView>
  )
}

export default Actuality