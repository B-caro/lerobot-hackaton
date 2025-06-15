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
import TaskTick from './TaskTick';

interface TaskBarChartProps {
  data: { task: string; count: number }[];
}

export default function TaskBarChart({ data }: TaskBarChartProps) {
  return (
    <div className="mt-10">
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Número de episodios por tarea</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Este gráfico muestra cuántos episodios hay para cada descripción de tarea (top 10).</p>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 140, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis dataKey="task" type="category" width={140} tick={<TaskTick />} />
            <Tooltip formatter={(value: any) => [`${value} episodios`, 'Cantidad']} labelFormatter={(label) => `${label}`} />
            <Bar dataKey="count" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 