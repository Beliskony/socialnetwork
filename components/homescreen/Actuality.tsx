import PostsList from '../Posts/PostList' // ✅ Corrigez l'import (PostsList vs PostList)
import { RefreshControl, ScrollView } from 'react-native'
import HeaderOfApp from './HeaderOfApp'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { useState, useCallback } from 'react' // ✅ Ajoutez useCallback
import { StoryBlock } from '../stories/StoryBlock'
import { getFeed } from '@/redux/postSlice'
import { getCurrentUser } from '@/redux/userSlice'

const Actuality = () => {
  const { currentUser, token } = useAppSelector((state) => state.user);
  const [refreshing, setRefreshing] = useState(false)
  const dispatch = useAppDispatch()

  // ✅ CORRECTION : Utiliser useCallback et dispatch correct
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      // ✅ CORRECTION : Dispatch les actions correctement
      await dispatch(getFeed({ page: 1, limit: 20, refresh: true })).unwrap()
      
      // ✅ Recharger aussi les infos utilisateur si nécessaire
      if (currentUser) {
        await dispatch(getCurrentUser()).unwrap()
      }
      
      console.log('✅ Actualité rechargée avec succès')
    } catch (error) {
      console.error('❌ Erreur rechargement:', error)
    } finally {
      setRefreshing(false)
    }
  }, [dispatch, currentUser])

  return (
    <ScrollView 
      showsHorizontalScrollIndicator={false} 
      showsVerticalScrollIndicator={false} 
      className="flex-1 bg-white dark:bg-black" // ✅ Correction className
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          colors={['#3b82f6']} 
          tintColor="#3b82f6"
        />
      }
    >
      <HeaderOfApp />
      <StoryBlock />
      <PostsList />
    </ScrollView>
  )
}

export default Actuality