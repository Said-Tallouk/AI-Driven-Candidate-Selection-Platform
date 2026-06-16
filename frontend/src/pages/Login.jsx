import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { parseApiError } from '../api/parseError'

const FEATURES = [
  { icon: '🧠', title: 'AI Extraction',   desc: 'Llama 3.3 automatically analyzes each CV' },
  { icon: '⚡', title: 'Fast Matching',   desc: 'Compatibility score computed in seconds' },
  { icon: '📊', title: 'Live Dashboard',  desc: 'Real-time rankings and visualizations' },
]

export default function Login() {
  const [username, setUsername]   = useState('')
  const [password, setPassword]   = useState('')
  const [showPwd, setShowPwd]     = useState(false)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch (err) {
      setError(parseApiError(err, 'Identifiants incorrects.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT — Branding ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] px-14 py-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #1a0f4f 0%, #2e1a6e 45%, #4c1d95 100%)' }}
      >
        {/* Background rings */}
        <div
          className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full opacity-10"
          style={{ border: '80px solid #7c3aed' }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-[340px] h-[340px] rounded-full opacity-10"
          style={{ border: '60px solid #a78bfa' }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                boxShadow: '0 6px 20px rgba(124,58,237,0.5)',
              }}
            >🎯</div>
            <span className="text-white font-extrabold text-xl tracking-tight">
              Skills<span className="text-violet-300">Matcher</span> Pro
            </span>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10">
          <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight mb-6">
            Recruit<br />
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa, #60a5fa)' }}
            >smarter.</span>
          </h1>
          <p className="text-white/50 text-lg leading-relaxed max-w-sm">
            AI analyzes your CVs, extracts skills, and automatically identifies the best profiles.
          </p>

          {/* Feature list */}
          <div className="mt-10 space-y-4">
            {FEATURES.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-4 p-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}
              >
                <span className="text-2xl flex-shrink-0">{icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-white/45 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-white/20 text-xs tracking-wide">
          Said Tallouk · PFE Big Data & NLP · 2024
        </p>
      </div>

      {/* ── RIGHT — Form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-[400px] animate-fade-up">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <span className="text-2xl">🎯</span>
            <span className="font-extrabold text-gray-900">
              Skills<span className="text-violet-600">Matcher</span> Pro
            </span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 p-10 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Sign In
              </h2>
              <p className="text-gray-400 text-sm mt-1.5">
                Access reserved for HR managers
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label className="field-label">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  autoFocus
                  className="field-input"
                />
              </div>

              {/* Password */}
              <div>
                <label className="field-label">Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="field-input pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300
                               hover:text-gray-500 transition-colors"
                  >
                    {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="alert-err">
                  <span className="text-red-400 text-base flex-shrink-0">⚠</span>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-sm mt-2"
              >
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                  : 'Sign in →'
                }
              </button>
            </form>

            {/* Lien accueil */}
            <div className="mt-4 text-center">
              <a href="/" className="text-xs text-violet-500 hover:underline">
                ← Back to home page
              </a>
            </div>

            {/* Demo credentials */}
            <div
              className="mt-7 p-4 rounded-2xl text-center"
              style={{ background: '#f8f6ff', border: '1px solid #ede9fe' }}
            >
              <p className="text-xs text-gray-400 mb-1.5 font-medium">Demo account</p>
              <div className="flex items-center justify-center gap-3">
                <code className="text-xs bg-white border border-violet-200 text-violet-700
                                 px-2.5 py-1 rounded-lg font-mono font-semibold">
                  admin
                </code>
                <span className="text-gray-300 text-xs">/</span>
                <code className="text-xs bg-white border border-violet-200 text-violet-700
                                 px-2.5 py-1 rounded-lg font-mono font-semibold">
                  rh2024
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
