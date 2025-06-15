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

interface HistogramProps {
  title: string;
  description: string;
  data: { intervalo: string; cantidad: number }[];
  color: string;
  tooltipFormatter?: (value: any, name: any, props: any) => [string, string];
  tooltipLabelFormatter?: (label: string) => string;
}

export default function Histogram({
  title,
  description,
  data,
  color,
  tooltipFormatter,
  tooltipLabelFormatter,
}: HistogramProps) {
  return (
    <div className="mt-10">
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{description}</p>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="intervalo" angle={-45} textAnchor="end" interval={0} height={60} />
            <YAxis allowDecimals={false} />
            <Tooltip
              formatter={tooltipFormatter || ((value: any) => [value, 'Cantidad'])}
              labelFormatter={tooltipLabelFormatter || ((label: string) => label)}
            />
            <Bar dataKey="cantidad" fill={color} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 