export async function getMp4Files(owner: string, name: string): Promise<string[]> {
  const url = `https://huggingface.co/api/datasets/${owner}/${name}?files_metadata=true`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  // Log temporal para depuración
  console.log('Archivos encontrados en el dataset:', data.siblings.map((f: any) => f.rfilename));
  return data.siblings
    .filter((f: any) => f.rfilename && f.rfilename.toLowerCase().endsWith('.mp4'))
    .map((f: any) => f.rfilename);
} 