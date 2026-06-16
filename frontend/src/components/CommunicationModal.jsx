import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  X, Mail, Send, CheckCircle2, Loader2,
  Calendar, FileX, MessageSquare, Clock, Sparkles,
} from 'lucide-react'
import api from '../api/client'

const INTERVIEW_MODELS = [
  {
    label: 'Entretien présentiel',
    icon: '🏢',
    text: `Nous avons le plaisir de vous inviter à un entretien de recrutement dans nos locaux.\n\nDate : [à compléter]\nHeure : [à compléter]\nAdresse : [à compléter]\n\nMerci de confirmer votre présence en répondant à cet email.`,
  },
  {
    label: 'Entretien visio (Teams/Zoom)',
    icon: '💻',
    text: `Nous avons le plaisir de vous inviter à un entretien en visioconférence.\n\nDate : [à compléter]\nHeure : [à compléter]\nLien de connexion : [à compléter]\n\nMerci de confirmer votre disponibilité en répondant à cet email.`,
  },
  {
    label: 'Entretien téléphonique',
    icon: '📞',
    text: `Nous aimerions vous contacter par téléphone pour un premier échange.\n\nDate : [à compléter]\nHeure : [à compléter]\nNuméro : nous vous appellerons sur le numéro indiqué dans votre candidature.\n\nMerci de confirmer votre disponibilité.`,
  },
  {
    label: 'Test technique + entretien',
    icon: '🧑‍💻',
    text: `Votre candidature a retenu notre attention. Nous vous proposons un processus en deux étapes :\n\n1. Test technique (durée : 1h) — à réaliser avant l'entretien\n2. Entretien technique et RH (durée : 45 min)\n\nDate proposée : [à compléter]\nVeuillez nous confirmer votre disponibilité.`,
  },
]

const TEMPLATES = [
  {
    id: 'interview',
    icon: <Calendar size={18} className="text-emerald-500" />,
    label: 'Invitation à l\'entretien',
    desc: 'Inviter le candidat retenu à un entretien',
    color: 'border-emerald-200 bg-emerald-50',
    activeColor: 'border-emerald-500 bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-700',
    for: 'accepted',
  },
  {
    id: 'rejection',
    icon: <FileX size={18} className="text-amber-500" />,
    label: 'Retour avec plan d\'amélioration',
    desc: 'Informer le candidat + envoyer son plan IA',
    color: 'border-amber-200 bg-amber-50',
    activeColor: 'border-amber-500 bg-amber-50',
    badge: 'bg-amber-100 text-amber-700',
    for: 'rejected',
  },
  {
    id: 'custom',
    icon: <MessageSquare size={18} className="text-violet-500" />,
    label: 'Message personnalisé',
    desc: 'Rédiger un message libre',
    color: 'border-violet-200 bg-violet-50',
    activeColor: 'border-violet-500 bg-violet-50',
    badge: 'bg-violet-100 text-violet-700',
    for: 'all',
  },
]

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function CommunicationModal({ cv, offerId, isAccepted, onClose }) {
  const [template, setTemplate]       = useState(isAccepted ? 'interview' : 'rejection')
  const [customMsg, setCustomMsg]     = useState('')
  const [sending, setSending]         = useState(false)
  const [sent, setSent]               = useState(false)
  const [error, setError]             = useState('')
  const [history, setHistory]         = useState(cv.communications || [])

  const handleSend = async () => {
    if (template === 'custom' && !customMsg.trim()) {
      setError('Veuillez saisir un message.')
      return
    }
    setSending(true); setError('')
    try {
      await api.post('/communication/send', {
        offer_id:       offerId,
        candidate_name: cv.name,
        template,
        custom_message: customMsg,
      })
      setSent(true)
      setHistory(prev => [...prev, {
        template,
        sent_at: new Date().toISOString(),
        to: cv.email,
      }])
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de l\'envoi.')
    } finally {
      setSending(false)
    }
  }

  const templateLabel = { interview: 'Entretien', rejection: 'Refus + Plan', custom: 'Personnalisé' }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-up">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
              <Mail size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Envoyer un email</p>
              <p className="text-xs text-gray-400 mt-0.5">{cv.name} · {cv.email}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center
                       text-gray-400 hover:bg-gray-200 transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

          {/* Status badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
            isAccepted
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-600 border-red-100'
          }`}>
            {isAccepted ? <CheckCircle2 size={12} /> : <FileX size={12} />}
            {isAccepted ? 'Candidat retenu' : 'Candidat non retenu'} · Score {cv.match_rate}%
          </div>

          {/* Template selector */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Type d'email
            </p>
            <div className="space-y-2">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTemplate(t.id); setSent(false); setError('') }}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                    template === t.id ? t.activeColor + ' border-2' : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                  style={template === t.id ? { borderColor: t.id === 'interview' ? '#10b981' : t.id === 'rejection' ? '#f59e0b' : '#7c3aed' } : {}}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    template === t.id ? 'bg-white shadow-sm' : 'bg-gray-50'
                  }`}>
                    {t.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm">{t.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                  </div>
                  {template === t.id && (
                    <CheckCircle2 size={16} className="text-gray-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Modèles prédéfinis pour l'entretien */}
          {template === 'interview' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={13} className="text-emerald-500" />
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Modèles d'inspiration
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {INTERVIEW_MODELS.map((m, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCustomMsg(m.text)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left
                                transition-all hover:border-emerald-300 hover:bg-emerald-50 ${
                      customMsg === m.text
                        ? 'border-emerald-400 bg-emerald-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <span className="text-base flex-shrink-0">{m.icon}</span>
                    <span className="text-[11px] font-semibold text-gray-700 leading-tight">
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-2 text-center">
                Cliquez sur un modèle pour le charger, puis personnalisez-le ↓
              </p>
            </div>
          )}

          {/* Message */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              {template === 'custom' ? 'Votre message *' : 'Message additionnel (optionnel)'}
            </label>
            <textarea
              value={customMsg}
              onChange={e => setCustomMsg(e.target.value)}
              rows={template === 'interview' ? 6 : 4}
              placeholder={
                template === 'interview'
                  ? "Choisissez un modèle ci-dessus ou rédigez votre message..."
                  : template === 'rejection'
                  ? "Ex : Nous avons apprécié la qualité de votre dossier..."
                  : "Rédigez votre message ici..."
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm
                         focus:outline-none focus:ring-2 focus:ring-violet-300
                         placeholder-gray-300 resize-none"
            />
            {customMsg && template === 'interview' && (
              <button
                type="button"
                onClick={() => setCustomMsg('')}
                className="text-[10px] text-gray-400 hover:text-red-400 mt-1 transition-colors"
              >
                ✕ Effacer le message
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100
                            rounded-xl text-sm text-red-600">
              <X size={14} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Success */}
          {sent && (
            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200
                            rounded-xl text-sm text-emerald-700">
              <CheckCircle2 size={16} className="flex-shrink-0" />
              <div>
                <p className="font-bold">Email envoyé avec succès !</p>
                <p className="text-xs mt-0.5">À : {cv.email}</p>
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock size={10} /> Historique des communications
              </p>
              <div className="space-y-1.5">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5
                                          bg-gray-50 border border-gray-100 rounded-xl">
                    <span className="text-xs font-semibold text-gray-600">
                      {templateLabel[h.template] || h.template}
                    </span>
                    <span className="text-[10px] text-gray-400">{formatDate(h.sent_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-sm font-bold
                       text-gray-500 hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button
            onClick={handleSend}
            disabled={sending || sent}
            className="flex-2 flex-1 py-3 rounded-xl text-sm font-bold text-white
                       disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}
          >
            {sending
              ? <><Loader2 size={15} className="animate-spin" /> Envoi...</>
              : sent
              ? <><CheckCircle2 size={15} /> Envoyé !</>
              : <><Send size={15} /> Envoyer l'email</>
            }
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
