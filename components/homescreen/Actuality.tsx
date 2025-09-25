import { SafeAreaView,ScrollView, View } from 'react-native'
import NewPost from '../Posts/NewPost'
import PostsList from '../Posts/PostList'

const Actuality = () => {
  return (
    <SafeAreaView className="flex h-[85%] ">

        <PostsList  />
      

    </SafeAreaView>
  )
}

export default Actuality