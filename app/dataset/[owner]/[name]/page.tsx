'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [dataset, setDataset] = useState<DatasetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<any>(null);

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
        // Fetch meta/info.json para mostrar metadatos
        const metaRes = await fetch(`https://huggingface.co/datasets/lerobot/${params.name}/resolve/main/meta/info.json`);
        if (metaRes.ok) {
          const metaJson = await metaRes.json();
          setMeta(metaJson);
        }
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
      <button
        onClick={() => {
          if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
          } else {
            router.push('/');
          }
        }}
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
      >
        <span aria-hidden="true">←</span> Regresar
      </button>
      <DatasetHeader
        name={dataset.name}
        description={dataset.description}
        owner={dataset.author}
        meta={meta}
      />
      {/* Aquí puedes agregar más detalles básicos si lo deseas */}
      <VizPanel owner={dataset.id.split('/')[0]} name={dataset.id.split('/')[1]} features={{}} />
      {/* El resto de la lógica para features, tabla, etc. puede ir aquí si se desea */}
    </main>
  );
} 