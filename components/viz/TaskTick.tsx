// Componente para renderizar ticks personalizados en el eje Y de Recharts
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

export default TaskTick; 