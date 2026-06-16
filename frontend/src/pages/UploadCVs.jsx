import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { X, FileText, UploadCloud, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import api from '../api/client'
import { parseApiError } from '../api/parseError'

function FileItem({ file, onRemove }) {
  const kb = (file.size / 1024).toFixed(0)
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm group">
      <div className="w-9 h-9 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center flex-shrink-0">
        <FileText size={16} className="text-violet-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
        <p className="text-xs text-gray-400">{kb} KB · PDF</p>
      </div>
      <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-md font-bold flex-shrink-0">
        Prêt
      </span>
      <button
        onClick={() => onRemove(file.name)}
        className="text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 ml-1"
      >
        <X size={15} />
      </button>
    </div>
  )
}

export default function UploadCVs() {
  const navigate          = useNavigate()
  const [offers, setOffers]     = useState([])
  const [offerId, setOfferId]   = useState('')
  const [files, setFiles]       = useState([])
  const [loading, setLoading]   = useState(false)
  const [progress, setProgress] = useState(0)
  const [done, setDone]         = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    api.get('/offers').then(r => {
      setOffers(r.data)
      if (r.data.length > 0) setOfferId(r.data[0].id)
    }).catch(() => {})
  }, [])

  const onDrop = useCallback((accepted) => {
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name))
      return [...prev, ...accepted.filter(f => !names.has(f.name))]
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    onDrop,
  })

  const removeFile = name => setFiles(prev => prev.filter(f => f.name !== name))

  const handleAnalyze = async () => {
    if (!offerId || files.length === 0) return
    setLoading(true); setProgress(5); setError(''); setDone(false)

    const form = new FormData()
    files.forEach(f => form.append('files', f))
    // La clé API est lue automatiquement depuis .env côté backend

    const interval = setInterval(() =>
      setProgress(p => p < 88 ? p + (Math.random() * 6) : p), 600)

    try {
      // Ne pas forcer Content-Type — Axios l'ajoute automatiquement avec le bon boundary
      await api.post(`/analysis/${offerId}`, form)
      clearInterval(interval)
      setProgress(100)
      setDone(true)
      setTimeout(() => navigate('/results'), 1500)
    } catch (err) {
      clearInterval(interval)
      setError(parseApiError(err, 'Erreur lors de l\'analyse IA.'))
    } finally {
      setLoading(false)
    }
  }

  const offer      = offers.find(o => o.id === offerId)
  const canLaunch  = offerId && files.length > 0 && !loading && !done

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ── Header ── */}
      <div>
        <h1 className="page-title">Upload & Analyse IA</h1>
        <p className="page-sub">GPT-4o-mini extrait automatiquement les compétences, l'expérience et la formation.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* ── Left: upload zone + file list ── */}
        <div className="col-span-2 space-y-5">

          {/* Offer selector — cartes cliquables */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="field-label mb-0">Choisir une offre d'emploi</label>
              <button
                onClick={() => navigate('/offer')}
                className="text-[11px] font-semibold text-violet-600 hover:text-violet-700
                           flex items-center gap-1 transition-colors"
              >
                + Nouvelle offre
              </button>
            </div>

            {offers.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 mt-1">
                {offers.map(o => {
                  const selected = offerId === o.id
                  return (
                    <button
                      key={o.id}
                      onClick={() => setOfferId(o.id)}
                      className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-150
                        ${selected
                          ? 'border-violet-500 bg-violet-50 shadow-sm'
                          : 'border-gray-100 bg-white hover:border-violet-200 hover:bg-gray-50'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${selected ? 'bg-violet-500' : 'bg-gray-300'}`} />
                            <p className={`text-sm font-bold truncate ${selected ? 'text-violet-700' : 'text-gray-800'}`}>
                              {o.title}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2 ml-4">
                            <span className="pill-neutral" style={{ fontSize: '10px', padding: '2px 8px' }}>
                              {o.level}
                            </span>
                            <span className="pill-neutral" style={{ fontSize: '10px', padding: '2px 8px' }}>
                              {o.experience} an(s)
                            </span>
                            {o.skills?.slice(0, 3).map(s => (
                              <span key={s} className="pill-found" style={{ fontSize: '10px', padding: '2px 8px' }}>
                                {s}
                              </span>
                            ))}
                            {o.skills?.length > 3 && (
                              <span className="text-[10px] text-gray-400 self-center">
                                +{o.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                        {selected && (
                          <CheckCircle2 size={18} className="text-violet-500 flex-shrink-0 mt-0.5" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="alert-warn mt-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>
                  Aucune offre disponible.{' '}
                  <button onClick={() => navigate('/offer')} className="font-bold underline">
                    Créez-en une →
                  </button>
                </span>
              </div>
            )}
          </div>

          {/* Dropzone */}
          <div className="card p-6">
            <label className="field-label">CVs des candidats (PDF)</label>
            <div
              {...getRootProps()}
              className={`mt-3 border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer
                         ${isDragActive
                           ? 'border-violet-400 bg-violet-50/80 scale-[1.01]'
                           : 'border-gray-200 bg-gray-50/50 hover:border-violet-300 hover:bg-violet-50/40'}`}
              style={{ padding: '40px 24px' }}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all
                             ${isDragActive ? 'scale-110' : ''}`}
                  style={{
                    background: isDragActive
                      ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                      : 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
                  }}
                >
                  <UploadCloud size={26} className={isDragActive ? 'text-white' : 'text-violet-500'} />
                </div>
                <p className="font-bold text-gray-700 mb-1">
                  {isDragActive ? 'Relâchez pour ajouter' : 'Glissez vos CV ici'}
                </p>
                <p className="text-sm text-gray-400">
                  ou{' '}
                  <span className="text-violet-600 font-semibold cursor-pointer hover:underline">
                    parcourir vos fichiers
                  </span>
                </p>
                <p className="text-xs text-gray-300 mt-3">
                  Format PDF uniquement · Sélection multiple supportée
                </p>
              </div>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                  {files.length} fichier{files.length > 1 ? 's' : ''} sélectionné{files.length > 1 ? 's' : ''}
                </p>
                {files.map(f => (
                  <FileItem key={f.name} file={f} onRemove={removeFile} />
                ))}
              </div>
            )}
          </div>

          {/* Progress */}
          {loading && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Loader2 size={15} className="animate-spin text-violet-500" />
                  Analyse IA en cours...
                </span>
                <span className="text-sm font-black font-mono-num text-violet-600">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #7c3aed, #4f46e5, #60a5fa)' }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                GPT-4o-mini extrait les compétences de {files.length} CV{files.length > 1 ? 's' : ''}...
              </p>
            </div>
          )}

          {done && (
            <div className="alert-ok">
              <CheckCircle2 size={18} className="flex-shrink-0" />
              <div>
                <p className="font-bold">Analyse terminée avec succès !</p>
                <p className="text-xs mt-0.5 opacity-75">Redirection vers les résultats...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="alert-err">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* ── Right: résumé + bouton ── */}
        <div className="space-y-5">

          {/* Offer summary */}
          {offer && (
            <div className="card p-5">
              <p className="section-label">Offre sélectionnée</p>
              <p className="font-bold text-gray-900 text-sm mb-2">{offer.title}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="pill-found text-[10px]">{offer.level}</span>
                <span className="pill-neutral text-[10px]">{offer.experience} an(s)</span>
              </div>
              {offer.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {offer.skills.slice(0, 8).map(s => (
                    <span key={s} className="pill-found" style={{ fontSize: '10px', padding: '2px 8px' }}>
                      {s}
                    </span>
                  ))}
                  {offer.skills.length > 8 && (
                    <span className="text-[10px] text-gray-400 self-center">
                      +{offer.skills.length - 8}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Résumé */}
          <div className="card p-5 space-y-3">
            <p className="section-label">Résumé</p>
            {[
              { label: 'Offre sélectionnée', ok: !!offerId,          val: offer?.title || '—' },
              { label: 'Analyse IA',         ok: true,               val: 'GPT-4o-mini (.env)' },
              { label: 'CVs chargés',        ok: files.length > 0,   val: `${files.length} fichier${files.length > 1 ? 's' : ''}` },
            ].map(({ label, ok, val }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{label}</span>
                <span className={`text-xs font-semibold ${ok ? 'text-emerald-600' : 'text-gray-300'}`}>
                  {ok ? val : '—'}
                </span>
              </div>
            ))}
          </div>

          {/* Launch */}
          <button
            onClick={handleAnalyze}
            disabled={!canLaunch}
            className="btn-primary w-full py-4 text-sm"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Analyse en cours...</>
              : done
              ? <><CheckCircle2 size={16} /> Terminé !</>
              : `🚀  Analyser ${files.length > 0 ? `${files.length} CV${files.length > 1 ? 's' : ''}` : 'les CVs'}`
            }
          </button>
        </div>
      </div>
    </div>
  )
}
