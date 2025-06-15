"use client";
import { useState } from 'react';

interface VideoSectionProps {
  owner: string;
  name: string;
  videoFiles: string[];
}

function splitPath(path: string) {
  // Devuelve [carpeta/cámara, archivo]
  const parts = path.replace(/^videos\//, '').split('/');
  const file = parts.pop() || '';
  const folder = parts.join('/') || '';
  return [folder, file];
}

export default function VideoSection({ owner, name, videoFiles }: VideoSectionProps) {
  if (!videoFiles.length) {
    return <div className="text-center py-8 text-gray-500">No hay videos disponibles para este dataset.</div>;
  }
  const [selected, setSelected] = useState(videoFiles[0]);
  const rawUrl = `https://huggingface.co/datasets/${owner}/${name}/resolve/main/${selected}`;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 my-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Vista de cámara (video)</h3>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Lista de videos */}
        <div className="md:w-80 w-full md:max-h-[500px] max-h-48 overflow-y-auto border-r border-gray-200 dark:border-gray-700 pr-2 md:pr-6">
          <ul className="space-y-2">
            {videoFiles.map(f => {
              const [folder, file] = splitPath(f);
              return (
                <li key={f}>
                  <button
                    onClick={() => setSelected(f)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-mono text-xs md:text-sm overflow-hidden whitespace-nowrap md:whitespace-normal md:break-all relative group
                      ${selected === f
                        ? 'bg-blue-500 text-white font-semibold'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900'}`}
                    title={f.replace(/^videos\//, '')}
                  >
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{folder}</div>
                    <div className="truncate font-medium group-hover:underline">{file}</div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        {/* Reproductor de video */}
        <div className="flex-1 flex items-center justify-center min-w-0">
          <video
            src={rawUrl}
            controls
            preload="metadata"
            style={{ width: '100%', maxWidth: 700, borderRadius: 12, background: '#000', margin: '0 auto' }}
          />
        </div>
      </div>
    </div>
  );
} 