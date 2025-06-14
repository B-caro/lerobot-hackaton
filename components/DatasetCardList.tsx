import { useEffect, useState } from 'react';
import DatasetCard from './DatasetCard';

interface Dataset {
  id: string;
  name?: string;
  lastModified: string;
  likes: number;
  downloads: number;
}

interface DatasetCardListProps {
  searchQuery: string;
}

const ORDER_OPTIONS = [
  { label: 'Más recientes', value: 'recent' },
  { label: 'Más descargas', value: 'downloads' },
  { label: 'Más estrellas', value: 'likes' },
];

export default function DatasetCardList({ searchQuery }: DatasetCardListProps) {
  const [allDatasets, setAllDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderBy, setOrderBy] = useState<'recent' | 'downloads' | 'likes'>('recent');

  useEffect(() => {
    // Solo cargar una vez todos los datasets de lerobot
    const fetchDatasets = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://huggingface.co/api/datasets?author=lerobot&sort=lastModified`
        );
        const data = await response.json();
        setAllDatasets(data);
      } catch (error) {
        console.error('Error fetching datasets:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDatasets();
  }, []);

  // Filtrado local predictivo
  const filtered = allDatasets.filter((ds) =>
    ds.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Ordenar según el filtro seleccionado
  const sorted = [...filtered].sort((a, b) => {
    if (orderBy === 'downloads') {
      return b.downloads - a.downloads;
    } else if (orderBy === 'likes') {
      return b.likes - a.likes;
    } else {
      // Más recientes por fecha
      return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    }
  });

  if (loading) {
    return <div className="text-center py-8">Cargando datasets...</div>;
  }

  return (
    <>
      <div className="flex gap-2 mb-6">
        {ORDER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setOrderBy(opt.value as any)}
            className={`px-4 py-2 rounded-lg border transition-colors text-sm font-medium
              ${orderBy === opt.value
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-8">
        {sorted.map((dataset) => (
          <DatasetCard key={dataset.id} dataset={dataset} />
        ))}
      </div>
    </>
  );
} 