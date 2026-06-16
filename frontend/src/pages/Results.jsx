import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import { PieChart, Pie } from 'recharts'
import {
  Download, ChevronDown, ChevronUp, Loader2, Upload,
  CheckCircle2, XCircle, TrendingUp, Users, Briefcase,
  GraduationCap, AlertTriangle, Mail, BarChart3, Trash2,
} from 'lucide-react'
import api from '../api/client'
import ImprovementPlan from '../components/ImprovementPlan'
import CommunicationModal from '../components/CommunicationModal'

const THRESHOLD = 60
const MEDALS    = ['🥇', '🥈', '🥉']

function rateColor(r) {
  return r >= 70 ? '#10b981' : r >= 40 ? '#f59e0b' : '#ef4444'
}
function rateLabel(r) {
  return r >= 70 ? 'Excellent' : r >= 60 ? 'Compatible' : r >= 40 ? 'Partial' : 'Weak'
}
function getInitials(name) {
  return name.split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase()
}
function avatarColor(name) {
  const palette = ['#7c3aed', '#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#0284c7']
  let h = 0
  for (const c of name) h = (h << 5) - h + c.charCodeAt(0)
  return palette[Math.abs(h) % palette.length]
}

/* ── Score Ring ─────────────────────────────────────────────── */
function ScoreRing({ rate, size = 68 }) {
  const color = rateColor(rate)
  const r     = size / 2
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie
          data={[{ value: rate }, { value: 100 - rate }]}
          cx={r - 1} cy={r - 1}
          innerRadius={r * 0.60} outerRadius={r * 0.83}
          startAngle={90} endAngle={-270}
          dataKey="value" strokeWidth={0}
        >
          <Cell fill={color} />
          <Cell fill="#f1f5f9" />
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[16px] font-black leading-none" style={{ color }}>
          {Math.round(rate)}
        </span>
        <span className="text-[8px] font-bold uppercase" style={{ color }}>%</span>
      </div>
    </div>
  )
}

/* ── KPI Card ───────────────────────────────────────────────── */
function KpiCard({ icon: Icon, value, label, bar, iconColor, delay = '' }) {
  return (
    <div
      className={`relative bg-white rounded-2xl overflow-hidden p-5 animate-fade-up ${delay}`}
      style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
    >
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${bar}`} />
      <div
        className="absolute -right-3 -bottom-3 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: iconColor, opacity: 0.05 }}
      />
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${iconColor}18` }}
      >
        <Icon size={17} style={{ color: iconColor }} strokeWidth={2} />
      </div>
      <div className="text-3xl font-black text-gray-900 font-mono-num leading-none">{value}</div>
      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-2">{label}</div>
    </div>
  )
}

/* ── Skill Pill ─────────────────────────────────────────────── */
function Pill({ label, type }) {
  const styles = {
    matched: { background: 'rgba(16,185,129,0.08)',  color: '#059669', border: '1px solid rgba(16,185,129,0.2)' },
    missing: { background: 'rgba(245,158,11,0.08)',  color: '#d97706', border: '1px solid rgba(245,158,11,0.2)' },
    bonus:   { background: 'rgba(124,58,237,0.07)',  color: '#7c3aed', border: '1px solid rgba(124,58,237,0.15)' },
  }
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={styles[type]}
    >
      {type === 'matched' && <CheckCircle2 size={9} />}
      {type === 'missing' && <span className="font-black">+</span>}
      {label}
    </span>
  )
}

/* ── Candidate Card ─────────────────────────────────────────── */
function CandidateCard({ cv, rank, isAccepted, offerId }) {
  const [open, setOpen]         = useState(rank <= 2)
  const [showEmail, setShowEmail] = useState(false)

  const rate    = cv.match_rate
  const color   = rateColor(rate)
  const matched = cv.match?.matched || []
  const missing = cv.match?.missing || []
  const bonus   = cv.match?.bonus   || []
  const total   = matched.length + missing.length
  const bg      = avatarColor(cv.name)

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md"
      style={{
        border: `1px solid ${isAccepted ? 'rgba(16,185,129,0.18)' : 'rgba(0,0,0,0.06)'}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* accent stripe */}
      <div
        className="h-[3px]"
        style={{
          background: isAccepted
            ? 'linear-gradient(90deg,#10b981,#059669)'
            : 'linear-gradient(90deg,#f59e0b,#ef4444)',
        }}
      />

      {/* header row */}
      <div
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50/50 transition-colors select-none"
      >
        {/* rank */}
        <div className="w-8 flex items-center justify-center flex-shrink-0">
          {rank <= 3
            ? <span className="text-xl leading-none">{MEDALS[rank - 1]}</span>
            : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                style={{ background: 'rgba(124,58,237,0.08)', color: '#7c3aed' }}
              >
                {rank}
              </div>
            )
          }
        </div>

        {/* avatar */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0"
          style={{ background: bg }}
        >
          {getInitials(cv.name)}
        </div>

        {/* score ring */}
        <ScoreRing rate={rate} size={66} />

        {/* candidate info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <p className="font-bold text-gray-900 text-sm truncate">{cv.name}</p>
            <span
              className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${color}14`, color, border: `1px solid ${color}30` }}
            >
              {rateLabel(rate)}
            </span>
          </div>

          {total > 0 && (
            <div className="mb-1.5">
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(matched.length / total) * 100}%`, background: color }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {matched.length}/{total} skills matched
              </p>
            </div>
          )}

          <p className="text-[11px] text-gray-400 truncate">
            {cv.experience?.years
              ? `${cv.experience.years} yr${cv.experience.years > 1 ? 's' : ''} exp.`
              : 'Experience not specified'}
            {cv.education?.[0]
              ? ` · ${[cv.education[0].degree, cv.education[0].field].filter(Boolean).join(' ')}`
              : ''}
          </p>
        </div>

        {/* actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
            style={isAccepted
              ? { background: 'rgba(16,185,129,0.08)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)' }
              : { background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.15)' }
            }
          >
            {isAccepted
              ? <><CheckCircle2 size={12} /> Accepted</>
              : <><XCircle size={12} /> Rejected</>
            }
          </div>

          <button
            onClick={e => { e.stopPropagation(); setShowEmail(true) }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
            style={{
              background: 'rgba(79,70,229,0.07)',
              color: '#4f46e5',
              border: '1px solid rgba(79,70,229,0.15)',
            }}
          >
            <Mail size={12} /> Contact
          </button>

          {open
            ? <ChevronUp size={15} className="text-gray-300 flex-shrink-0" />
            : <ChevronDown size={15} className="text-gray-300 flex-shrink-0" />
          }
        </div>
      </div>

      {showEmail && (
        <CommunicationModal
          cv={cv}
          offerId={offerId}
          isAccepted={isAccepted}
          onClose={() => setShowEmail(false)}
        />
      )}

      {/* expanded body */}
      {open && (
        <div
          className="border-t px-6 py-5 grid grid-cols-3 gap-6"
          style={{ borderColor: 'rgba(0,0,0,0.05)', background: 'rgba(248,250,252,0.7)' }}
        >
          {/* left: skills */}
          <div className="col-span-2 space-y-5">
            {matched.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Matched Skills
                    <span className="ml-1.5 text-emerald-500">({matched.length})</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {matched.map(s => <Pill key={s} label={s} type="matched" />)}
                </div>
              </div>
            )}

            {missing.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Missing Skills
                    <span className="ml-1.5 text-amber-500">({missing.length})</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {missing.map(s => <Pill key={s} label={s} type="missing" />)}
                </div>
              </div>
            )}

            {bonus.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Bonus Skills
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {bonus.slice(0, 8).map(s => <Pill key={s} label={s} type="bonus" />)}
                </div>
              </div>
            )}

            {!matched.length && !missing.length && (
              <p className="text-xs text-gray-400 italic">No skills detected</p>
            )}

            {!isAccepted && cv.improvement_plan && (
              <ImprovementPlan
                plan={cv.improvement_plan}
                candidateName={cv.name}
                matchRate={rate}
              />
            )}
          </div>

          {/* right: experience + education */}
          <div className="space-y-3">
            <div
              className="rounded-xl p-4"
              style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-center gap-1.5 mb-3">
                <Briefcase size={11} className="text-violet-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Experience</p>
              </div>
              {cv.experience?.years
                ? (
                  <p className="text-2xl font-black text-gray-900 font-mono-num mb-2">
                    {cv.experience.years}
                    <span className="text-sm font-semibold text-gray-400 ml-1">
                      yr{cv.experience.years > 1 ? 's' : ''}
                    </span>
                  </p>
                )
                : <p className="text-xs text-gray-400 mb-2">Not specified</p>
              }
              {cv.experience?.domains?.slice(0, 3).map((d, i) => (
                <p key={i} className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-1">
                  <span className="w-1 h-1 rounded-full bg-violet-300 flex-shrink-0" /> {d}
                </p>
              ))}
            </div>

            <div
              className="rounded-xl p-4"
              style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-center gap-1.5 mb-3">
                <GraduationCap size={11} className="text-violet-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Education</p>
              </div>
              {cv.education?.length
                ? cv.education.slice(0, 2).map((e, i) => (
                    <div key={i} className={i > 0 ? 'mt-2 pt-2 border-t border-gray-100' : ''}>
                      <p className="text-xs font-bold text-gray-800">
                        {[e.degree, e.field].filter(Boolean).join(' — ')}
                      </p>
                      {e.school && <p className="text-[11px] text-gray-400 mt-0.5">{e.school}</p>}
                    </div>
                  ))
                : <p className="text-xs text-gray-400">Not specified</p>
              }
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Confirm Modal ──────────────────────────────────────────── */
function ConfirmModal({ title, message, onConfirm, onCancel, confirmLabel, confirmColor }) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-up">
        <div className="flex items-start gap-4 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: confirmColor === 'amber' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
              border: `1px solid ${confirmColor === 'amber' ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.25)'}`,
            }}
          >
            <Mail size={18} style={{ color: confirmColor === 'amber' ? '#d97706' : '#16a34a' }} />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{title}</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
            style={{
              background: confirmColor === 'amber'
                ? 'linear-gradient(135deg,#f59e0b,#d97706)'
                : 'linear-gradient(135deg,#10b981,#059669)',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ── Bulk Email Button ──────────────────────────────────────── */
function BulkEmailButton({ offerId, count, target }) {
  const [confirm, setConfirm] = useState(false)
  const [sending, setSending] = useState(false)
  const [done, setDone]       = useState(null)
  const [error, setError]     = useState('')

  const handleSend = async () => {
    setConfirm(false)
    setSending(true); setError(''); setDone(null)
    try {
      const res = await api.post('/communication/send-bulk', {
        offer_id: offerId, target, custom_message: '',
      })
      setDone(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Error sending emails.')
    } finally {
      setSending(false)
    }
  }

  if (count === 0) return null
  const isRej = target === 'rejected'

  return (
    <>
      <div className="space-y-1">
        <button
          onClick={() => setConfirm(true)}
          disabled={sending || !!done}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          style={isRej
            ? { background: 'rgba(245,158,11,0.07)', color: '#d97706', border: '1px solid rgba(245,158,11,0.2)' }
            : { background: 'rgba(16,185,129,0.07)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)' }
          }
        >
          {sending
            ? <><Loader2 size={12} className="animate-spin" /> Sending…</>
            : done
            ? <><CheckCircle2 size={12} /> {done.sent} emails sent</>
            : <><Mail size={12} />{isRej ? `Notify rejected (${count})` : `Invite accepted (${count})`}</>
          }
        </button>
        {done?.failed > 0 && <p className="text-[10px] text-red-500 pl-1">{done.failed} failed</p>}
        {error && <p className="text-[10px] text-red-500 pl-1">{error}</p>}
      </div>
      {confirm && (
        <ConfirmModal
          title={isRej ? 'Send rejection emails' : 'Send interview invitations'}
          message={isRej
            ? `${count} candidate${count > 1 ? 's' : ''} will receive a rejection email with a personalized improvement plan.`
            : `${count} candidate${count > 1 ? 's' : ''} will receive an interview invitation.`}
          confirmLabel={isRej ? `Send to ${count}` : `Invite ${count}`}
          confirmColor={isRej ? 'amber' : 'green'}
          onConfirm={handleSend}
          onCancel={() => setConfirm(false)}
        />
      )}
    </>
  )
}

/* ── Delete Modal ───────────────────────────────────────────── */
function DeleteModal({ offerTitle, onConfirm, onCancel, deleting }) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-up">
        {/* icon */}
        <div className="flex justify-center mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <Trash2 size={24} className="text-red-500" strokeWidth={1.8} />
          </div>
        </div>

        <h3 className="text-center font-extrabold text-gray-900 text-base mb-1">
          Delete this offer?
        </h3>
        <p className="text-center text-xs text-gray-500 leading-relaxed mb-1">
          You are about to permanently delete
        </p>
        <p className="text-center text-sm font-bold text-gray-800 mb-4">
          &ldquo;{offerTitle}&rdquo;
        </p>

        <div
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-5 text-xs text-red-700 leading-relaxed"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
        >
          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5 text-red-400" />
          <span>
            This will delete the offer, <strong>all submitted CVs</strong>, and all analysis
            results. This action <strong>cannot be undone</strong>.
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold
                       text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all
                       flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
          >
            {deleting
              ? <><Loader2 size={14} className="animate-spin" /> Deleting…</>
              : <><Trash2 size={14} /> Delete permanently</>
            }
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ── Section Header ─────────────────────────────────────────── */
function SectionHeader({ icon: Icon, label, count, iconColor, iconBg, borderColor, children }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: iconBg }}
        >
          <Icon size={15} style={{ color: iconColor }} strokeWidth={2} />
        </div>
        <p className="font-bold text-gray-800 text-sm">{label}</p>
        <span
          className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
          style={{ background: iconBg, color: iconColor, border: `1px solid ${borderColor}` }}
        >
          {count}
        </span>
      </div>
      {children}
    </div>
  )
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function Results() {
  const navigate = useNavigate()
  const [offers, setOffers]         = useState([])
  const [offerId, setOfferId]       = useState('')
  const [results, setResults]       = useState([])
  const [loading, setLoading]       = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting]     = useState(false)

  useEffect(() => {
    api.get('/offers').then(r => {
      setOffers(r.data)
      if (r.data.length) setOfferId(r.data[0].id)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!offerId) return
    setLoading(true)
    api.get(`/analysis/${offerId}`)
      .then(r => setResults(r.data.results || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [offerId])

  const valid    = results.filter(c => !c.error).sort((a, b) => b.match_rate - a.match_rate)
  const errored  = results.filter(c =>  c.error)
  const accepted = valid.filter(c => c.match_rate >= THRESHOLD)
  const rejected = valid.filter(c => c.match_rate <  THRESHOLD)
  const avg      = valid.length ? valid.reduce((s, c) => s + c.match_rate, 0) / valid.length : 0
  const offer    = offers.find(o => o.id === offerId)

  const handleDeleteOffer = async () => {
    setDeleting(true)
    try {
      await api.delete(`/offers/${offerId}`)
      const remaining = offers.filter(o => o.id !== offerId)
      setOffers(remaining)
      setResults([])
      setOfferId(remaining.length ? remaining[0].id : '')
    } catch {
      // keep modal open so user sees it failed
    } finally {
      setDeleting(false)
      setShowDelete(false)
    }
  }

  const exportCSV = () => {
    const header = ['Rank', 'Candidate', 'Score (%)', 'Decision', 'Matched Skills', 'Missing Skills', 'Exp (yrs)']
    const rows = valid.map((cv, i) => [
      i + 1, cv.name, cv.match_rate.toFixed(1),
      cv.match_rate >= THRESHOLD ? 'Accepted' : 'Rejected',
      cv.match?.matched?.join('; ') || '',
      cv.match?.missing?.join('; ') || '',
      cv.experience?.years || '',
    ])
    const csv = [header, ...rows].map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' }))
    a.download = `results_${offer?.title?.replace(/\s+/g, '_') || 'analysis'}.csv`
    a.click()
  }

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Analysis Results</h1>
          <p className="page-sub">
            {offer
              ? <><span className="font-semibold text-gray-600">{offer.title}</span> — AI compatibility ranking</>
              : 'AI compatibility score ranking'
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          {offers.length > 1 && (
            <select
              value={offerId}
              onChange={e => setOfferId(e.target.value)}
              className="field-select text-sm"
            >
              {offers.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
            </select>
          )}
          {valid.length > 0 && (
            <button onClick={exportCSV} className="btn-success">
              <Download size={15} /> Export CSV
            </button>
          )}
          {offerId && (
            <button
              onClick={() => setShowDelete(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
                         transition-all duration-150 hover:shadow-sm"
              style={{
                background: 'rgba(239,68,68,0.07)',
                color: '#dc2626',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              <Trash2 size={15} strokeWidth={2} />
              Delete offer
            </button>
          )}
        </div>
      </div>

      {/* ── KPIs ───────────────────────────────────────────── */}
      {valid.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <KpiCard icon={Users}       value={valid.length}        label="CVs Analyzed"       bar="from-violet-500 to-indigo-500"  iconColor="#7c3aed" delay="anim-delay-1" />
          <KpiCard icon={CheckCircle2} value={accepted.length}    label={`Accepted ≥${THRESHOLD}%`} bar="from-emerald-500 to-green-400"  iconColor="#10b981" delay="anim-delay-2" />
          <KpiCard icon={XCircle}     value={rejected.length}     label="Rejected"           bar="from-rose-500 to-red-400"       iconColor="#f43f5e" delay="anim-delay-3" />
          <KpiCard icon={TrendingUp}  value={`${avg.toFixed(0)}%`} label="Average Score"     bar="from-amber-500 to-orange-400"   iconColor="#f59e0b" delay="anim-delay-4" />
        </div>
      )}

      {/* ── Bar Chart ──────────────────────────────────────── */}
      {valid.length > 0 && (
        <div
          className="bg-white rounded-2xl p-6"
          style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-violet-500" />
              <p className="font-bold text-gray-800 text-sm">Candidate compatibility scores</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-gray-400">
              {[
                { color: '#10b981', label: '≥70 Excellent' },
                { color: '#f59e0b', label: '40–69 Partial' },
                { color: '#ef4444', label: '<40 Weak' },
              ].map(({ color, label }) => (
                <span key={label} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={valid} margin={{ top: 8, right: 24, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name" angle={-30} textAnchor="end"
                tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false}
              />
              <YAxis
                domain={[0, 110]} tickFormatter={v => `${v}%`}
                tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
              />
              <Tooltip
                formatter={v => [`${v.toFixed(1)}%`, 'Score']}
                contentStyle={{
                  borderRadius: '12px', border: '1px solid #e2e8f0',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)', fontSize: 12,
                }}
              />
              <ReferenceLine
                y={THRESHOLD} stroke="#c4b5fd" strokeDasharray="5 4"
                label={{ value: `Threshold ${THRESHOLD}%`, position: 'insideTopRight', fontSize: 11, fill: '#8b5cf6' }}
              />
              <Bar dataKey="match_rate" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {valid.map(cv => <Cell key={cv.name} fill={rateColor(cv.match_rate)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Candidate List ─────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-violet-500">
          <Loader2 size={28} className="animate-spin" />
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Analyzing…</p>
        </div>
      ) : valid.length === 0 ? (
        <div
          className="bg-white rounded-2xl p-12 text-center"
          style={{ border: '1px solid rgba(0,0,0,0.06)' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(124,58,237,0.07)' }}
          >
            <Users size={28} className="text-gray-300" />
          </div>
          <p className="font-bold text-gray-500 text-lg mb-1">No results available</p>
          <p className="text-sm text-gray-400 mb-6">
            {errored.length > 0
              ? `${errored.length} CV(s) with errors — see below.`
              : 'Upload and analyze CVs to see the AI ranking.'}
          </p>
          <button onClick={() => navigate('/upload')} className="btn-primary mx-auto">
            <Upload size={16} /> Launch analysis
          </button>
        </div>
      ) : (
        <div className="space-y-8">

          {/* Accepted */}
          {accepted.length > 0 && (
            <div>
              <SectionHeader
                icon={CheckCircle2} label="Accepted Candidates" count={accepted.length}
                iconColor="#059669" iconBg="rgba(16,185,129,0.1)" borderColor="rgba(16,185,129,0.2)"
              >
                <BulkEmailButton offerId={offerId} count={accepted.length} target="accepted" />
              </SectionHeader>
              <div className="space-y-3">
                {accepted.map((cv, i) => (
                  <CandidateCard key={cv.name} cv={cv} rank={i + 1} isAccepted={true} offerId={offerId} />
                ))}
              </div>
            </div>
          )}

          {/* Rejected */}
          {rejected.length > 0 && (
            <div>
              <SectionHeader
                icon={XCircle} label="Rejected Candidates" count={rejected.length}
                iconColor="#e11d48" iconBg="rgba(244,63,94,0.08)" borderColor="rgba(244,63,94,0.15)"
              >
                <BulkEmailButton offerId={offerId} count={rejected.length} target="rejected" />
              </SectionHeader>
              <div className="space-y-3">
                {rejected.map((cv, i) => (
                  <CandidateCard key={cv.name} cv={cv} rank={accepted.length + i + 1} isAccepted={false} offerId={offerId} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Delete confirmation modal ──────────────────────── */}
      {showDelete && (
        <DeleteModal
          offerTitle={offer?.title || 'this offer'}
          onConfirm={handleDeleteOffer}
          onCancel={() => setShowDelete(false)}
          deleting={deleting}
        />
      )}

      {/* ── Errors ─────────────────────────────────────────── */}
      {errored.length > 0 && (
        <div
          className="bg-white rounded-2xl p-5"
          style={{ border: '1px solid rgba(239,68,68,0.15)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-red-400" />
            <p className="font-bold text-red-600 text-sm">
              Processing Errors ({errored.length} CV{errored.length > 1 ? 's' : ''})
            </p>
          </div>
          <div className="space-y-2">
            {errored.map(cv => (
              <div
                key={cv.name}
                className="flex items-start gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}
              >
                <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-700 text-sm">{cv.name}</p>
                  <p className="text-red-500 text-xs mt-0.5">{cv.error}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
