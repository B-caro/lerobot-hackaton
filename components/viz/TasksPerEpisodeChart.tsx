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

interface TasksPerEpisodeChartProps {
  data: { bucket: string; count: number }[];
}

export default function TasksPerEpisodeChart({ data }: TasksPerEpisodeChartProps) {
  return (
    <div className="mt-10">
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Número de episodios según cantidad de tareas</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Histograma del número de tareas que tiene cada episodio.</p>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis dataKey="bucket" type="category" width={120} />
            <Tooltip formatter={(v: any) => [v, 'Episodios']} labelFormatter={(l) => `${l}`} />
            <Bar dataKey="count" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 