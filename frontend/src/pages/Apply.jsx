import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Briefcase, Clock, MapPin, Upload, FileText,
  CheckCircle2, Loader2, X, AlertCircle, ArrowLeft,
} from 'lucide-react'

export default function Apply() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const [offer, setOffer]         = useState(null)
  const [notFound, setNotFound]   = useState(false)
  const [name, setName]           = useState(() => localStorage.getItem('apply_name') || '')
  const [email, setEmail]         = useState(() => localStorage.getItem('apply_email') || '')
  const [file, setFile]           = useState(null)
  const [loading, setLoading]     = useState(false)
  const [successCount, setSuccessCount] = useState(0)
  const [error, setError]         = useState('')

  useEffect(() => {
    fetch(`/api/public/offers/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(setOffer)
      .catch(() => setNotFound(true))
  }, [id])

  const handleFile = (f) => {
    if (f && f.type === 'application/pdf') setFile(f)
    else setError('Veuillez sélectionner un fichier PDF.')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    handleFile(f)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim())  { setError('Votre nom est obligatoire.'); return }
    if (!email.trim()) { setError('Votre email est obligatoire.'); return }
    if (!file)         { setError('Veuillez joindre votre CV (PDF).'); return }

    setLoading(true); setError('')
    localStorage.setItem('apply_name', name.trim())
    localStorage.setItem('apply_email', email.trim())

    const form = new FormData()
    form.append('candidate_name', name.trim())
    form.append('candidate_email', email.trim())
    form.append('file', file)

    try {
      const res = await fetch(`/api/public/offers/${id}/apply`, {
        method: 'POST',
        body: form,
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Erreur lors de la soumission.')
      }
      setFile(null)
      setSuccessCount(c => c + 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="font-bold text-gray-600 text-lg mb-2">Offer not found</p>
          <p className="text-sm text-gray-400 mb-6">This offer does not exist or is no longer available.</p>
          <button onClick={() => navigate('/offres')}
            className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-colors">
            Voir toutes les offres
          </button>
        </div>
      </div>
    )
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-violet-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/offres')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={16} /> Back to offers
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
              🎯
            </div>
            <span className="font-bold text-sm text-gray-700">
              Skills<span className="text-violet-600">Matcher</span>
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {/* ── Offer summary ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100
                            flex items-center justify-center flex-shrink-0">
              <Briefcase size={22} className="text-violet-500" />
            </div>
            <div className="flex-1">
              <h1 className="font-black text-gray-900 text-xl leading-tight">{offer.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {offer.experience} an{offer.experience !== 1 ? 's' : ''} d'expérience
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={11} /> {offer.level}
                </span>
              </div>
              {offer.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {offer.skills.map(s => (
                    <span key={s}
                      className="px-2.5 py-1 rounded-full text-[11px] font-semibold
                                 bg-violet-50 text-violet-600 border border-violet-200">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {offer.description && (
                <p className="text-sm text-gray-500 mt-3 leading-relaxed">{offer.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Toast succès ── */}
        {successCount > 0 && (
          <div className="flex items-center gap-3 px-5 py-4 bg-emerald-50 border border-emerald-200
                          rounded-2xl shadow-sm">
            <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-700">
                CV envoyé ({successCount} envoi{successCount > 1 ? 's' : ''}) !
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Votre nom et email sont mémorisés — uploadez un autre CV directement.
              </p>
            </div>
          </div>
        )}

        {/* ── Application form ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-800 text-base mb-5">Your Application</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name + Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Full name *
                  </label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm
                               focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent
                               placeholder-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="jean@exemple.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm
                               focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent
                               placeholder-gray-300"
                  />
                </div>
              </div>

              {/* CV Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  CV (PDF) *
                </label>

                {file ? (
                  <div className="flex items-center gap-3 px-4 py-3 bg-violet-50 rounded-xl
                                  border border-violet-200">
                    <div className="w-9 h-9 rounded-lg bg-white border border-violet-200
                                    flex items-center justify-center flex-shrink-0">
                      <FileText size={16} className="text-violet-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
                      <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button type="button" onClick={() => setFile(null)}
                      className="text-gray-400 hover:text-red-400 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    onDrop={handleDrop}
                    onDragOver={e => e.preventDefault()}
                    onClick={() => document.getElementById('cv-input').click()}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center
                               cursor-pointer hover:border-violet-300 hover:bg-violet-50/40 transition-all"
                  >
                    <Upload size={24} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-500">
                      Drag your CV here
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      or <span className="text-violet-600 font-semibold">browse</span> · PDF only
                    </p>
                    <input
                      id="cv-input" type="file" accept=".pdf" className="hidden"
                      onChange={e => handleFile(e.target.files[0])}
                    />
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100
                                rounded-xl text-sm text-red-600">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all
                           disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
              >
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Envoi en cours...</>
                  : successCount > 0 ? 'Envoyer un autre CV' : 'Submit my application'
                }
              </button>
            </form>
          </div>
      </div>
    </div>
  )
}
