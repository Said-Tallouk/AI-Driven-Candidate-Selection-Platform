import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from 'recharts'
import {
  ArrowRight, TrendingUp, Users, CheckCircle, XCircle,
  Loader2, FileText, BarChart3,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

/* ── KPI card ─────────────────────────────────────────────── */
const KPI_DEFS = (s) => [
  {
    icon: TrendingUp, value: s?.total_offers ?? 0, label: 'Active Offers',
    bar: 'from-violet-500 to-indigo-500', color: '#7c3aed', delay: 'anim-delay-1',
  },
  {
    icon: Users, value: s?.total_cvs ?? 0, label: 'CVs Analyzed',
    bar: 'from-sky-500 to-blue-500', color: '#0ea5e9', delay: 'anim-delay-2',
  },
  {
    icon: CheckCircle, value: s?.accepted ?? 0, label: 'Compatible',
    bar: 'from-emerald-500 to-green-400', color: '#10b981', delay: 'anim-delay-3',
  },
  {
    icon: XCircle, value: s?.rejected ?? 0, label: 'Not Compatible',
    bar: 'from-rose-500 to-red-400', color: '#f43f5e', delay: 'anim-delay-4',
  },
]

function KpiCard({ icon: Icon, value, label, bar, color, delay }) {
  const iconBg  = `${color}18`
  const circleBg = `${color}0a`
  return (
    <div
      className={`relative bg-white rounded-2xl overflow-hidden p-6 animate-fade-up ${delay}`}
      style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
    >
      {/* accent stripe */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${bar}`} />

      {/* decorative circle */}
      <div
        className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: circleBg }}
      />

      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
        style={{ background: iconBg }}
      >
        <Icon size={20} style={{ color }} strokeWidth={2} />
      </div>

      <div className="text-3xl font-black text-gray-900 font-mono-num leading-none tracking-tight">
        {value}
      </div>
      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-2">
        {label}
      </div>
    </div>
  )
}

/* ── Donut center label ───────────────────────────────────── */
function CenterLabel({ viewBox, rate }) {
  const { cx, cy } = viewBox
  return (
    <g>
      <text
        x={cx} y={cy - 7}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="26" fontWeight="900" fill="#111827"
        fontFamily="'JetBrains Mono', monospace"
      >
        {rate}%
      </text>
      <text
        x={cx} y={cy + 14}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="10" fontWeight="700" fill="#9ca3af"
        fontFamily="'Inter', sans-serif" letterSpacing="0.06em"
      >
        ACCEPTED
      </text>
    </g>
  )
}

/* ── Recharts custom tooltip ─────────────────────────────── */
const CustomTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 shadow-xl rounded-xl px-4 py-2.5 text-sm">
      <span className="font-semibold text-gray-600">{payload[0].name}</span>
      <span className="ml-3 font-black text-gray-900 font-mono-num">{payload[0].value}</span>
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard')
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-violet-500">
      <Loader2 size={28} className="animate-spin" />
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Loading…</p>
    </div>
  )

  const donutData = [
    { name: 'Compatible',     value: stats?.accepted || 0, color: '#10b981' },
    { name: 'Not Compatible', value: stats?.rejected  || 0, color: '#f43f5e' },
  ]
  const accRate = stats?.total_cvs
    ? Math.round((stats.accepted / stats.total_cvs) * 100)
    : 0

  const MEDALS = ['🥇', '🥈', '🥉']

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between animate-fade-up">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">
            Welcome back,{' '}
            <span className="font-semibold text-gray-700">{user?.username}</span>
            {' '}— here is your recruitment overview.
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-bold text-emerald-700 mt-1"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          System Online
        </div>
      </div>

      {/* ── KPIs ───────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-5">
        {KPI_DEFS(stats).map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      {/* ── Main grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-6 animate-fade-up anim-delay-2">

        {/* Donut chart */}
        <div className="col-span-2 card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="font-bold text-gray-900 text-sm">Acceptance Rate</p>
              <p className="text-xs text-gray-400 mt-0.5">Compatibility threshold: 60 %</p>
            </div>
            <div
              className="text-right px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.12)' }}
            >
              <p className="text-xl font-black text-gray-900 font-mono-num leading-none">{accRate}%</p>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">rate</p>
            </div>
          </div>

          {stats?.total_cvs > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%" cy="50%"
                    innerRadius={62} outerRadius={82}
                    startAngle={90} endAngle={-270}
                    dataKey="value"
                    strokeWidth={4} stroke="#f8fafc"
                    paddingAngle={3}
                  >
                    {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    <Label content={<CenterLabel rate={accRate} />} position="center" />
                  </Pie>
                  <Tooltip content={<CustomTip />} />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2.5 mt-2">
                {donutData.map(d => {
                  const pct = stats.total_cvs
                    ? Math.round((d.value / stats.total_cvs) * 100)
                    : 0
                  return (
                    <div key={d.name} className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-xs text-gray-500 flex-1">{d.name}</span>
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: d.color }}
                        />
                      </div>
                      <span className="text-xs font-bold font-mono-num text-gray-700 w-5 text-right">
                        {d.value}
                      </span>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-gray-300">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(124,58,237,0.06)' }}
              >
                <Users size={28} className="text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-400">No data available</p>
              <p className="text-xs text-gray-300 mt-1">Analyze CVs to see statistics</p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="col-span-3 flex flex-col gap-5">

          {/* Top candidates */}
          <div className="card p-6 flex-1">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-base">🏆</span>
                <p className="font-bold text-gray-900 text-sm">Top Candidates</p>
              </div>
              {stats?.top_candidates?.length > 0 && (
                <button
                  onClick={() => navigate('/results')}
                  className="flex items-center gap-1 text-xs text-violet-600 font-semibold hover:text-violet-700 transition-colors"
                >
                  View all <ArrowRight size={12} />
                </button>
              )}
            </div>

            {stats?.top_candidates?.length > 0 ? (
              <div className="space-y-2">
                {stats.top_candidates.map((cv, i) => {
                  const r   = cv.match_rate
                  const col = r >= 70 ? '#10b981' : r >= 40 ? '#f59e0b' : '#f43f5e'
                  const bg  = r >= 70 ? 'rgba(16,185,129,0.08)' : r >= 40 ? 'rgba(245,158,11,0.08)' : 'rgba(244,63,94,0.08)'
                  return (
                    <div
                      key={cv.name}
                      className="flex items-center gap-3.5 px-4 py-3 rounded-xl cursor-default transition-colors duration-150 hover:bg-violet-50/60"
                      style={{ background: 'rgba(248,250,252,0.8)' }}
                    >
                      {/* rank */}
                      <div className="w-7 flex items-center justify-center flex-shrink-0">
                        {i < 3
                          ? <span className="text-base leading-none">{MEDALS[i]}</span>
                          : (
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="text-[11px] font-bold text-gray-400">{i + 1}</span>
                            </div>
                          )
                        }
                      </div>

                      {/* name + skills */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{cv.name}</p>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {cv.match?.matched?.slice(0, 4).join(' · ') || 'No skills matched'}
                        </p>
                      </div>

                      {/* bar + badge */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${r}%`, background: col }}
                          />
                        </div>
                        <span
                          className="text-xs font-black font-mono-num px-2.5 py-0.5 rounded-lg min-w-[46px] text-center"
                          style={{ color: col, background: bg }}
                        >
                          {r.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <Users size={26} className="text-gray-200" />
                <p className="text-sm font-medium text-gray-400">No candidates yet</p>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="card p-6">
            <p className="section-label">Quick Actions</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: 'Create Offer', path: '/offer', icon: FileText,
                  color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', desc: 'Define position',
                },
                {
                  label: 'Applications', path: '/applications', icon: Users,
                  color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)', desc: 'View candidates',
                },
                {
                  label: 'View Results', path: '/results', icon: BarChart3,
                  color: '#10b981', bg: 'rgba(16,185,129,0.08)', desc: 'AI Ranking',
                },
              ].map(({ label, path, icon: Icon, color, bg, desc }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-gray-100
                             transition-all duration-150 group text-center hover:border-violet-200 hover:shadow-sm"
                  style={{ background: 'rgba(249,250,251,1)' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center
                               group-hover:scale-110 transition-transform duration-150"
                    style={{ background: bg }}
                  >
                    <Icon size={18} style={{ color }} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700">{label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Active offer banner ─────────────────────────────── */}
      {stats?.active_offer && (
        <div
          className="rounded-2xl p-5 flex items-center gap-5 animate-fade-up"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(79,70,229,0.03))',
            border: '1px solid rgba(124,58,237,0.12)',
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
            }}
          >
            <FileText size={20} className="text-white" strokeWidth={2} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-bold text-gray-900">{stats.active_offer.title}</p>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed' }}
              >
                Active
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {stats.active_offer.level}
              {' · '}
              {stats.active_offer.experience} yr(s) exp.
              {' · '}
              {stats.active_offer.skills?.length || 0} required skill(s)
            </p>
          </div>

          <button
            onClick={() => navigate('/offer')}
            className="flex items-center gap-1.5 text-xs font-bold text-violet-600
                       hover:text-violet-700 transition-colors flex-shrink-0 px-4 py-2
                       rounded-xl hover:bg-violet-50"
          >
            Edit offer <ArrowRight size={13} />
          </button>
        </div>
      )}
    </div>
  )
}
