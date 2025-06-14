'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DatasetHeader from '@/components/DatasetHeader';
import SchemaInspector from '@/components/SchemaInspector';
import TablePreview from '@/components/TablePreview';
import VizPanel from '@/components/VizPanel';

interface DatasetDetail {
  id: string;
  name: string;
  description: string;
  lastModified: string;
  likes: number;
  downloads: number;
  tags: string[];
  author: string;
}

export default function DatasetDetailPage() {
  const params = useParams();
  const [dataset, setDataset] = useState<DatasetDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDatasetDetail = async () => {
      try {
        const response = await fetch(
          `https://huggingface.co/api/datasets/lerobot/${params.name}`
        );
        const data = await response.json();
        setDataset({
          id: data.id,
          name: data.id.split('/')[1],
          description: data.description,
          lastModified: data.lastModified,
          likes: data.likes,
          downloads: data.downloads,
          tags: data.tags,
          author: data.author,
        });
      } catch (error) {
        console.error('Error fetching dataset details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDatasetDetail();
  }, [params.name]);

  if (loading) {
    return <div className="text-center py-8">Cargando detalles del dataset...</div>;
  }

  if (!dataset) {
    return <div className="text-center py-8">No se encontró el dataset</div>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <DatasetHeader
        name={dataset.name}
        description={dataset.description}
        owner={dataset.author}
      />
      {/* Aquí puedes agregar más detalles básicos si lo deseas */}
      {/* El resto de la lógica para features, tabla, etc. puede ir aquí si se desea */}
    </main>
  );
} 