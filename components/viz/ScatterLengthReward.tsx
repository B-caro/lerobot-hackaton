import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ScatterLengthRewardProps {
  data: { length: number; meanReward: number }[];
}

export default function ScatterLengthReward({ data }: ScatterLengthRewardProps) {
  return (
    <div className="mt-10">
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Longitud vs. recompensa media por episodio</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Cada punto representa un episodio. El eje X es la longitud (frames) y el eje Y la recompensa media.</p>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <XAxis dataKey="length" name="Longitud (frames)" />
            <YAxis dataKey="meanReward" name="Recompensa media" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v: any, n: any) => [v, n === 'length' ? 'Longitud' : 'Recompensa media']} />
            <Scatter data={data} fill="#0ea5e9" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 