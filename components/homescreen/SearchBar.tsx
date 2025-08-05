import { useState } from 'react';
import { FC } from 'react';
import axios from 'axios';
import { Text, TextInput, View, TouchableOpacity, FlatList, Image} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SearchBar: FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        
        setIsLoading(true);
        try {
            const response = await axios.get(`https://apisocial-g8z6.onrender.com/api/user/search/${query}`);
            setResults(response.data || []);
        } catch (error) {
            console.error('Erreur lors de la recherche :', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 w-full bg-white">
            {/* Header avec votre bleu */}
            <View className="bg-[#2E3244] px-4 py-6 rounded-b-3xl shadow-lg">
                <Text className="text-white text-2xl font-bold text-center mb-4">
                    Recherche
                </Text>
                
                {/* Barre de recherche moderne */}
                <View className="flex-row items-center bg-white rounded-2xl px-4 py-2 shadow-sm">
                    <TextInput 
                        placeholder="Rechercher des utilisateurs..."
                        value={query} 
                        onChangeText={setQuery}
                        onSubmitEditing={handleSearch}
                        className="flex-1 text-base text-[#2E3244] py-2"
                        placeholderTextColor="#C5C6C6"
                    />
                    
                    <TouchableOpacity 
                        onPress={handleSearch} 
                        className="bg-[#F1895C] p-3 rounded-xl ml-2"
                        disabled={isLoading}
                    >
                        <Image 
                            source={{uri: 'https://img.icons8.com/?size=100&id=7695&format=png&color=FFFFFF'}} 
                            className="h-5 w-5"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Résultats */}
            <View className="flex-1 px-4 pt-6">
                {isLoading ? (
                    <View className="items-center py-8">
                        <Text className="text-[#C5C6C6] text-base">Recherche en cours...</Text>
                    </View>
                ) : results.length > 0 ? (
                    <FlatList
                        data={results}
                        keyExtractor={(item, index) => index.toString()}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
                                <View className="flex-row items-center">
                                    {/* Avatar placeholder */}
                                    <View className="w-12 h-12 bg-[#C5C6C6] rounded-full items-center justify-center mr-3">
                                        <Text className="text-white font-bold text-lg">
                                            {(item.name || item.title)?.charAt(0)?.toUpperCase()}
                                        </Text>
                                    </View>
                                    
                                    <View className="flex-1">
                                        <Text className="text-[#2E3244] font-semibold text-base">
                                            {item.name || item.title}
                                        </Text>
                                        {item.username && (
                                            <Text className="text-[#C5C6C6] text-sm mt-1">
                                                @{item.username}
                                            </Text>
                                        )}
                                    </View>
                                    
                                    {/* Indicateur */}
                                    <View className="w-2 h-2 bg-[#F1895C] rounded-full" />
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                ) : query.length > 0 ? (
                    <View className="items-center py-12">
                        <View className="w-20 h-20 bg-[#C5C6C6] rounded-full items-center justify-center mb-4">
                            <Image 
                                source={{uri: 'https://img.icons8.com/?size=100&id=11997&format=png&color=FFFFFF'}} 
                                className="h-10 w-10"
                            />
                        </View>
                        <Text className="text-[#C5C6C6] text-base text-center">
                            Aucun résultat trouvé pour "{query}"
                        </Text>
                        <Text className="text-[#C5C6C6] text-sm text-center mt-2">
                            Essayez avec d'autres mots-clés
                        </Text>
                    </View>
                ) : (
                    <View className="items-center py-12">
                        <View className="w-20 h-20 bg-[#F1895C] rounded-full items-center justify-center mb-4">
                            <Image 
                                source={{uri: 'https://img.icons8.com/?size=100&id=7695&format=png&color=FFFFFF'}} 
                                className="h-10 w-10"
                            />
                        </View>
                        <Text className="text-[#2E3244] text-lg font-semibold text-center">
                            Commencez votre recherche
                        </Text>
                        <Text className="text-[#C5C6C6] text-sm text-center mt-2">
                            Tapez pour trouver des utilisateurs
                        </Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

export default SearchBar;