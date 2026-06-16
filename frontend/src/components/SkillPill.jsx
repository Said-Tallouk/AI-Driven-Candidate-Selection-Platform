const STYLES = {
  found:   'bg-violet-50 text-violet-700 border-violet-200',
  missing: 'bg-amber-50  text-amber-700  border-amber-200',
  bonus:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  neutral: 'bg-gray-100  text-gray-600   border-gray-200',
}

export default function SkillPill({ label, type = 'neutral' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold
                      border font-mono ${STYLES[type]}`}>
      {type === 'missing' && <span>+</span>}
      {label}
    </span>
  )
}
