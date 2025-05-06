import { View, Text } from 'react-native';

import Stories from '@/components/homescreen/Stories';
import UserStories from '@/components/homescreen/UserStories';

export default function HomeScreen() {
  return (
    <View>
        <View className='h-full w-full justify-start items-center'>
         
          
          <View className='w-full flex flex-row h-20 gap-x-3'>
            <View className='w-1/5'>
                <UserStories />
            </View>
            
            <View className='w-4/5'>
                <Stories />
            </View>

        </View>

        </View>
    </View>
  );
}

