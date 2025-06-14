import { useState } from 'react';

interface DatasetSearchBarProps {
  onSearch: (query: string) => void;
  suggestions?: string[];
}

export default function DatasetSearchBar({ onSearch, suggestions = [] }: DatasetSearchBarProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputValue);
    setShowSuggestions(false);
  };

  const filteredSuggestions = suggestions.filter((s) =>
    s.toLowerCase().includes(inputValue.toLowerCase())
  ).slice(0, 8);

  return (
    <form onSubmit={handleSubmit} className="mb-8 relative">
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
          placeholder="Buscar datasets (ej: lerobot/)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Buscar
        </button>
      </div>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-200 rounded-lg mt-1 w-full max-h-48 overflow-y-auto shadow">
          {filteredSuggestions.map((s) => (
            <li
              key={s}
              className="px-4 py-2 cursor-pointer hover:bg-blue-100"
              onMouseDown={() => {
                setInputValue(s);
                onSearch(s);
                setShowSuggestions(false);
              }}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
} 