import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Mail, FileText, Loader2, Play,
  CheckCircle2, AlertCircle, Clock, RefreshCw, Download, Zap,
} from 'lucide-react'
import api from '../api/client'
import { parseApiError } from '../api/parseError'

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function getInitials(name) {
  return name.split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase()
}

const COLORS = ['#7c3aed','#4f46e5','#0891b2','#059669','#d97706','#dc2626','#0284c7']
function avatarColor(name) {
  let h = 0
  for (const c of name) h = (h << 5) - h + c.charCodeAt(0)
  return COLORS[Math.abs(h) % COLORS.length]
}

export default function Applications() {
  const navigate = useNavigate()
  const [offers, setOffers]           = useState([])
  const [offerId, setOfferId]         = useState('')
  const [applications, setApplications] = useState([])
  const [loadingApps, setLoadingApps] = useState(false)
  const [analyzing, setAnalyzing]     = useState(false)
  const [analyzingId, setAnalyzingId] = useState(null)
  const [analyzedIds, setAnalyzedIds] = useState({})
  const [done, setDone]               = useState(false)
  const [error, setError]             = useState('')

  useEffect(() => {
    api.get('/offers').then(r => {
      const published = r.data.filter(o => o.published)
      setOffers(r.data)
      if (published.length) setOfferId(published[0].id)
      else if (r.data.length) setOfferId(r.data[0].id)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!offerId) return
    setLoadingApps(true)
    setDone(false)
    api.get(`/offers/${offerId}/applications`)
      .then(r => setApplications(r.data))
      .catch(() => setApplications([]))
      .finally(() => setLoadingApps(false))
  }, [offerId])

  const handleAnalyze = async () => {
    setAnalyzing(true); setError(''); setDone(false)
    try {
      await api.post(`/offers/${offerId}/analyze-applications`)
      setDone(true)
      setTimeout(() => navigate('/results'), 1500)
    } catch (err) {
      setError(parseApiError(err, 'Erreur lors de l\'analyse.'))
    } finally {
      setAnalyzing(false)
    }
  }

  const handleAnalyzeSingle = async (appId) => {
    setAnalyzingId(appId); setError('')
    try {
      await api.post(`/offers/${offerId}/applications/${appId}/analyze`)
      setAnalyzedIds(prev => ({ ...prev, [appId]: true }))
    } catch (err) {
      setError(parseApiError(err, 'Erreur lors de l\'analyse.'))
    } finally {
      setAnalyzingId(null)
    }
  }

  const offer = offers.find(o => o.id === offerId)

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Received Applications</h1>
          <p className="page-sub">Review applications submitted by candidates.</p>
        </div>
        <button
          onClick={() => { setLoadingApps(true); api.get(`/offers/${offerId}/applications`).then(r => setApplications(r.data)).finally(() => setLoadingApps(false)) }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-xs
                     font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* ── Offer selector ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Offre d'emploi
        </label>
        {offers.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50
                          border border-amber-200 rounded-xl px-4 py-3">
            <AlertCircle size={15} />
            No offers available.{' '}
            <button onClick={() => navigate('/offer')} className="font-bold underline">
              Create one →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {offers.map(o => (
              <button
                key={o.id}
                onClick={() => setOfferId(o.id)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                  offerId === o.id
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-100 hover:border-violet-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-bold ${offerId === o.id ? 'text-violet-700' : 'text-gray-800'}`}>
                      {o.title}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{o.level} · {o.experience} an(s)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      o.published
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-gray-50 text-gray-400 border-gray-200'
                    }`}>
                      {o.published ? 'Published' : 'Unpublished'}
                    </span>
                    {offerId === o.id && (
                      <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Applications list + action ── */}
      {offerId && (
        <div className="grid grid-cols-3 gap-5">
          {/* Applications list */}
          <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-violet-500" />
                <p className="font-bold text-gray-800 text-sm">
                  Candidats
                </p>
                {!loadingApps && (
                  <span className="text-[11px] font-bold text-violet-600 bg-violet-50
                                   border border-violet-200 px-2 py-0.5 rounded-full">
                    {applications.length}
                  </span>
                )}
              </div>
            </div>

            {loadingApps ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 size={24} className="animate-spin text-violet-400" />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-4xl mb-3">📭</div>
                <p className="font-semibold text-sm">No applications yet</p>
                <p className="text-xs mt-1">
                  {offer?.published
                    ? 'Share the offer link with candidates.'
                    : 'Publish the offer to receive applications.'}
                </p>
                {!offer?.published && (
                  <button
                    onClick={() => navigate('/offer')}
                    className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-xl text-xs
                               font-bold hover:bg-violet-700 transition-colors"
                  >
                    Manage offers →
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {applications.map((app, i) => (
                  <div key={app.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white
                                    text-xs font-black flex-shrink-0"
                      style={{ background: avatarColor(app.candidate_name) }}>
                      {getInitials(app.candidate_name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {app.candidate_name}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-[11px] text-gray-400">
                          <Mail size={10} /> {app.candidate_email}
                        </span>
                      </div>
                    </div>

                    {/* File + date + download + analyze solo */}
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className="flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50
                                       border border-gray-200 px-2 py-0.5 rounded-lg">
                        <FileText size={10} /> {app.filename}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Clock size={9} /> {formatDate(app.submitted_at)}
                      </span>
                      <a
                        href={`/api/offers/${offerId}/applications/${app.id}/cv`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] font-semibold text-violet-600
                                   hover:text-violet-800 transition-colors"
                      >
                        <Download size={10} /> Télécharger CV
                      </a>
                      {/* Bouton analyser ce CV seul */}
                      {analyzedIds[app.id] ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600
                                         bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                          <CheckCircle2 size={10} /> Analysé
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAnalyzeSingle(app.id)}
                          disabled={analyzingId === app.id}
                          className="flex items-center gap-1 text-[10px] font-bold text-violet-600
                                     bg-violet-50 border border-violet-200 px-2 py-1 rounded-lg
                                     hover:bg-violet-100 transition-colors disabled:opacity-50"
                        >
                          {analyzingId === app.id
                            ? <><Loader2 size={10} className="animate-spin" /> Analyse...</>
                            : <><Zap size={10} /> Analyser seul</>
                          }
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action panel */}
          <div className="space-y-4">
            {/* Stats */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Summary</p>
              {[
                { label: 'Applications',  val: applications.length, color: 'text-violet-700' },
                { label: 'Offer',         val: offer?.published ? 'Published' : 'Unpublished', color: offer?.published ? 'text-emerald-600' : 'text-gray-400' },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className={`text-xs font-bold ${color}`}>{val}</span>
                </div>
              ))}
            </div>

            {/* Lien public */}
            {offer?.published && (
              <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500 mb-2">
                  Candidate Link
                </p>
                <p className="text-[11px] text-violet-700 break-all font-mono bg-white
                               border border-violet-200 rounded-lg px-2 py-1.5">
                  /offres/{offerId}/postuler
                </p>
              </div>
            )}

            {/* Analyze button */}
            {done ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="font-bold text-emerald-700 text-sm">Analysis complete!</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Redirecting...</p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleAnalyze}
                disabled={analyzing || applications.length === 0}
                className="w-full py-4 rounded-2xl font-bold text-sm text-white
                           disabled:opacity-40 flex items-center justify-center gap-2
                           transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
              >
                {analyzing
                  ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
                  : <><Play size={15} /> Launch AI Analysis</>
                }
              </button>
            )}

            {error && (
              <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-100
                              rounded-xl text-xs text-red-600">
                <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <p className="text-[10px] text-gray-400 text-center leading-relaxed">
              AI analysis ranks candidates by compatibility score with the offer.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
