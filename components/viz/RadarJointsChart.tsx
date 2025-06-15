import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

interface RadarJointsChartProps {
  data: { joint: string; mean: number }[];
}

export default function RadarJointsChart({ data }: RadarJointsChartProps) {
  return (
    <div className="mt-10">
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Valores promedio de articulaciones</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Radar de los valores medios de cada articulación del robot.</p>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="80%">
            <PolarGrid />
            <PolarAngleAxis dataKey="joint" />
            <PolarRadiusAxis />
            <Radar name="Valor medio" dataKey="mean" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 