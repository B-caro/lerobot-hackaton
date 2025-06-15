import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface LineTotalRewardProps {
  data: { episode: number; totalReward: number }[];
}

export default function LineTotalReward({ data }: LineTotalRewardProps) {
  return (
    <div className="mt-10">
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Recompensa acumulada por episodio</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">La recompensa total estimada para cada episodio (recompensa media × longitud).</p>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
            <XAxis dataKey="episode" />
            <YAxis />
            <Tooltip formatter={(v: any) => [v, 'Recompensa total']} labelFormatter={(l) => `Episodio ${l}`} />
            <Line type="monotone" dataKey="totalReward" stroke="#f43f5e" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 