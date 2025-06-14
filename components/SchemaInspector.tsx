interface SchemaInspectorProps {
  features: Record<string, any>;
}

export default function SchemaInspector({ features }: SchemaInspectorProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Esquema del Dataset</h2>
      <div className="space-y-4">
        {Object.entries(features).map(([key, value]) => (
          <div key={key} className="border-b border-gray-200 pb-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{key}</span>
              <span className="text-sm text-gray-500">{value.dtype || typeof value}</span>
            </div>
            {value.description && (
              <p className="text-sm text-gray-600 mt-1">{value.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 