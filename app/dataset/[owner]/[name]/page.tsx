import { getMp4Files } from '@/lib/hfVideos';
import VideoSection from '@/components/VideoSection';
import DatasetHeader from '@/components/DatasetHeader';
import VizPanel from '@/components/VizPanel';
import BackButton from '@/components/BackButton';

export default async function Page({ params }: { params: { owner: string; name: string } }) {
  // Fetch metadatos
  const metaRes = await fetch(`https://huggingface.co/datasets/${params.owner}/${params.name}/resolve/main/meta/info.json`);
  const meta = metaRes.ok ? await metaRes.json() : null;

  // Fetch dataset info
  const dataRes = await fetch(`https://huggingface.co/api/datasets/${params.owner}/${params.name}`);
  const data = dataRes.ok ? await dataRes.json() : null;

  // Fetch videos
  const videoFiles = await getMp4Files(params.owner, params.name);

  if (!data) {
    return <div className="text-center py-8">No se encontró el dataset</div>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <BackButton />
      <DatasetHeader
        name={data.id.split('/')[1]}
        description={data.description}
        owner={data.author}
        meta={meta}
      />
      <VideoSection owner={params.owner} name={params.name} videoFiles={videoFiles} />
      <VizPanel owner={params.owner} name={params.name} features={{}} />
    </main>
  );
} 