import { useEffect, useState } from 'react';

interface TablePreviewProps {
  owner: string;
  name: string;
}

interface TableRow {
  [key: string]: any;
}

export default function TablePreview({ owner, name }: TablePreviewProps) {
  const [data, setData] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://huggingface.co/api/datasets/${owner}/${name}/data?split=train&limit=10`
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching table data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [owner, name]);

  if (loading) {
    return <div className="text-center py-4">Cargando datos...</div>;
  }

  if (data.length === 0) {
    return <div className="text-center py-4">No hay datos disponibles</div>;
  }

  const columns = Object.keys(data[0]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td
                    key={`${rowIndex}-${column}`}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {typeof row[column] === 'object'
                      ? JSON.stringify(row[column])
                      : String(row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 