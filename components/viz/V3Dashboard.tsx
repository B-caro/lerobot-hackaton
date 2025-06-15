import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface V3DashboardProps {
  v3Info: any;
  v3Stats: any;
}

export default function V3Dashboard({ v3Info, v3Stats }: V3DashboardProps) {
  return (
    <>
      {/* Gráficos de medias y std para reward, timestamp, frame_index */}
      {(!!(v3Stats.next?.reward && typeof v3Stats.next.reward.mean === 'number' && typeof v3Stats.next.reward.std === 'number') ||
        !!(v3Stats.timestamp && typeof v3Stats.timestamp.mean === 'number' && typeof v3Stats.timestamp.std === 'number') ||
        !!(v3Stats.frame_index && typeof v3Stats.frame_index.mean === 'number' && typeof v3Stats.frame_index.std === 'number')) && (
        <div className="mt-10 w-full">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Estadísticas globales de recompensa, tiempo y frames</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Aquí se muestra la media y desviación estándar de la recompensa, el timestamp y el índice de frame para todo el dataset.</p>
          <div className="flex flex-col md:flex-row gap-8 w-full">
            {/* next.reward */}
            {v3Stats.next?.reward && typeof v3Stats.next.reward.mean === 'number' && typeof v3Stats.next.reward.std === 'number' && (
              <div className="flex-1 flex flex-col h-full min-h-[400px]">
                <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-200">Recompensa</h4>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={[{ name: 'Media', value: v3Stats.next.reward.mean }, { name: 'Std', value: v3Stats.next.reward.std }]}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="text-xs mt-2 text-gray-500">Min: {v3Stats.next.reward.min}, Max: {v3Stats.next.reward.max}</div>
              </div>
            )}
            {/* timestamp */}
            {v3Stats.timestamp && typeof v3Stats.timestamp.mean === 'number' && typeof v3Stats.timestamp.std === 'number' && (
              <div className="flex-1 flex flex-col h-full min-h-[400px]">
                <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-200">Timestamp</h4>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={[
                    { name: 'Media', value: isNaN(v3Stats.timestamp.mean) ? 0 : v3Stats.timestamp.mean },
                    { name: 'Std', value: isNaN(v3Stats.timestamp.std) ? 0 : v3Stats.timestamp.std }
                  ]}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="text-xs mt-2 text-gray-500">Min: {v3Stats.timestamp.min}, Max: {v3Stats.timestamp.max}</div>
              </div>
            )}
            {/* frame_index */}
            {v3Stats.frame_index && typeof v3Stats.frame_index.mean === 'number' && typeof v3Stats.frame_index.std === 'number' && (
              <div className="flex-1 flex flex-col h-full min-h-[400px]">
                <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-200">Frame Index</h4>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={[
                    { name: 'Media', value: isNaN(v3Stats.frame_index.mean) ? 0 : v3Stats.frame_index.mean },
                    { name: 'Std', value: isNaN(v3Stats.frame_index.std) ? 0 : v3Stats.frame_index.std }
                  ]}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#f59e42" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="text-xs mt-2 text-gray-500">Min: {v3Stats.frame_index.min}, Max: {v3Stats.frame_index.max}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gráficos de medias y std para observation.state y action */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Estadísticas globales de observaciones y acciones</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Medias y desviaciones estándar por dimensión para observation.state y action.</p>
        <div className="flex flex-col gap-8 w-full">
          {/* observation.state (media) */}
          {v3Stats.observation?.state?.mean && Array.isArray(v3Stats.observation.state.mean) && v3Stats.observation.state.mean.length > 0 && (
            <div className="flex-1 flex flex-col h-full min-h-[240px]">
              <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-200">Observation State (media)</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={v3Stats.observation.state.mean.map((v: number, i: number) => ({ name: `S${i + 1}`, value: v }))}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* observation.state (std) */}
          {v3Stats.observation?.state?.std && Array.isArray(v3Stats.observation.state.std) && v3Stats.observation.state.std.length > 0 && (
            <div className="flex-1 flex flex-col h-full min-h-[240px]">
              <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-200">Observation State (std)</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={v3Stats.observation.state.std.map((v: number, i: number) => ({ name: `S${i + 1}`, value: v }))}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f43f5e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* action (media) */}
          {v3Stats.action?.mean && Array.isArray(v3Stats.action.mean) && v3Stats.action.mean.length > 0 && (
            <div className="flex-1 flex flex-col h-full min-h-[240px]">
              <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-200">Action (media)</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={v3Stats.action.mean.map((v: number, i: number) => ({ name: `A${i + 1}`, value: v }))}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* action (std) */}
          {v3Stats.action?.std && Array.isArray(v3Stats.action.std) && v3Stats.action.std.length > 0 && (
            <div className="flex-1 flex flex-col h-full min-h-[240px]">
              <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-200">Action (std)</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={v3Stats.action.std.map((v: number, i: number) => ({ name: `A${i + 1}`, value: v }))}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 