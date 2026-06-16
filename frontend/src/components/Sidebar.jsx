import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, Users, BarChart3, LogOut, Zap, Globe } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/offer',        icon: FileText,        label: 'Create Offer'  },
  { to: '/applications', icon: Users,           label: 'Applications'  },
  { to: '/results',      icon: BarChart3,       label: 'Results'       },
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  return (
    <aside
      className="w-[220px] flex-shrink-0 flex flex-col h-screen gradient-sidebar"
      style={{ boxShadow: '4px 0 30px rgba(0,0,0,0.25)' }}
    >
      {/* ── Logo ── */}
      <div className="px-5 py-6">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              boxShadow: '0 4px 12px rgba(124,58,237,0.6)',
            }}
          >
            🎯
          </div>
          <div>
            <p className="text-white font-extrabold text-sm leading-none tracking-tight">
              Skills<span className="text-violet-300">Matcher</span>
            </p>
            <p className="text-white/30 text-[10px] mt-0.5 tracking-wider uppercase">Pro v2.0</p>
          </div>
        </div>
      </div>

      <div className="mx-4 border-t border-white/8" />

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 pt-4 space-y-0.5">
        <p className="px-3 pb-2 text-[10px] font-bold text-white/25 uppercase tracking-[0.12em]">
          Menu
        </p>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium
               transition-all duration-150 group
               ${isActive
                 ? 'bg-white/15 text-white shadow-sm'
                 : 'text-white/45 hover:bg-white/8 hover:text-white/80'}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={16}
                  className={`flex-shrink-0 transition-colors ${
                    isActive ? 'text-violet-300' : 'text-white/40 group-hover:text-white/70'
                  }`}
                />
                {label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Lien page publique ── */}
      <div className="px-3 pb-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-medium
                     text-white/50 hover:bg-white/8 hover:text-white/80 transition-all duration-150 group"
        >
          <Globe size={15} className="text-white/35 group-hover:text-violet-300 transition-colors flex-shrink-0" />
          View Candidate Page
          <span className="ml-auto text-[9px] text-white/25 bg-white/8 px-1.5 py-0.5 rounded">↗</span>
        </a>
      </div>

      {/* ── Status card ── */}
      <div className="mx-3 mb-3">
        <div
          className="rounded-xl p-3"
          style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Zap size={12} className="text-violet-400" />
            <span className="text-[10px] font-bold text-violet-300 uppercase tracking-wider">
              System Active
            </span>
          </div>
          <p className="text-[11px] text-white/50 leading-relaxed">
            Groq Llama 3.3 · FastAPI
          </p>
        </div>
      </div>

      <div className="mx-4 border-t border-white/8" />

      {/* ── User + logout ── */}
      <div className="px-3 py-4 space-y-1">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white/80 text-xs font-semibold truncate">{user?.username}</p>
            <p className="text-white/30 text-[10px]">HR Manager</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px]
                     font-medium text-red-300/60 hover:bg-red-400/10 hover:text-red-300
                     transition-all duration-150"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </aside>
  )
}
