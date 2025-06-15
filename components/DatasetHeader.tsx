interface DatasetHeaderProps {
  name: string;
  description: string;
  owner: string;
  meta?: Record<string, any>;
}

export default function DatasetHeader({ name, description, owner, meta }: DatasetHeaderProps) {
  // Para v3.0, mostrar boxes de resumen y boxes de otros campos clave dentro de Metadatos
  const isV3 = meta?.codebase_version === 'v3.0';
  // Campos para boxes
  let boxFields = [
    { key: 'total_episodes', label: 'Episodios' },
    { key: 'total_frames', label: 'Frames' },
    { key: 'fps', label: 'FPS' },
    { key: 'codebase_version', label: 'Versión' },
    { key: 'total_tasks', label: 'Tareas' },
    { key: 'robot_type', label: 'Robot' },
    { key: 'chunks_size', label: 'Chunk size' },
    { key: 'files_size_in_mb', label: 'Tamaño total (MB)' },
    { key: 'data_files_size_in_mb', label: 'Tamaño datos (MB)' },
    { key: 'video_files_size_in_mb', label: 'Tamaño videos (MB)' },
    { key: 'data_path', label: 'Data path' },
    { key: 'video_path', label: 'Video path' },
  ];
  // Para v2.x, agregar total_videos y total_chunks como boxes si existen
  if (meta && meta.codebase_version && meta.codebase_version.startsWith('v2')) {
    if (meta.total_videos !== undefined) boxFields.push({ key: 'total_videos', label: 'Videos' });
    if (meta.total_chunks !== undefined) boxFields.push({ key: 'total_chunks', label: 'Chunks' });
  }
  // Para splits, si existen, crear un box por cada split
  let splitBoxes: { key: string; label: string; value: any }[] = [];
  if (meta?.splits && typeof meta.splits === 'object') {
    splitBoxes = Object.entries(meta.splits).map(([split, val]) => ({
      key: `split_${split}`,
      label: `Split: ${split}`,
      value: val,
    }));
  }
  // Filtrar metadatos para boxes
  const metaBoxes = meta
    ? boxFields
        .filter(f => meta[f.key] !== undefined)
        .map(f => ({ key: f.key, label: f.label, value: meta[f.key] }))
        .concat(splitBoxes)
    : [];
  // El resto de campos para mostrar como texto
  const shownKeys = new Set([...boxFields.map(f => f.key), 'splits']);
  splitBoxes.forEach(b => shownKeys.add('splits'));
  const metaTextFields = meta
    ? Object.entries(meta).filter(([k]) => !shownKeys.has(k) && k !== 'features')
    : [];
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
      {meta && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Metadatos del dataset</h2>
          {/* Boxes de resumen, campos clave, paths y splits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
            {metaBoxes.map(({ key, label, value }) => (
              <div key={key} className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-blue-700 dark:text-blue-200 break-words w-full">
                  {typeof value === 'object' && value !== null ? (
                    <pre className="whitespace-pre-wrap text-xs bg-blue-100 dark:bg-blue-800 rounded p-2 mt-1 w-full text-center">{JSON.stringify(value, null, 2)}</pre>
                  ) : (
                    String(value)
                  )}
                </span>
                <span className="text-gray-700 dark:text-gray-300 text-sm mt-1 text-center">{label}</span>
              </div>
            ))}
          </div>
          {/* El resto de campos como texto al final */}
          {metaTextFields.length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              {metaTextFields.map(([key, value]) => (
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
            </div>
          )}
        </div>
      )}
    </div>
  );
} 