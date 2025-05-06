import React, { useState } from 'react';
import axios from 'axios';

const SearchBar: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const handleSearch = async () => {
        try {
            const response = await axios.get(`/api/search`, { params: { query }, });
            setResults(response.data);
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    };

    return (
        <div className="p-4 max-w-lg mx-auto">
            <input
                type="text"
                placeholder="Rechercher des posts ou utilisateurs..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full p-2 rounded border border-gray-300 mb-4"
            />
            <button
                onClick={handleSearch}
                className="px-4 py-2 rounded bg-blue-500 text-white border-none cursor-pointer hover:bg-blue-600"
            >
                Rechercher
            </button>
            <div className="mt-4">
                {results.length > 0 ? (
                    <ul>
                        {results.map((result: any, index: number) => (
                            <li key={index} className="py-1">
                                {result.name || result.title}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">Aucun résultat trouvé.</p>
                )}
            </div>
        </div>
    );
};

export default SearchBar;
