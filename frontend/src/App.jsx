import { Component } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Sidebar       from './components/Sidebar'
import Login         from './pages/Login'
import Dashboard     from './pages/Dashboard'
import CreateOffer   from './pages/CreateOffer'
import Applications  from './pages/Applications'
import Results       from './pages/Results'
import PublicOffers  from './pages/PublicOffers'
import Apply         from './pages/Apply'

/* ── Error boundary ── */
class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(err) { return { error: err } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '40px', fontFamily: 'monospace', background: '#fff1f2', minHeight: '100vh', color: '#b91c1c' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>⚠ Erreur React</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px' }}>{this.state.error.toString()}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

/* ── Layout RH avec sidebar ── */
function RHLayout() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8 min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

/* ── Login guard ── */
function LoginPage() {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />
  return <Login />
}

/* ── Routes ── */
export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* ── Pages publiques (toujours accessibles) ── */}
        <Route path="/"                    element={<PublicOffers />} />
        <Route path="/offres"              element={<PublicOffers />} />
        <Route path="/offres/:id/postuler" element={<Apply />} />

        {/* ── Login ── */}
        <Route path="/login" element={<LoginPage />} />

        {/* ── Espace RH (protégé) ── */}
        <Route element={<RHLayout />}>
          <Route path="/dashboard"    element={<Dashboard />} />
          <Route path="/offer"        element={<CreateOffer />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/results"      element={<Results />} />
        </Route>

        {/* ── Catch-all → accueil ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}
