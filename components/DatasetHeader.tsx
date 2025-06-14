interface DatasetHeaderProps {
  name: string;
  description: string;
  owner: string;
}

export default function DatasetHeader({ name, description }: DatasetHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">{name}</h1>
        <a
          href={`https://huggingface.co/datasets/lerobot/${name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Ver en Hugging Face
        </a>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  );
} 