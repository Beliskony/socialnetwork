import { useState } from 'react';
import { FC } from 'react';
import axios from 'axios';
import { Text, TextInput, View, TouchableOpacity, FlatList, Image} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SearchBar: FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);

    const handleSearch = async () => {
        try {
            const response = await axios.get(`https://apisocial-g8z6.onrender.com/api/user/search/${query}`);
            setResults(response.data || []);
        } catch (error) {
            console.error('Erreur lors de la recherche :', error);
        }
    };

    return (
        <SafeAreaView className="mt-52 p-3 gap-2 w-screen flex flex-col items-center shadow">
            <View className='h-40 w-full flex flex-row items-center '>
                <TextInput placeholder="Rechercher des posts ou utilisateurs..."
                value={query} onChangeText={setQuery}
                onSubmitEditing={handleSearch}
                className="w-[90%] h-14 p-3 rounded border border-gray-300 mb-4 text-base"
                placeholderTextColor="#999" />

                <TouchableOpacity onPress={handleSearch} className="pb-3 justify-center items-center">
                    <Image src='https://img.icons8.com/?size=100&id=7695&format=png&color=000000' className='h-12 w-12'/>
                </TouchableOpacity>
            </View>

            <View className="mt-6">
                {results.length > 0 ? (
                    <FlatList
                        data={results}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <Text className="py-2 text-base text-gray-800">
                                {item.name || item.title}
                            </Text>
                        )}
                    />
                ) : (
                    <Text className="text-gray-500 mt-2">
                        Aucun résultat trouvé.
                    </Text>
                )}
            </View>
        </SafeAreaView>
    );
};

export default SearchBar;
