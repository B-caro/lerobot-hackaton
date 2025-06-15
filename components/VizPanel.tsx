import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import React from 'react';

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

// --- NUEVO: función para agrupar en buckets ---
function bucketize(lengths: number[], bucketSize: number) {
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

// --- NUEVO: función para agrupar en buckets de tipo float (para next_reward, magnitud) ---
function bucketizeFloat(values: number[], binSize: number) {
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

// Tick personalizado para etiquetas largas en el eje Y
const TaskTick = (props: any) => {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject width="200" height="40" x="-200" y="-10">
        <div style={{ fontSize: 12, color: '#374151', whiteSpace: 'pre-line', wordBreak: 'break-word', textAlign: 'right' }}>
          {payload.value}
        </div>
      </foreignObject>
    </g>
  );
};

export default function VizPanel({ owner, name, features }: VizPanelProps) {
  const [selectedField, setSelectedField] = useState<string>('frame_index');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- NUEVO: estados para histograma de longitudes ---
  const [lengths, setLengths] = useState<number[]>([]);
  const [loadingLengths, setLoadingLengths] = useState(false);
  const [errorLengths, setErrorLengths] = useState<string | null>(null);
  const bucketSize = 10;

  // --- NUEVO: Estado para versión y metadatos ---
  const [codebaseVersion, setCodebaseVersion] = useState<string | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);

  // --- Dashboard de resumen para v3.0 ---
  const [v3Info, setV3Info] = useState<any>(null);
  const [v3Stats, setV3Stats] = useState<any>(null);
  const [loadingV3, setLoadingV3] = useState(false);
  const [errorV3, setErrorV3] = useState<string | null>(null);

  // Detectar versión y metadatos
  useEffect(() => {
    const fetchMeta = async () => {
      setMetaError(null);
      setCodebaseVersion(null);
      try {
        const url = `https://huggingface.co/datasets/${owner}/${name}/resolve/main/meta/info.json`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('No se pudo descargar info.json');
        const meta = await response.json();
        setCodebaseVersion(meta.codebase_version || null);
      } catch (e: any) {
        setMetaError(e.message || 'Error al cargar metadatos');
      }
    };
    fetchMeta();
  }, [owner, name]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://datasets-server.huggingface.co/rows?dataset=${encodeURIComponent(owner + '/' + name)}&config=default&split=train&offset=0&length=100`
        );
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const result = await response.json();
        const rows = result.rows ? result.rows.map((r: any) => r.row) : [];
        setData(rows);
      } catch (error: any) {
        setError(error.message || 'Error desconocido');
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [owner, name]);

  // --- NUEVO: obtener y parsear episodes.jsonl ---
  useEffect(() => {
    const fetchLengths = async () => {
      setLoadingLengths(true);
      setErrorLengths(null);
      setLengths([]);
      try {
        const url = `https://huggingface.co/datasets/${owner}/${name}/resolve/main/meta/episodes.jsonl`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('No se pudo descargar episodes.jsonl');
        const text = await response.text();
        const lines = text.split('\n').filter(Boolean);
        const episodeLengths: number[] = [];
        for (const line of lines) {
          try {
            const obj = JSON.parse(line);
            if (typeof obj.length === 'number') {
              episodeLengths.push(obj.length);
            }
          } catch (e) {
            // línea corrupta, ignorar
          }
        }
        if (!episodeLengths.length) throw new Error('No se encontraron longitudes de episodios');
        setLengths(episodeLengths);
      } catch (e: any) {
        setErrorLengths(e.message || 'Error al cargar longitudes');
      } finally {
        setLoadingLengths(false);
      }
    };
    fetchLengths();
  }, [owner, name]);

  // --- NUEVO: datos de buckets para el histograma de longitudes ---
  const bucketData = bucketize(lengths, bucketSize);

  // --- NUEVO: Histograma de recompensas (next_reward) ---
  const [rewards, setRewards] = useState<number[]>([]);
  const [loadingRewards, setLoadingRewards] = useState(false);
  const [errorRewards, setErrorRewards] = useState<string | null>(null);
  const rewardBinSize = 0.1;

  // --- MODIFICAR: Fetches condicionales según versión ---
  // Para cada fetch, sólo intentar si la versión lo soporta
  // v2.1: episodes.jsonl + episodes_stats.jsonl
  // v2.0: episodes.jsonl + stats.json
  // v3.0: Parquet (no soportado)

  useEffect(() => {
    if (!codebaseVersion) return;
    if (codebaseVersion === 'v3.0') return;
    const fetchRewards = async () => {
      setLoadingRewards(true);
      setErrorRewards(null);
      setRewards([]);
      try {
        let url = '';
        if (codebaseVersion === 'v2.1') {
          url = `https://datasets-server.huggingface.co/rows?dataset=${encodeURIComponent(owner + '/' + name)}&config=default&split=train&offset=0&length=1000`;
        } else if (codebaseVersion === 'v2.0') {
          url = `https://huggingface.co/datasets/${owner}/${name}/resolve/main/meta/episodes.jsonl`;
        }
        if (!url) throw new Error('No hay fuente de recompensas para esta versión');
        const response = await fetch(url);
        if (!response.ok) throw new Error('No se pudo descargar los datos de recompensas');
        if (codebaseVersion === 'v2.1') {
          const result = await response.json();
          const rows = result.rows ? result.rows.map((r: any) => r.row) : [];
          const rewardsArr: number[] = [];
          for (const row of rows) {
            if (typeof row.next_reward === 'number') {
              rewardsArr.push(row.next_reward);
            }
          }
          if (!rewardsArr.length) throw new Error('No se encontraron recompensas');
          setRewards(rewardsArr);
        } else if (codebaseVersion === 'v2.0') {
          const text = await response.text();
          const lines = text.split('\n').filter(Boolean);
          const rewardsArr: number[] = [];
          for (const line of lines) {
            try {
              const obj = JSON.parse(line);
              if (typeof obj.next_reward === 'number') {
                rewardsArr.push(obj.next_reward);
              }
            } catch (e) {}
          }
          if (!rewardsArr.length) throw new Error('No se encontraron recompensas');
          setRewards(rewardsArr);
        }
      } catch (e: any) {
        setErrorRewards(e.message || 'Error al cargar recompensas');
      } finally {
        setLoadingRewards(false);
      }
    };
    fetchRewards();
  }, [owner, name, codebaseVersion]);
  const rewardBuckets = bucketizeFloat(rewards, rewardBinSize);

  // --- NUEVO: Serie temporal de recompensa media por episodio ---
  const [meanRewards, setMeanRewards] = useState<{ episode: number; meanReward: number }[]>([]);
  const [loadingMeanRewards, setLoadingMeanRewards] = useState(false);
  const [errorMeanRewards, setErrorMeanRewards] = useState<string | null>(null);

  useEffect(() => {
    if (!codebaseVersion) return;
    if (codebaseVersion === 'v3.0') return;
    const fetchMeanRewards = async () => {
      setLoadingMeanRewards(true);
      setErrorMeanRewards(null);
      setMeanRewards([]);
      try {
        let url = '';
        if (codebaseVersion === 'v2.1') {
          url = `https://huggingface.co/datasets/${owner}/${name}/resolve/main/meta/episodes_stats.jsonl`;
        } else if (codebaseVersion === 'v2.0') {
          url = `https://huggingface.co/datasets/${owner}/${name}/resolve/main/meta/stats.json`;
        }
        if (!url) throw new Error('No hay estadísticas para esta versión');
        const response = await fetch(url);
        if (!response.ok) throw new Error('No se pudo descargar estadísticas');
        if (codebaseVersion === 'v2.1') {
          const text = await response.text();
          const lines = text.split('\n').filter(Boolean);
          const arr: { episode: number; meanReward: number }[] = [];
          let idx = 0;
          for (const line of lines) {
            try {
              const obj = JSON.parse(line);
              if (obj.stats && typeof obj.stats.next_reward?.mean === 'number') {
                arr.push({ episode: idx, meanReward: obj.stats.next_reward.mean });
              }
              idx++;
            } catch (e) {}
          }
          if (!arr.length) throw new Error('No se encontraron estadísticas de recompensa');
          setMeanRewards(arr);
        } else if (codebaseVersion === 'v2.0') {
          const stats = await response.json();
          if (typeof stats.next_reward?.mean === 'number') {
            setMeanRewards([{ episode: 0, meanReward: stats.next_reward.mean }]);
          } else {
            throw new Error('No se encontró la media global de recompensa');
          }
        }
      } catch (e: any) {
        setErrorMeanRewards(e.message || 'Error al cargar estadísticas');
      } finally {
        setLoadingMeanRewards(false);
      }
    };
    fetchMeanRewards();
  }, [owner, name, codebaseVersion]);

  // --- NUEVO: Histograma de magnitud de acción ---
  const [magnitudes, setMagnitudes] = useState<number[]>([]);
  const [loadingMagnitudes, setLoadingMagnitudes] = useState(false);
  const [errorMagnitudes, setErrorMagnitudes] = useState<string | null>(null);
  const magnitudeBinSize = 0.05;

  useEffect(() => {
    if (!codebaseVersion) return;
    if (codebaseVersion === 'v3.0') return;
    const fetchMagnitudes = async () => {
      setLoadingMagnitudes(true);
      setErrorMagnitudes(null);
      setMagnitudes([]);
      try {
        let url = '';
        if (codebaseVersion === 'v2.1') {
          url = `https://datasets-server.huggingface.co/rows?dataset=${encodeURIComponent(owner + '/' + name)}&config=default&split=train&offset=0&length=1000`;
        } else if (codebaseVersion === 'v2.0') {
          url = `https://huggingface.co/datasets/${owner}/${name}/resolve/main/meta/episodes.jsonl`;
        }
        if (!url) throw new Error('No hay fuente de acciones para esta versión');
        const response = await fetch(url);
        if (!response.ok) throw new Error('No se pudo descargar los datos de acciones');
        const mags: number[] = [];
        if (codebaseVersion === 'v2.1') {
          const result = await response.json();
          const rows = result.rows ? result.rows.map((r: any) => r.row) : [];
          for (const row of rows) {
            if (Array.isArray(row.action)) {
              const mag = Math.sqrt(row.action.reduce((acc: number, v: number) => acc + v * v, 0));
              mags.push(mag);
            }
          }
        } else if (codebaseVersion === 'v2.0') {
          const text = await response.text();
          const lines = text.split('\n').filter(Boolean);
          for (const line of lines) {
            try {
              const obj = JSON.parse(line);
              if (Array.isArray(obj.action)) {
                const mag = Math.sqrt(obj.action.reduce((acc: number, v: number) => acc + v * v, 0));
                mags.push(mag);
              }
            } catch (e) {}
          }
        }
        if (!mags.length) throw new Error('No se encontraron acciones');
        setMagnitudes(mags);
      } catch (e: any) {
        setErrorMagnitudes(e.message || 'Error al cargar magnitudes');
      } finally {
        setLoadingMagnitudes(false);
      }
    };
    fetchMagnitudes();
  }, [owner, name, codebaseVersion]);
  const magnitudeBuckets = bucketizeFloat(magnitudes, magnitudeBinSize);

  // --- NUEVO: Conteo de episodios por tarea ---
  const [taskCounts, setTaskCounts] = useState<{ task: string; count: number }[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [errorTasks, setErrorTasks] = useState<string | null>(null);

  useEffect(() => {
    if (!codebaseVersion) return;
    if (codebaseVersion === 'v3.0') return;
    const fetchTasks = async () => {
      setLoadingTasks(true);
      setErrorTasks(null);
      setTaskCounts([]);
      try {
        if (codebaseVersion !== 'v2.1' && codebaseVersion !== 'v2.0') throw new Error('No hay tareas para esta versión');
        const url = `https://huggingface.co/datasets/${owner}/${name}/resolve/main/meta/episodes.jsonl`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('No se pudo descargar episodes.jsonl');
        const text = await response.text();
        const lines = text.split('\n').filter(Boolean);
        const taskMap: Record<string, number> = {};
        for (const line of lines) {
          try {
            const obj = JSON.parse(line);
            if (Array.isArray(obj.tasks)) {
              for (const t of obj.tasks) {
                if (typeof t === 'string') {
                  taskMap[t] = (taskMap[t] || 0) + 1;
                }
              }
            }
          } catch (e) {}
        }
        const arr = Object.entries(taskMap)
          .map(([task, count]) => ({ task, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
        if (!arr.length) throw new Error('No se encontraron tareas');
        setTaskCounts(arr);
      } catch (e: any) {
        setErrorTasks(e.message || 'Error al cargar tareas');
      } finally {
        setLoadingTasks(false);
      }
    };
    fetchTasks();
  }, [owner, name, codebaseVersion]);

  // --- 1. Dispersión longitud vs recompensa media ---
  const [lengthVsReward, setLengthVsReward] = useState<{ episode: number; length: number; meanReward: number }[]>([]);
  const [loadingLengthVsReward, setLoadingLengthVsReward] = useState(false);
  const [errorLengthVsReward, setErrorLengthVsReward] = useState<string | null>(null);

  // --- 2. Recompensa total por episodio ---
  const [totalRewardPerEpisode, setTotalRewardPerEpisode] = useState<{ episode: number; totalReward: number }[]>([]);
  const [loadingTotalReward, setLoadingTotalReward] = useState(false);
  const [errorTotalReward, setErrorTotalReward] = useState<string | null>(null);

  // --- 3. Histograma de deltas de tiempo ---
  const [deltas, setDeltas] = useState<number[]>([]);
  const [loadingDeltas, setLoadingDeltas] = useState(false);
  const [errorDeltas, setErrorDeltas] = useState<string | null>(null);
  const deltaBinSize = 0.01;

  // --- 4. Radar de posición articular media ---
  const [meanJoints, setMeanJoints] = useState<{ joint: string; mean: number }[]>([]);
  const [loadingJoints, setLoadingJoints] = useState(false);
  const [errorJoints, setErrorJoints] = useState<string | null>(null);

  // --- 5. Histograma de episodios por número de tareas ---
  const [tasksPerEpisode, setTasksPerEpisode] = useState<{ bucket: string; count: number }[]>([]);
  const [loadingTasksPerEpisode, setLoadingTasksPerEpisode] = useState(false);
  const [errorTasksPerEpisode, setErrorTasksPerEpisode] = useState<string | null>(null);

  // --- 1 y 2: Fetch y join de episodes.jsonl y episodes_stats.jsonl ---
  useEffect(() => {
    if (!codebaseVersion || codebaseVersion === 'v3.0') return;
    const fetchLengthVsReward = async () => {
      setLoadingLengthVsReward(true);
      setErrorLengthVsReward(null);
      setLengthVsReward([]);
      setLoadingTotalReward(true);
      setErrorTotalReward(null);
      setTotalRewardPerEpisode([]);
      try {
        // Fetch episodes.jsonl
        const epRes = await fetch(`https://huggingface.co/datasets/${owner}/${name}/resolve/main/meta/episodes.jsonl`);
        if (!epRes.ok) throw new Error('No se pudo descargar episodes.jsonl');
        const epText = await epRes.text();
        const epLines = epText.split('\n').filter(Boolean);
        const epMap: Record<number, number> = {};
        epLines.forEach((line, idx) => {
          try {
            const obj = JSON.parse(line);
            if (typeof obj.length === 'number') {
              epMap[idx] = obj.length;
            }
          } catch {}
        });
        // Fetch episodes_stats.jsonl
        const statsRes = await fetch(`https://huggingface.co/datasets/${owner}/${name}/resolve/main/meta/episodes_stats.jsonl`);
        if (!statsRes.ok) throw new Error('No se pudo descargar episodes_stats.jsonl');
        const statsText = await statsRes.text();
        const statsLines = statsText.split('\n').filter(Boolean);
        const arr: { episode: number; length: number; meanReward: number }[] = [];
        const arrTotal: { episode: number; totalReward: number }[] = [];
        statsLines.forEach((line, idx) => {
          try {
            const obj = JSON.parse(line);
            if (obj.stats && typeof obj.stats.next_reward?.mean === 'number' && typeof epMap[idx] === 'number') {
              arr.push({ episode: idx, length: epMap[idx], meanReward: obj.stats.next_reward.mean });
              arrTotal.push({ episode: idx, totalReward: obj.stats.next_reward.mean * epMap[idx] });
            }
          } catch {}
        });
        if (!arr.length) throw new Error('No se pudo unir longitud y recompensa media');
        setLengthVsReward(arr);
        setTotalRewardPerEpisode(arrTotal);
      } catch (e: any) {
        setErrorLengthVsReward(e.message || 'Error al cargar dispersión');
        setErrorTotalReward(e.message || 'Error al cargar recompensa total');
      } finally {
        setLoadingLengthVsReward(false);
        setLoadingTotalReward(false);
      }
    };
    fetchLengthVsReward();
  }, [owner, name, codebaseVersion]);

  // --- 3: Deltas de tiempo ---
  useEffect(() => {
    if (!codebaseVersion || codebaseVersion === 'v3.0') return;
    const fetchDeltas = async () => {
      setLoadingDeltas(true);
      setErrorDeltas(null);
      setDeltas([]);
      try {
        // Usar el endpoint de Hugging Face datasets-server para obtener timestamps
        const url = `https://datasets-server.huggingface.co/rows?dataset=${encodeURIComponent(owner + '/' + name)}&config=default&split=train&offset=0&length=1000`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('No se pudo descargar los datos de pasos');
        const result = await response.json();
        const rows = result.rows ? result.rows.map((r: any) => r.row) : [];
        const timestamps: number[] = [];
        for (const row of rows) {
          if (typeof row.timestamp === 'number') {
            timestamps.push(row.timestamp);
          }
        }
        const deltasArr: number[] = [];
        timestamps.forEach((t, i) => {
          if (i > 0) deltasArr.push(t - timestamps[i - 1]);
        });
        if (!deltasArr.length) throw new Error('No se encontraron deltas de tiempo');
        setDeltas(deltasArr);
      } catch (e: any) {
        setErrorDeltas(e.message || 'Error al cargar deltas');
      } finally {
        setLoadingDeltas(false);
      }
    };
    fetchDeltas();
  }, [owner, name, codebaseVersion]);
  const deltaBuckets = bucketizeFloat(deltas, deltaBinSize);

  // --- 4: Radar de posición articular media ---
  useEffect(() => {
    if (!codebaseVersion || codebaseVersion === 'v3.0') return;
    const fetchJoints = async () => {
      setLoadingJoints(true);
      setErrorJoints(null);
      setMeanJoints([]);
      try {
        const url = `https://huggingface.co/datasets/${owner}/${name}/resolve/main/meta/episodes_stats.jsonl`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('No se pudo descargar episodes_stats.jsonl');
        const text = await response.text();
        const lines = text.split('\n').filter(Boolean);
        // Acumular medias por joint
        let sum: number[] = [];
        let count = 0;
        for (const line of lines) {
          try {
            const obj = JSON.parse(line);
            if (obj.stats && Array.isArray(obj.stats.observation?.state?.mean)) {
              const arr = obj.stats.observation.state.mean;
              if (sum.length === 0) sum = Array(arr.length).fill(0);
              arr.forEach((v: number, i: number) => {
                sum[i] += v;
              });
              count++;
            }
          } catch {}
        }
        if (!sum.length || !count) throw new Error('No se encontraron medias de articulaciones');
        const meanArr = sum.map((s, i) => ({ joint: `joint${i + 1}`, mean: s / count }));
        setMeanJoints(meanArr);
      } catch (e: any) {
        setErrorJoints(e.message || 'Error al cargar articulaciones');
      } finally {
        setLoadingJoints(false);
      }
    };
    fetchJoints();
  }, [owner, name, codebaseVersion]);

  // --- 5: Histograma de episodios por número de tareas ---
  useEffect(() => {
    if (!codebaseVersion || codebaseVersion === 'v3.0') return;
    const fetchTasksPerEpisode = async () => {
      setLoadingTasksPerEpisode(true);
      setErrorTasksPerEpisode(null);
      setTasksPerEpisode([]);
      try {
        const url = `https://huggingface.co/datasets/${owner}/${name}/resolve/main/meta/episodes.jsonl`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('No se pudo descargar episodes.jsonl');
        const text = await response.text();
        const lines = text.split('\n').filter(Boolean);
        const counts: Record<number, number> = {};
        for (const line of lines) {
          try {
            const obj = JSON.parse(line);
            if (Array.isArray(obj.tasks)) {
              const n = obj.tasks.length;
              counts[n] = (counts[n] || 0) + 1;
            }
          } catch {}
        }
        const arr = Object.entries(counts).map(([k, v]) => ({ bucket: `${k} tarea${k === '1' ? '' : 's'}`, count: v }));
        setTasksPerEpisode(arr);
      } catch (e: any) {
        setErrorTasksPerEpisode(e.message || 'Error al cargar tareas por episodio');
      } finally {
        setLoadingTasksPerEpisode(false);
      }
    };
    fetchTasksPerEpisode();
  }, [owner, name, codebaseVersion]);

  // --- Dashboard de resumen para v3.0 ---
  useEffect(() => {
    if (codebaseVersion !== 'v3.0') return;
    setLoadingV3(true);
    setErrorV3(null);
    setV3Info(null);
    setV3Stats(null);
    const fetchV3 = async () => {
      try {
        const infoRes = await fetch(`https://huggingface.co/datasets/${owner}/${name}/resolve/main/meta/info.json`);
        if (!infoRes.ok) throw new Error('No se pudo descargar info.json');
        const info = await infoRes.json();
        setV3Info(info);
        const statsRes = await fetch(`https://huggingface.co/datasets/${owner}/${name}/resolve/main/meta/stats.json`);
        if (!statsRes.ok) throw new Error('No se pudo descargar stats.json');
        const stats = await statsRes.json();
        setV3Stats(stats);
      } catch (e: any) {
        setErrorV3(e.message || 'Error al cargar estadísticas globales');
      } finally {
        setLoadingV3(false);
      }
    };
    fetchV3();
  }, [owner, name, codebaseVersion]);

  // Determinar si hay al menos un gráfico para mostrar
  const hasAnyChart =
    (bucketData.length > 0 && !loadingLengths && !errorLengths) ||
    (rewardBuckets.length > 0 && !loadingRewards && !errorRewards) ||
    (meanRewards.length > 0 && !loadingMeanRewards && !errorMeanRewards) ||
    (magnitudeBuckets.length > 0 && !loadingMagnitudes && !errorMagnitudes) ||
    (taskCounts.length > 0 && !loadingTasks && !errorTasks) ||
    (lengthVsReward.length > 0 && !loadingLengthVsReward && !errorLengthVsReward) ||
    (totalRewardPerEpisode.length > 0 && !loadingTotalReward && !errorTotalReward) ||
    (deltaBuckets.length > 0 && !loadingDeltas && !errorDeltas) ||
    (meanJoints.length > 0 && !loadingJoints && !errorJoints) ||
    (tasksPerEpisode.length > 0 && !loadingTasksPerEpisode && !errorTasksPerEpisode);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
      {/* --- Dashboard de resumen para v3.0 --- */}
      {codebaseVersion === 'v3.0' && (
        <>
          {loadingV3 ? (
            <div className="text-center py-12 text-gray-500 text-lg font-medium">Cargando estadísticas globales...</div>
          ) : errorV3 ? (
            <div className="text-center py-12 text-red-500 text-lg font-medium">Lo sentimos, este dataset v3.0 no expone estadísticas globales. No hay gráficos que mostrar.</div>
          ) : v3Info && v3Stats ? (
            <>
              {/* Gráficos de medias y std para reward, timestamp, frame_index */}
              {(!!(v3Stats.next?.reward && typeof v3Stats.next.reward.mean === 'number' && typeof v3Stats.next.reward.std === 'number') ||
                !!(v3Stats.timestamp && typeof v3Stats.timestamp.mean === 'number' && typeof v3Stats.timestamp.std === 'number') ||
                !!(v3Stats.frame_index && typeof v3Stats.frame_index.mean === 'number' && typeof v3Stats.frame_index.std === 'number')) && (
                <div className="mt-10 w-full">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Estadísticas globales de recompensa, tiempo y frames</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Aquí se muestra la media y desviación estándar de la recompensa, el timestamp y el índice de frame para todo el dataset.</p>
                  <div className="flex flex-col md:flex-row gap-8 w-full">
                    {/* next.reward */}
                    {v3Stats.next?.reward && typeof v3Stats.next.reward.mean === 'number' && typeof v3Stats.next.reward.std === 'number' && (
                      <div className="flex-1 flex flex-col h-full min-h-[400px]">
                        <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-200">Recompensa</h4>
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={[{ name: 'Media', value: v3Stats.next.reward.mean }, { name: 'Std', value: v3Stats.next.reward.std }]}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                        <div className="text-xs mt-2 text-gray-500">Min: {v3Stats.next.reward.min}, Max: {v3Stats.next.reward.max}</div>
                      </div>
                    )}
                    {/* timestamp */}
                    {v3Stats.timestamp && typeof v3Stats.timestamp.mean === 'number' && typeof v3Stats.timestamp.std === 'number' && (
                      <div className="flex-1 flex flex-col h-full min-h-[400px]">
                        <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-200">Timestamp</h4>
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={[
                            { name: 'Media', value: isNaN(v3Stats.timestamp.mean) ? 0 : v3Stats.timestamp.mean },
                            { name: 'Std', value: isNaN(v3Stats.timestamp.std) ? 0 : v3Stats.timestamp.std }
                          ]}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#6366f1" />
                          </BarChart>
                        </ResponsiveContainer>
                        <div className="text-xs mt-2 text-gray-500">Min: {v3Stats.timestamp.min}, Max: {v3Stats.timestamp.max}</div>
                      </div>
                    )}
                    {/* frame_index */}
                    {v3Stats.frame_index && typeof v3Stats.frame_index.mean === 'number' && typeof v3Stats.frame_index.std === 'number' && (
                      <div className="flex-1 flex flex-col h-full min-h-[400px]">
                        <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-200">Frame Index</h4>
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={[
                            { name: 'Media', value: isNaN(v3Stats.frame_index.mean) ? 0 : v3Stats.frame_index.mean },
                            { name: 'Std', value: isNaN(v3Stats.frame_index.std) ? 0 : v3Stats.frame_index.std }
                          ]}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#f59e42" />
                          </BarChart>
                        </ResponsiveContainer>
                        <div className="text-xs mt-2 text-gray-500">Min: {v3Stats.frame_index.min}, Max: {v3Stats.frame_index.max}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Gráficos de medias y std para observation.state y action */}
              <div className="mt-10">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Estadísticas globales de observaciones y acciones</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Medias y desviaciones estándar por dimensión para observation.state y action.</p>
                <div className="flex flex-col gap-8 w-full">
                  {/* observation.state (media) */}
                  {v3Stats.observation?.state?.mean && Array.isArray(v3Stats.observation.state.mean) && v3Stats.observation.state.mean.length > 0 && (
                    <div className="flex-1 flex flex-col h-full min-h-[240px]">
                      <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-200">Observation State (media)</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={v3Stats.observation.state.mean.map((v: number, i: number) => ({ name: `S${i + 1}`, value: v }))}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {/* observation.state (std) */}
                  {v3Stats.observation?.state?.std && Array.isArray(v3Stats.observation.state.std) && v3Stats.observation.state.std.length > 0 && (
                    <div className="flex-1 flex flex-col h-full min-h-[240px]">
                      <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-200">Observation State (std)</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={v3Stats.observation.state.std.map((v: number, i: number) => ({ name: `S${i + 1}`, value: v }))}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#f43f5e" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {/* action (media) */}
                  {v3Stats.action?.mean && Array.isArray(v3Stats.action.mean) && v3Stats.action.mean.length > 0 && (
                    <div className="flex-1 flex flex-col h-full min-h-[240px]">
                      <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-200">Action (media)</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={v3Stats.action.mean.map((v: number, i: number) => ({ name: `A${i + 1}`, value: v }))}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#0ea5e9" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {/* action (std) */}
                  {v3Stats.action?.std && Array.isArray(v3Stats.action.std) && v3Stats.action.std.length > 0 && (
                    <div className="flex-1 flex flex-col h-full min-h-[240px]">
                      <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-200">Action (std)</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={v3Stats.action.std.map((v: number, i: number) => ({ name: `A${i + 1}`, value: v }))}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#ef4444" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </>
      )}
      {/* --- Eliminar bloque de 'Visualización' de campos simples --- */}
      {/* Mostrar los gráficos útiles, o un mensaje si no hay ninguno */}
      {bucketData.length > 0 && !loadingLengths && !errorLengths && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Distribución de longitudes de episodios</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Este histograma muestra cuántos episodios tienen una longitud (en frames) dentro de cada intervalo de {bucketSize} frames.</p>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bucketData} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="intervalo" angle={-45} textAnchor="end" interval={0} height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {rewardBuckets.length > 0 && !loadingRewards && !errorRewards && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Distribución de recompensas por paso</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Este histograma muestra la distribución de las recompensas obtenidas en cada paso del dataset.</p>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rewardBuckets} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="intervalo" angle={-45} textAnchor="end" interval={0} height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value: any, name: any, props: any) => [`${value} pasos`, 'Cantidad']} labelFormatter={(label) => `Recompensa ${label}`} />
                <Bar dataKey="cantidad" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {meanRewards.length > 0 && !loadingMeanRewards && !errorMeanRewards && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Recompensa promedio por episodio</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Esta serie muestra cómo cambia la recompensa promedio a lo largo de los episodios.</p>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={meanRewards} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="episode" />
                <YAxis allowDecimals={true} />
                <Tooltip formatter={(value: any) => [`${value.toFixed(3)}`, 'Recompensa media']} labelFormatter={(label) => `Episodio ${label}`} />
                <Bar dataKey="meanReward" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {magnitudeBuckets.length > 0 && !loadingMagnitudes && !errorMagnitudes && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Distribución de magnitudes de acción</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Este histograma muestra cuán grandes son, en promedio, los pasos de control (magnitud de la acción).</p>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={magnitudeBuckets} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="intervalo" angle={-45} textAnchor="end" interval={0} height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value: any, name: any, props: any) => [`${value} pasos`, 'Cantidad']} labelFormatter={(label) => `Magnitud ${label}`} />
                <Bar dataKey="cantidad" fill="#f59e42" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {taskCounts.length > 0 && !loadingTasks && !errorTasks && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Número de episodios por tarea</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Este gráfico muestra cuántos episodios hay para cada descripción de tarea (top 10).</p>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskCounts} layout="vertical" margin={{ top: 20, right: 30, left: 140, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="task" type="category" width={140} tick={<TaskTick />} />
                <Tooltip formatter={(value: any, name: any, props: any) => [`${value} episodios`, 'Cantidad']} labelFormatter={(label) => `${label}`} />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {/* --- 1. Dispersión longitud vs recompensa media --- */}
      {lengthVsReward.length > 0 && !loadingLengthVsReward && !errorLengthVsReward && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Longitud vs. recompensa media por episodio</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Cada punto representa un episodio. El eje X es la longitud (frames) y el eje Y la recompensa media.</p>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <XAxis dataKey="length" name="Longitud (frames)" />
                <YAxis dataKey="meanReward" name="Recompensa media" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v: any, n: any) => [v, n === 'length' ? 'Longitud' : 'Recompensa media']} />
                <Scatter data={lengthVsReward} fill="#0ea5e9" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {/* --- 2. Recompensa total por episodio --- */}
      {totalRewardPerEpisode.length > 0 && !loadingTotalReward && !errorTotalReward && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Recompensa acumulada por episodio</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">La recompensa total estimada para cada episodio (recompensa media × longitud).</p>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={totalRewardPerEpisode} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
                <XAxis dataKey="episode" />
                <YAxis />
                <Tooltip formatter={(v: any) => [v, 'Recompensa total']} labelFormatter={(l) => `Episodio ${l}`} />
                <Line type="monotone" dataKey="totalReward" stroke="#f43f5e" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {/* --- 3. Histograma de deltas de tiempo --- */}
      {deltaBuckets.length > 0 && !loadingDeltas && !errorDeltas && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Distribución de Δt entre frames</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Histograma de las diferencias de tiempo entre frames consecutivos.</p>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deltaBuckets} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="intervalo" angle={-45} textAnchor="end" interval={0} height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(v: any) => [v, 'Cantidad']} labelFormatter={(l) => `Δt ${l} s`} />
                <Bar dataKey="cantidad" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {/* --- 4. Radar de posición articular media --- */}
      {meanJoints.length > 0 && !loadingJoints && !errorJoints && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Valores promedio de articulaciones</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Radar de los valores medios de cada articulación del robot.</p>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={meanJoints} outerRadius="80%">
                <PolarGrid />
                <PolarAngleAxis dataKey="joint" />
                <PolarRadiusAxis />
                <Radar name="Valor medio" dataKey="mean" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {/* --- 5. Histograma de episodios por número de tareas --- */}
      {tasksPerEpisode.length > 0 && !loadingTasksPerEpisode && !errorTasksPerEpisode && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Número de episodios según cantidad de tareas</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Histograma del número de tareas que tiene cada episodio.</p>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasksPerEpisode} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="bucket" type="category" width={120} />
                <Tooltip formatter={(v: any) => [v, 'Episodios']} labelFormatter={(l) => `${l}`} />
                <Bar dataKey="count" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {!hasAnyChart && (
        <div className="text-center py-12 text-gray-500 text-lg font-medium">
          No se encontraron diagramas para representar en este dataset.
        </div>
      )}
    </div>
  );
} 