const ACCENT = {
  purple: 'from-violet-600 to-indigo-600',
  green:  'from-emerald-500 to-green-600',
  red:    'from-red-500 to-rose-600',
  orange: 'from-amber-500 to-orange-500',
}

export default function KpiCard({ icon, value, label, sub, color = 'purple' }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative overflow-hidden">
      {/* gradient top bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${ACCENT[color]}`} />

      <div className="text-2xl mb-3">{icon}</div>
      <div className="text-3xl font-black text-gray-900 font-mono leading-none tracking-tight">
        {value}
      </div>
      <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-2">
        {label}
      </div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}
