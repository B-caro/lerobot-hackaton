// Función para agrupar en buckets
export function bucketize(lengths: number[], bucketSize: number) {
  if (!lengths.length) return [];
  const min = Math.min(...lengths);
  const max = Math.max(...lengths);
  const buckets: { intervalo: string; cantidad: number }[] = [];
  for (let start = Math.floor(min / bucketSize) * bucketSize; start <= max; start += bucketSize) {
    const end = start + bucketSize - 1;
    const count = lengths.filter((l) => l >= start && l <= end).length;
    buckets.push({ intervalo: `${start}-${end}`, cantidad: count });
  }
  return buckets.filter((b) => b.cantidad > 0);
}

// Función para agrupar en buckets de tipo float
export function bucketizeFloat(values: number[], binSize: number) {
  if (!values.length) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const buckets: { intervalo: string; cantidad: number }[] = [];
  for (let start = Math.floor(min / binSize) * binSize; start <= max; start += binSize) {
    const end = start + binSize;
    const count = values.filter((v) => v >= start && v < end).length;
    buckets.push({ intervalo: `${start.toFixed(2)}–${end.toFixed(2)}`, cantidad: count });
  }
  return buckets.filter((b) => b.cantidad > 0);
} 