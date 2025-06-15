import { useState } from 'react';

interface DatasetSuggestion {
  id: string;
  version?: string;
  lastModified?: string;
}

interface DatasetSearchBarProps {
  onSearch: (query: string) => void;
  suggestions?: DatasetSuggestion[];
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
    s.id.toLowerCase().includes(inputValue.toLowerCase())
  ).slice(0, 8);

  return (
    <form onSubmit={handleSubmit} className="mb-8 relative">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
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
            className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 font-medium"
        >
          <span>Buscar</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="absolute z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl mt-2 w-full max-h-64 overflow-y-auto shadow-lg backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
          {filteredSuggestions.map((s) => (
            <li
              key={s.id}
              className="px-4 py-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700/50 text-gray-900 dark:text-gray-100 flex flex-col border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors duration-150"
              onMouseDown={() => {
                setInputValue(s.id);
                onSearch(s.id);
                setShowSuggestions(false);
              }}
            >
              <span className="font-medium text-blue-600 dark:text-blue-400">{s.id}</span>
              <div className="flex gap-4 mt-1">
                {s.version && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    v{s.version}
                  </span>
                )}
                {s.lastModified && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {s.lastModified.slice(0, 10)}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
} 