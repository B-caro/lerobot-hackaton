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

export default function DatasetCardList({ searchQuery }: DatasetCardListProps) {
  const [allDatasets, setAllDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);

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

  if (loading) {
    return <div className="text-center py-8">Cargando datasets...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map((dataset) => (
        <DatasetCard key={dataset.id} dataset={dataset} />
      ))}
    </div>
  );
} 