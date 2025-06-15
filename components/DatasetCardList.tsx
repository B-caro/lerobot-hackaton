import { useEffect, useState } from 'react';
import DatasetCard from './DatasetCard';

interface Dataset {
  id: string;
  name?: string;
  lastModified: string;
  likes: number;
  downloads: number;
  version?: string;
}

interface DatasetCardListProps {
  searchQuery: string;
}

const ORDER_OPTIONS = [
  { label: 'Más recientes', value: 'recent' },
  { label: 'Más descargas', value: 'downloads' },
  { label: 'Más estrellas', value: 'likes' },
];

const VERSION_OPTIONS = [
  { label: 'Todas las versiones', value: 'all' },
  { label: 'Solo v2.x', value: 'v2' },
  { label: 'Solo v3.x', value: 'v3' },
];

export default function DatasetCardList({ searchQuery }: DatasetCardListProps) {
  const [allDatasets, setAllDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderBy, setOrderBy] = useState<'recent' | 'downloads' | 'likes'>('recent');
  const [versionFilter, setVersionFilter] = useState<'all' | 'v2' | 'v3'>('all');

  // Leer filtros de la URL al cargar
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const v = params.get('version');
    const o = params.get('order');
    if (v === 'v2' || v === 'v3' || v === 'all') setVersionFilter(v);
    if (o === 'recent' || o === 'downloads' || o === 'likes') setOrderBy(o);
  }, []);

  // Guardar filtros en la URL cuando cambian
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    params.set('version', versionFilter);
    params.set('order', orderBy);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }, [versionFilter, orderBy]);

  useEffect(() => {
    // Cargar datasets y sus versiones
    const fetchDatasets = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://huggingface.co/api/datasets?author=lerobot&sort=lastModified`
        );
        const data = await response.json();
        // Para cada dataset, obtener la versión
        const datasetsWithVersion = await Promise.all(
          data.map(async (d: any) => {
            let version = undefined;
            try {
              const [owner, name] = d.id.split('/');
              const metaRes = await fetch(`https://huggingface.co/datasets/${owner}/${name}/resolve/main/meta/info.json`);
              if (metaRes.ok) {
                const meta = await metaRes.json();
                version = meta.codebase_version || undefined;
              }
            } catch {}
            return { ...d, version };
          })
        );
        setAllDatasets(datasetsWithVersion);
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

  // Filtrar por versión
  const versionFiltered = filtered.filter((ds) => {
    if (versionFilter === 'all') return true;
    if (versionFilter === 'v2') return ds.version && ds.version.startsWith('v2');
    if (versionFilter === 'v3') return ds.version && ds.version.startsWith('v3');
    return true;
  });

  // Ordenar según el filtro seleccionado
  const sorted = [...versionFiltered].sort((a, b) => {
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
      <div className="flex gap-2 mb-4 flex-wrap">
        {VERSION_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setVersionFilter(opt.value as any)}
            className={`px-4 py-2 rounded-lg border transition-colors text-sm font-medium
              ${versionFilter === opt.value
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
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