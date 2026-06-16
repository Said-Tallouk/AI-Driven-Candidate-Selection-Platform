import { PieChart, Pie, Cell } from 'recharts'

function scoreColor(rate) {
  if (rate >= 70) return '#10b981'
  if (rate >= 40) return '#f59e0b'
  return '#ef4444'
}

export default function DonutChart({ rate, size = 110 }) {
  const color = scoreColor(rate)
  const data  = [{ value: rate }, { value: 100 - rate }]
  const r     = size / 2
  const inner = r * 0.62
  const outer = r * 0.85

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie
          data={data}
          cx={r - 2}
          cy={r - 2}
          innerRadius={inner}
          outerRadius={outer}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          strokeWidth={0}
        >
          <Cell fill={color} />
          <Cell fill="#f3f4f6" />
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black font-mono leading-none" style={{ color }}>
          {Math.round(rate)}
        </span>
        <span className="text-xs text-gray-400 font-semibold">%</span>
      </div>
    </div>
  )
}
