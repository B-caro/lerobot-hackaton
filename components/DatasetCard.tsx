import Link from 'next/link';

interface Dataset {
  id: string;
  name?: string;
  lastModified: string;
  likes: number;
  downloads: number;
  version?: string;
}

interface DatasetCardProps {
  dataset: Dataset;
}

export default function DatasetCard({ dataset }: DatasetCardProps) {
  const [owner, name] = dataset.id.split('/');
  const displayName = dataset.name && dataset.name !== '' ? dataset.name : dataset.id;

  return (
    <Link href={`/dataset/lerobot/${name}`}>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl transition-shadow shadow-md flex flex-col h-full">
        <h2 className="text-xl font-semibold mb-1 truncate" title={displayName}>{displayName}</h2>
        {dataset.version && (
          <div className="text-xs text-blue-600 dark:text-blue-300 mb-1">Versión: {dataset.version}</div>
        )}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 truncate">
          Última actualización: {dataset.lastModified.slice(0, 10)}
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-auto">
          <span className="flex items-center gap-1">
            <span role="img" aria-label="likes">⭐</span>
            {dataset.likes}
          </span>
          <span className="flex items-center gap-1">
            <span role="img" aria-label="downloads">⬇️</span>
            {dataset.downloads}
          </span>
        </div>
      </div>
    </Link>
  );
} 