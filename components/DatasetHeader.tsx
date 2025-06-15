interface DatasetHeaderProps {
  name: string;
  description: string;
  owner: string;
  meta?: Record<string, any>;
}

export default function DatasetHeader({ name, description, owner, meta }: DatasetHeaderProps) {
  const metaToShow = meta ? Object.fromEntries(Object.entries(meta).filter(([k]) => k !== 'features')) : null;
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">{name}</h1>
        <a
          href={`https://huggingface.co/datasets/lerobot/${name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Ver en Hugging Face
        </a>
      </div>
      {metaToShow && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Metadatos del dataset</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            {Object.entries(metaToShow).map(([key, value]) => (
              <div key={key} className="flex flex-col mb-1">
                <dt className="font-medium text-gray-700 dark:text-gray-300">{key}</dt>
                <dd className="text-gray-900 dark:text-gray-100 break-all">
                  {typeof value === 'object' && value !== null ? (
                    <pre className="whitespace-pre-wrap text-xs bg-gray-100 dark:bg-gray-900 rounded p-2 mt-1">{JSON.stringify(value, null, 2)}</pre>
                  ) : (
                    String(value)
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
} 