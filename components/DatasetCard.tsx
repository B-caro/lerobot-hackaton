import Link from 'next/link';

interface Dataset {
  id: string;
  name?: string;
  lastModified: string;
  likes: number;
  downloads: number;
}

interface DatasetCardProps {
  dataset: Dataset;
}

export default function DatasetCard({ dataset }: DatasetCardProps) {
  const [owner, name] = dataset.id.split('/');
  const displayName = dataset.name && dataset.name !== '' ? dataset.name : dataset.id;

  return (
    <Link href={`/dataset/lerobot/${name}`}>
      <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
        <h2 className="text-xl font-semibold mb-2">{displayName}</h2>
        <p className="text-gray-600 text-sm mb-4">
          Última actualización: {new Date(dataset.lastModified).toLocaleDateString()}
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
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