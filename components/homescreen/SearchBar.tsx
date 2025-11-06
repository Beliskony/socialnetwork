import { useState, FC, useCallback } from 'react';
import { 
  Text, 
  TextInput, 
  View, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { searchPosts } from '@/redux/postSlice';
import { searchUsersByUsername } from '@/redux/userSlice';
import { router } from 'expo-router';
import { Search, User, X, Users, Image as ImageIcon, Video, MessageCircle, Heart } from 'lucide-react-native';
import { useTheme } from '@/hooks/toggleChangeTheme';
import { formatCount } from '@/services/Compteur';


interface SearchBarProps {
  onClose?: () => void;
}

// Types basés sur vos interfaces existantes
type UserResult = {
  _id: string;
  username: string;
  profile?: {
    fullName?: string;
    profilePicture?: string;
  };
  analytics?: {
    followerCount: number;
  };
};

type PostResult = {
  _id: string;
  user?: {
    _id:string;
    username:string;
    profilePicture?:string
  };
  author?: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  content?: {
    text?: string;
    media?: {
      images: string[];
      videos:string[];
    }
  };
  likes?: string[];
  comments?: any[];
  createdAt: string;
  type?: 'text' | 'image' | 'video' | 'poll' | 'event' | 'share';
};

type SearchTab = 'users' | 'posts' | 'all';

const SearchBar: FC<SearchBarProps> = ({onClose}) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [hasSearched, setHasSearched] = useState(false);
  const {isDark} = useTheme()
  
  const dispatch = useAppDispatch();
  const { searchedUsers, loading: userLoading } = useAppSelector((state) => state.user);
  const { searchedPosts, searchLoading } = useAppSelector((state) => state.posts);
  
  const isLoading = userLoading || searchLoading;

  // 🔍 RECHERCHE COMBINÉE
  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      setHasSearched(false);
      return;
    }

    setHasSearched(true);
    
    try {
      // Recherche parallèle utilisateurs et posts
      await Promise.all([
        dispatch(searchUsersByUsername(query)),
        dispatch(searchPosts({ query, page: 1, limit: 20 }))
      ]);
    } catch (error) {
      console.error('Erreur recherche:', error);
    }
  }, [query, dispatch]);

  // 📝 GESTION DU TEXTE - RECHERCHE IMMÉDIATE
  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
    
    if (text.trim().length > 0) {
      handleSearch();
    } else {
      setHasSearched(false);
    }
  }, [handleSearch]);

  

  // 🗑️ EFFACER LA RECHERCHE
  const clearSearch = useCallback(() => {
    setQuery('');
    setHasSearched(false);
    setActiveTab('all');
  }, []);

  // 👤 NAVIGATION PROFIL
  const goToProfile = useCallback((userId: string) => {
    Keyboard.dismiss();
    router.push({
      pathname: `../(modals)/userProfile/${userId}`,
    });
  }, []);

  // 📄 NAVIGATION POST
  const goToPost = useCallback((postId: string) => {
    Keyboard.dismiss();
    console.log('Navigation vers post:', postId);
    // router.push({
    //   pathname: "/(modals)/postDetail",
    //   params: { postId }
    // });
  }, []);

  // 🎨 RENDU ITEM UTILISATEUR
  const renderUserItem = useCallback(({ item }: { item: UserResult }) => {
    const username = item.username || 'utilisateur';
    const fullName = item.profile?.fullName;
    const profilePicture = item.profile?.profilePicture;
    const followerCount = item.analytics?.followerCount || 0;

    return (
      <TouchableOpacity
        onPress={() => goToProfile(item._id)} 
        className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 active:bg-gray-50"
      >
        <View className="flex-row items-center">
          {/* Avatar */}
          <View className="relative">
            {profilePicture ? (
              <Image
                source={{ uri: profilePicture }}
                className="w-14 h-14 rounded-full mr-4"
              />
            ) : (
              <View className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full items-center justify-center mr-4">
                <User size={24} color="white" />
              </View>
            )}
          </View>

          {/* Infos utilisateur */}
          <View className="flex-1">
            {fullName && (
              <Text className="text-gray-900 font-bold text-base">
                {fullName}
              </Text>
            )}
            
            <Text className="text-gray-500 text-sm mt-1">
              @{username}
            </Text>

            {followerCount > 0 && (
              <View className="flex-row items-center mt-1">
                <Users size={12} color="#6B7280" />
                <Text className="text-gray-400 text-xs ml-1">
                  {followerCount} abonnés
                </Text>
              </View>
            )}
          </View>

          {/* Badge utilisateur */}
          <View className="bg-blue-100 px-2 py-1 rounded-full">
            <Text className="text-blue-600 text-xs font-medium">Profil</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [goToProfile]);

  // 📝 RENDU ITEM POST
  const renderPostItem = useCallback(({ item }: { item: PostResult }) => {
    const author = item.author || { _id: 'unknown', username: 'Utilisateur' };
    const text = item.content?.text || '';
    const media = item.content?.media || { images: [], videos: [] };
    const likesCount = item.likes?.length || 0;
    const commentsCount = item.comments?.length || 0;
    
    const hasImages = media.images && media.images.length > 0;
    const hasVideos = media.videos && media.videos.length > 0;
    const hasMedia = hasImages || hasVideos;

    const postType = item.type || (hasVideos ? 'video' : hasImages ? 'image' : 'text');

    return (
      <TouchableOpacity
        onPress={() => goToPost(item._id)}
        className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-400 active:bg-gray-50"
      >
        {/* Header du post */}
        <View className="flex-row items-center mb-3">
          {author.profilePicture ? (
            <Image
              source={{ uri: author.profilePicture }}
              className="w-8 h-8 rounded-full mr-3"
            />
          ) : (
            <View className="w-8 h-8 bg-gray-300 rounded-full items-center justify-center mr-3">
              <User size={16} color="white" />
            </View>
          )}
          <Text className="text-gray-900 font-semibold text-sm">
            {author.username}
          </Text>
          <Text className="text-gray-400 text-sm ml-2">
            • {new Date(item.createdAt).toLocaleDateString('fr-FR')}
          </Text>
        </View>

        {/* Contenu du post */}
        {text && (
          <Text className="text-gray-800 text-base mb-3 leading-5">
            {text.length > 150 
              ? `${text.substring(0, 150)}...` 
              : text
            }
          </Text>
        )}

        {/* Médias */}
        {hasMedia && (
          <View className="flex-row items-center mb-3">
            {hasImages && (
              <View className="flex-row items-center mr-4">
                <ImageIcon size={16} color="#6B7280" />
                <Text className="text-gray-500 text-sm ml-1">
                  {media.images!.length} photo{media.images!.length > 1 ? 's' : ''}
                </Text>
              </View>
            )}
            {hasVideos && (
              <View className="flex-row items-center">
                <Video size={16} color="#6B7280" />
                <Text className="text-gray-500 text-sm ml-1">
                  {media.videos!.length} vidéo{media.videos!.length > 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Engagement */}
        <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
          <View className="flex-row items-center space-x-4 gap-x-2">
            <View className="flex-row items-center">
              <Text className="text-gray-900 font-medium text-sm">
                {formatCount(likesCount)}
              </Text>
              <Heart size={16} />
            </View>
            <View className="flex-row items-center">
              
              <Text className="text-gray-900 font-medium text-sm ml-1">
                {formatCount(commentsCount)}
              </Text>
              <MessageCircle size={14} color="#6B7280" />
            </View>
          </View>
          
          {/* Badge type */}
          <View className={`px-2 py-1 rounded-full ${
            postType === 'image' ? 'bg-green-100' : 
            postType === 'video' ? 'bg-purple-100' : 'bg-blue-100'
          }`}>
            <Text className={`text-xs font-medium ${
              postType === 'image' ? 'text-green-800' : 
              postType === 'video' ? 'text-purple-800' : 'text-blue-800'
            }`}>
              {postType === 'image' ? '📸 Photo' : 
               postType === 'video' ? '🎥 Vidéo' : '📝 Texte'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [goToPost]);

  // 📊 ONGLETS DE NAVIGATION
  const renderTabs = useCallback(() => {
    if (!hasSearched || query.length === 0) return null;

    const userCount = searchedUsers.length;
    const postCount = searchedPosts.length;

    const tabs = [
      { 
        key: 'all' as SearchTab, 
        label: 'Tout', 
        count: userCount + postCount,
      },
      { 
        key: 'users' as SearchTab, 
        label: 'Utilisateurs', 
        count: userCount,
      },
      { 
        key: 'posts' as SearchTab, 
        label: 'Publications', 
        count: postCount,
      },
    ];

    return (
      <View className="flex-row bg-white dark:bg-black rounded-2xl py-1 px-3 mb-4  shadow-sm border border-gray-400">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${
              activeTab === tab.key 
                ? 'bg-blue-500' 
                : 'bg-transparent'
            }`}
          >
            <Text className={`font-semibold text-sm mr-1 ${
              activeTab === tab.key ? 'text-white' : 'text-gray-500'
            }`}>
              
            </Text>
            <Text className={`font-semibold text-sm ${
              activeTab === tab.key ? 'text-white' : 'text-gray-500'
            }`}>
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View className={`ml-2 px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                <Text className={`text-xs font-bold ${
                  activeTab === tab.key ? 'text-white' : 'text-gray-600'
                }`}>
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  }, [hasSearched, query, searchedUsers.length, searchedPosts.length, activeTab]);

  // 📱 ÉTATS VIDES
  const renderEmptyState = useCallback(() => {
    if (isLoading) {
      return (
        <View className="items-center py-12">
          <ActivityIndicator size="large" color="#F1895C" />
          <Text className="text-gray-500 text-base mt-4 font-medium">
            Recherche de "{query}"...
          </Text>
        </View>
      );
    }

    if (hasSearched && searchedUsers.length === 0 && searchedPosts.length === 0) {
      return (
        <View className="items-center py-12">
          <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
            <Search size={32} color="#9CA3AF" />
          </View>
          <Text className="text-gray-500 text-lg font-semibold text-center mb-2">
            Aucun résultat pour "{query}"
          </Text>
          <Text className="text-gray-400 text-sm text-center">
            Aucun utilisateur ou publication ne correspond à votre recherche
          </Text>
        </View>
      );
    }

    return (
      <View className="items-center py-12">
        <View className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full items-center justify-center mb-6">
          <Search size={32} color="white" />
        </View>
        <Text className="text-gray-700 text-xl font-bold text-center mb-3">
          Explorez le réseau
        </Text>
        <Text className="text-gray-500 text-base text-center px-8">
          Recherchez des personnes, publications, hashtags... 
          Le système cherche dans les noms et le contenu des posts
        </Text>
      </View>
    );
  }, [isLoading, hasSearched, searchedUsers.length, searchedPosts.length, query]);

  // 📜 RENDU DES RÉSULTATS COMBINÉS
  const renderCombinedResults = useCallback(() => {
    const allResults = [
      ...searchedUsers.map(user => ({ type: 'user' as const, data: user })),
      ...searchedPosts.map(post => ({ type: 'post' as const, data: post }))
    ];

    return (
      <FlatList
        data={allResults}
        keyExtractor={(item) => `${item.type}-${item.data._id}`}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          if (item.type === 'user') {
            return renderUserItem({ item: item.data  });
          } else {
            return renderPostItem({ item: item.data });
          }
        }}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    );
  }, [searchedUsers, searchedPosts, renderUserItem, renderPostItem]);

  // 📜 RENDU DES RÉSULTATS PAR ONGLET
  const renderResults = useCallback(() => {
    if (activeTab === 'all') {
      if (searchedUsers.length === 0 && searchedPosts.length === 0 && hasSearched) {
        return (
          <View className="items-center py-12">
            <Text className="text-gray-400 text-base text-center">
              Aucun utilisateur ou publication trouvé
            </Text>
          </View>
        );
      }
      return renderCombinedResults();
    }

    if (activeTab === 'users') {
      if (searchedUsers.length === 0 && hasSearched) {
        return (
          <View className="items-center py-12">
            <Text className="text-gray-400 text-base text-center">
              Aucun utilisateur trouvé pour "{query}"
            </Text>
          </View>
        );
      }
      return (
        <FlatList
          data={searchedUsers}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          renderItem={renderUserItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      );
    }

    if (activeTab === 'posts') {
      if (searchedPosts.length === 0 && hasSearched) {
        return (
          <View className="items-center py-12">
            <Text className="text-gray-400 text-base text-center">
              Aucune publication trouvée pour "{query}"
            </Text>
          </View>
        );
      }
      return (
        <FlatList
          data={searchedPosts}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          renderItem={renderPostItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      );
    }

    return null;
  }, [activeTab, searchedUsers, searchedPosts, hasSearched, query, renderCombinedResults, renderUserItem, renderPostItem]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black py-3 ">
      {/* Header avec recherche */}
      <View className="bg-gradient-to-br from-[#2E3244] to-[#3A3F58] px-6 py-8 rounded-b-3xl shadow-2xl">
        <View className='flex flex-row justify-between px-4 items-center'>
          <Text className="text-white text-3xl font-bold text-center mb-6">
            Rechercher
          </Text>

          <TouchableOpacity onPress={onClose} className='pb-5'>
            <X size={32} color={isDark ? "white" : "black"}/>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center bg-white/10 rounded-2xl px-4 py-3 backdrop-blur-sm">
          <Search size={20} color="#C5C6C6" />
          
          <TextInput
            placeholder="Rechercher des utilisateurs ou publications..."
            placeholderTextColor="#C5C6C6"
            value={query}
            onChangeText={handleQueryChange}
            className="flex-1 text-white text-base mx-3 py-1"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} className="p-1">
              <X size={18} color="#C5C6C6" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Contenu principal */}
      <View className="flex-1 px-6 pt-6">
        {renderTabs()}
        
        {hasSearched || isLoading ? (
          renderResults()
        ) : (
          renderEmptyState()
        )}
      </View>
    </SafeAreaView>
  );
};

export default SearchBar;