
import PostsList from '../Posts/PostList'
import { ScrollView } from 'react-native'
import HeaderOfApp from './HeaderOfApp'
import { StoryBlock } from '../stories/StoryBlock'


const Actuality = () => {
  return (
    <ScrollView showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} className="flex h-[85%] mt-0">
        <HeaderOfApp />
        <StoryBlock />
        <PostsList />
    </ScrollView>
  )
}

export default Actuality