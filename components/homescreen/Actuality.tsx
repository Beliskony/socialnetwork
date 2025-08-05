import { SafeAreaView,ScrollView, View } from 'react-native'
import NewPost from '../Posts/NewPost'
import PostsList from '../Posts/PostList'

const Actuality = () => {
  return (
    <SafeAreaView className="flex-1 ">
      <ScrollView>
        <NewPost />
        <PostsList  />
      </ScrollView>

    </SafeAreaView>
  )
}

export default Actuality