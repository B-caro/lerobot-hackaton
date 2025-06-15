'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DatasetSearchBar from '@/components/DatasetSearchBar';
import DatasetCardList from '@/components/DatasetCardList';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Cargar sugerencias de datasets de lerobot una sola vez
  useEffect(() => {
    const fetchDatasets = async () => {
      const response = await fetch('https://huggingface.co/api/datasets?author=lerobot&sort=lastModified');
      const data = await response.json();
      // Pasar objetos enriquecidos para el autocompletado
      setSuggestions(data.map((d: any) => ({
        id: d.id,
        version: d.version || undefined,
        lastModified: d.lastModified || undefined,
      })));
    };
    fetchDatasets();
  }, []);

  // Función para manejar la búsqueda y redirección
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Solo redirigir si el query es un dataset válido de lerobot
    const match = suggestions.find((d) => d.id.toLowerCase() === query.toLowerCase());
    if (match) {
      const [, name] = match.id.split('/');
      const params = searchParams.toString();
      router.push(`/dataset/lerobot/${name}${params ? `?${params}` : ''}`);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Explorador de Datasets de LeRobot</h1>
      <Suspense fallback={<div>Cargando...</div>}>
        <DatasetSearchBar onSearch={handleSearch} suggestions={suggestions} />
        <DatasetCardList searchQuery={searchQuery} />
      </Suspense>
    </main>
  );
} 