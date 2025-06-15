"use client";
import React, { useState } from 'react';

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
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-8 my-8 flex items-center justify-center min-h-[200px] border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <svg className="w-12 h-12 text-blue-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="text-blue-600 dark:text-blue-300 font-medium text-lg">No hay videos disponibles para este dataset.</span>
        </div>
      </div>
    );
  }
  const [selected, setSelected] = useState(videoFiles[0]);
  const rawUrl = `https://huggingface.co/datasets/${owner}/${name}/resolve/main/${selected}`;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 my-8 border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Vista de cámara (video)
      </h3>
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
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-mono text-xs md:text-sm overflow-hidden whitespace-nowrap md:whitespace-normal md:break-all relative group
                      ${selected === f
                        ? 'bg-blue-500 text-white font-semibold shadow-md'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:shadow-sm border border-gray-200 dark:border-gray-700'}`}
                    title={f.replace(/^videos\//, '')}
                  >
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      {folder}
                    </div>
                    <div className="truncate font-medium group-hover:underline mt-1">{file}</div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        {/* Reproductor de video */}
        <div className="flex-1 flex items-center justify-center min-h-[300px] bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <video 
            key={selected} 
            src={rawUrl} 
            controls 
            className="w-full max-w-2xl rounded-xl shadow-lg bg-black" 
          />
        </div>
      </div>
    </div>
  );
} 