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

export default function VizPanel({ owner, name, features }: VizPanelProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleColumnSelect = (column: string) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((c) => c !== column)
        : [...prev, column]
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      if (selectedColumns.length === 0) return;

      setLoading(true);
      try {
        const response = await fetch(
          `https://huggingface.co/api/datasets/${owner}/${name}/data?split=train&limit=100`
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching visualization data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [owner, name, selectedColumns]);

  const getColumnType = (column: string) => {
    const feature = features[column];
    if (!feature) return 'unknown';
    return feature.dtype || typeof feature;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Visualización</h2>
      
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Seleccionar columnas para visualizar:
        </h3>
        <div className="flex flex-wrap gap-2">
          {Object.keys(features).map((column) => (
            <button
              key={column}
              onClick={() => handleColumnSelect(column)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedColumns.includes(column)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {column}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando datos...</div>
      ) : selectedColumns.length > 0 ? (
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={selectedColumns[0]} />
              <YAxis />
              <Tooltip />
              {selectedColumns.slice(1).map((column) => (
                <Bar
                  key={column}
                  dataKey={column}
                  fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Selecciona columnas para visualizar
        </div>
      )}
    </div>
  );
} 