import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface VizPanelProps {
  owner: string;
  name: string;
  features: Record<string, any>;
}

const MAIN_FIELDS = [
  'timestamp',
  'frame_index',
  'episode_index',
  'index',
  'task_index',
];

export default function VizPanel({ owner, name, features }: VizPanelProps) {
  const [selectedField, setSelectedField] = useState<string>('frame_index');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Usar la API oficial de Hugging Face datasets-server
        const response = await fetch(
          `https://datasets-server.huggingface.co/rows?dataset=lerobot%2F${name}&config=default&split=train&offset=0&length=100`
        );
        const result = await response.json();
        // Los datos están en result.rows[].row
        const rows = result.rows ? result.rows.map((r: any) => r.row) : [];
        setData(rows);
      } catch (error) {
        console.error('Error fetching visualization data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [owner, name]);

  // Generar histograma para el campo seleccionado
  function getHistogramData(field: string) {
    if (!data.length) return [];
    const counts: Record<string, number> = {};
    data.forEach((row) => {
      const value = row[field];
      if (typeof value === 'number' || typeof value === 'string') {
        counts[value] = (counts[value] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([key, value]) => ({ value: key, count: value }));
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Visualización</h2>
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Selecciona un campo para ver su histograma:
        </h3>
        <div className="flex flex-wrap gap-2">
          {MAIN_FIELDS.map((field) => (
            <button
              key={field}
              onClick={() => setSelectedField(field)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                selectedField === field
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {field}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="text-center py-8">Cargando datos...</div>
      ) : (
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getHistogramData(selectedField)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="value" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
} 