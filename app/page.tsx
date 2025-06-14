'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DatasetSearchBar from '@/components/DatasetSearchBar';
import DatasetCardList from '@/components/DatasetCardList';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const router = useRouter();

  // Cargar sugerencias de datasets de lerobot una sola vez
  useEffect(() => {
    const fetchDatasets = async () => {
      const response = await fetch('https://huggingface.co/api/datasets?author=lerobot&sort=lastModified');
      const data = await response.json();
      setSuggestions(data.map((d: any) => d.id));
    };
    fetchDatasets();
  }, []);

  // Función para manejar la búsqueda y redirección
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Solo redirigir si el query es un dataset válido de lerobot
    const match = suggestions.find((id) => id.toLowerCase() === query.toLowerCase());
    if (match) {
      const [, name] = match.split('/');
      router.push(`/dataset/lerobot/${name}`);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Explorador de Datasets</h1>
      <DatasetSearchBar onSearch={handleSearch} suggestions={suggestions} />
      <DatasetCardList searchQuery={searchQuery} />
    </main>
  );
} 