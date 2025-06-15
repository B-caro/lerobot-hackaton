"use client";
import { useState } from 'react';
import { highlightJSON } from '../utils/highlightJSON';

interface DatasetHeaderProps {
  name: string;
  description: string;
  owner: string;
  meta?: Record<string, any>;
}

export default function DatasetHeader({ name, description, owner, meta }: DatasetHeaderProps) {
  // Para v3.0, mostrar boxes de resumen y boxes de otros campos clave dentro de Metadatos
  const isV3 = meta?.codebase_version === 'v3.0';
  const [copied, setCopied] = useState(false);
  const [showJSON, setShowJSON] = useState(false);

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(meta, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleShowJSON = () => {
    setShowJSON(prev => !prev);
  };

  // Campos para boxes
  let boxFields = [
    { key: 'total_episodes', label: 'Episodios', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { key: 'total_frames', label: 'Frames', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { key: 'fps', label: 'FPS', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { key: 'codebase_version', label: 'Versión', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
    { key: 'total_tasks', label: 'Tareas', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { key: 'robot_type', label: 'Robot', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { key: 'chunks_size', label: 'Chunk size', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4' },
    { key: 'files_size_in_mb', label: 'Tamaño total (MB)', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
    { key: 'data_files_size_in_mb', label: 'Tamaño datos (MB)', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { key: 'video_files_size_in_mb', label: 'Tamaño videos (MB)', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { key: 'data_path', label: 'Data path', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
    { key: 'video_path', label: 'Video path', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
  ];
  // Para v2.x, agregar total_videos y total_chunks como boxes si existen
  if (meta && meta.codebase_version && meta.codebase_version.startsWith('v2')) {
    if (meta.total_videos !== undefined) boxFields.push({ key: 'total_videos', label: 'Videos', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' });
    if (meta.total_chunks !== undefined) boxFields.push({ key: 'total_chunks', label: 'Chunks', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4' });
  }
  // Para splits, si existen, crear un box por cada split
  let splitBoxes: { key: string; label: string; value: any; icon: string }[] = [];
  if (meta?.splits && typeof meta.splits === 'object') {
    splitBoxes = Object.entries(meta.splits).map(([split, val]) => ({
      key: `split_${split}`,
      label: `Split: ${split}`,
      value: val,
      icon: 'M4 6h16M4 10h16M4 14h16M4 18h16'
    }));
  }
  // Filtrar metadatos para boxes
  const metaBoxes = meta
    ? boxFields
        .filter(f => meta[f.key] !== undefined)
        .map(f => ({ key: f.key, label: f.label, value: meta[f.key], icon: f.icon }))
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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">{name}</h1>
      </div>
      <a
        href={`https://huggingface.co/datasets/lerobot/${name}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md font-medium"
      >
        <span>Ver en Hugging Face</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
    {meta && (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-4 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Metadatos del dataset
          <button
            onClick={handleCopyJSON}
            className="ml-2 px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 transition-all"
          >
            {copied ? 'Copiado ✅' : 'Copiar JSON'}
          </button>
          <button
            onClick={toggleShowJSON}
            className="ml-2 px-2 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-100 transition-all"
          >
            {showJSON ? 'Ocultar JSON' : 'Mostrar JSON'}
          </button>
        </h2>
        {showJSON ? (
          <pre className="bg-gray-100 dark:bg-gray-900 text-sm rounded-xl p-4 overflow-x-auto whitespace-pre-wrap border border-gray-200 dark:border-gray-700 leading-relaxed font-mono"dangerouslySetInnerHTML={{ __html: highlightJSON(meta) }}/>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              {metaBoxes.map(({ key, label, value, icon }) => (
              <div key={key} className="group bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 flex flex-col items-center justify-center text-center border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200">
                  <div className="w-8 h-8 mb-2 text-blue-500">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 break-words w-full">
                    {typeof value === 'object' && value !== null ? (
                    <pre className="whitespace-pre-wrap text-xs bg-gray-100 dark:bg-gray-800 rounded-lg p-2 mt-1 w-full text-center">{JSON.stringify(value, null, 2)}</pre>
                    ) : (
                      String(value)
                    )}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm mt-2 text-center">{label}</span>
                </div>
              ))}
            </div>
            {metaTextFields.length > 0 && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                {metaTextFields.map(([key, value]) => (
                <div key={key} className="flex flex-col p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <dt className="font-medium text-gray-700 dark:text-gray-300 mb-1">{key}</dt>
                    <dd className="text-gray-900 dark:text-gray-100 break-all">
                      {typeof value === 'object' && value !== null ? (
                      <pre className="whitespace-pre-wrap text-xs bg-gray-100 dark:bg-gray-800 rounded-lg p-2 mt-1">{JSON.stringify(value, null, 2)}</pre>
                      ) : (
                        String(value)
                      )}
                    </dd>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    )}
  </div>
);
}
