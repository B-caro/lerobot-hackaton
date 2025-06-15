"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DatasetSearchBar from '@/components/DatasetSearchBar';
import DatasetCardList from '@/components/DatasetCardList';

export default function HomeClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchDatasets = async () => {
      const response = await fetch('https://huggingface.co/api/datasets?author=lerobot&sort=lastModified');
      const data = await response.json();
      setSuggestions(data.map((d: any) => ({
        id: d.id,
        version: d.version || undefined,
        lastModified: d.lastModified || undefined,
      })));
    };
    fetchDatasets();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const match = suggestions.find((d) => d.id.toLowerCase() === query.toLowerCase());
    if (match) {
      const [, name] = match.id.split('/');
      const params = searchParams.toString();
      router.push(`/dataset/lerobot/${name}${params ? `?${params}` : ''}`);
    }
  };

  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <DatasetSearchBar onSearch={handleSearch} suggestions={suggestions} />
      <DatasetCardList searchQuery={searchQuery} />
    </Suspense>
  );
} 