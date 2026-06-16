import { Award, BookOpen, Target, Clock, TrendingUp, Zap, CheckCircle2, ArrowRight, Play, ExternalLink } from 'lucide-react'

const PLATFORM_STYLES = {
  youtube:        { grad: 'linear-gradient(135deg,#ff0000 0%,#cc0000 100%)', logo: '▶', logoColor: '#fff', label: 'YouTube' },
  openclassrooms: { grad: 'linear-gradient(135deg,#6a35ff 0%,#4f46e5 100%)', logo: '📚', logoColor: '#fff', label: 'OpenClassrooms' },
  freecodecamp:   { grad: 'linear-gradient(135deg,#0a0a23 0%,#1b1b32 100%)', logo: '🔥', logoColor: '#f03000', label: 'freeCodeCamp' },
  coursera:       { grad: 'linear-gradient(135deg,#0056d3 0%,#003d99 100%)', logo: '🎓', logoColor: '#fff', label: 'Coursera' },
  udemy:          { grad: 'linear-gradient(135deg,#a435f0 0%,#7a1fa2 100%)', logo: '📖', logoColor: '#fff', label: 'Udemy' },
  linkedin:       { grad: 'linear-gradient(135deg,#0077b5 0%,#005885 100%)', logo: '💼', logoColor: '#fff', label: 'LinkedIn' },
  default:        { grad: 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)', logo: '▶', logoColor: '#fff', label: 'Cours' },
}

function getPlatformStyle(platform = '') {
  const p = platform.toLowerCase()
  if (p.includes('youtube'))        return PLATFORM_STYLES.youtube
  if (p.includes('openclassrooms')) return PLATFORM_STYLES.openclassrooms
  if (p.includes('freecodecamp'))   return PLATFORM_STYLES.freecodecamp
  if (p.includes('coursera'))       return PLATFORM_STYLES.coursera
  if (p.includes('udemy'))          return PLATFORM_STYLES.udemy
  if (p.includes('linkedin'))       return PLATFORM_STYLES.linkedin
  return PLATFORM_STYLES.default
}

function VideoResourceCard({ type, name, platform, duration, youtube_search }) {
  const ps = getPlatformStyle(platform)
  const isProject = type === 'projet'
  const searchQuery = youtube_search || `${name} ${platform} tutoriel`
  const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`

  if (isProject) {
    return (
      <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
        <div className="w-6 h-6 rounded-lg bg-emerald-100 border border-emerald-200
                        flex items-center justify-center flex-shrink-0 mt-0.5">
          <CheckCircle2 size={12} className="text-emerald-600" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Projet pratique</p>
          <p className="text-xs text-emerald-800 leading-relaxed">{name}</p>
        </div>
      </div>
    )
  }

  return (
    <a href={ytUrl} target="_blank" rel="noopener noreferrer"
       className="block rounded-xl overflow-hidden border border-slate-200 shadow-sm
                  hover:shadow-md hover:border-violet-300 transition-all duration-200 group">
      {/* Thumbnail */}
      <div className="relative h-28 flex items-center justify-center overflow-hidden"
           style={{ background: ps.grad }}>
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10"
             style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 20px,rgba(255,255,255,.3) 20px,rgba(255,255,255,.3) 21px),repeating-linear-gradient(90deg,transparent,transparent 20px,rgba(255,255,255,.3) 20px,rgba(255,255,255,.3) 21px)' }} />

        {/* Platform logo big */}
        <span className="text-4xl opacity-20 absolute">{ps.logo}</span>

        {/* Course name on thumbnail */}
        <div className="relative z-10 text-center px-4">
          <p className="text-white font-black text-sm leading-tight drop-shadow-lg line-clamp-2">
            {name}
          </p>
        </div>

        {/* Play button */}
        <div className="absolute bottom-2 right-2 w-8 h-8 bg-white/20 backdrop-blur-sm
                        rounded-full flex items-center justify-center
                        group-hover:bg-white/40 transition-colors">
          <Play size={14} fill="white" className="text-white ml-0.5" />
        </div>

        {/* Duration badge */}
        {duration && (
          <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px]
                          font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
            <Clock size={9} /> {duration}
          </div>
        )}
      </div>

      {/* Info bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-white">
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-700 truncate">{name}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{ps.label}</p>
        </div>
        <ExternalLink size={12} className="text-slate-300 group-hover:text-violet-500 transition-colors flex-shrink-0 ml-2" />
      </div>
    </a>
  )
}

export default function ImprovementPlan({ plan, candidateName, matchRate }) {
  if (!plan) return null

  const gap = Math.max(0, 60 - (matchRate || 0))

  return (
    <div className="mt-5 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">

      {/* ── Banner ── */}
      <div className="px-6 py-5 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4338ca 100%)' }}>
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
            <Zap size={20} className="text-yellow-300" />
          </div>
          <div>
            <p className="font-black text-white text-base leading-tight">
              Plan de développement personnalisé
            </p>
            <p className="text-indigo-300 text-xs mt-0.5">
              Généré par IA · {candidateName}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-indigo-300 uppercase tracking-wider font-bold">Durée estimée</p>
          <p className="text-xl font-black text-white">{plan.timeline || '3–6 mois'}</p>
        </div>
      </div>

      <div className="bg-white p-6 space-y-6">

        {/* ── Score progress ── */}
        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Progression vers l'objectif
            </p>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200
                             px-2.5 py-1 rounded-full">
              +{gap.toFixed(0)}% à gagner
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center flex-shrink-0">
              <p className="text-2xl font-black text-red-500">{(matchRate || 0).toFixed(0)}%</p>
              <p className="text-[10px] text-slate-400 font-semibold">Actuel</p>
            </div>
            <div className="flex-1">
              <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                  style={{
                    width: `${matchRate || 0}%`,
                    background: 'linear-gradient(90deg,#ef4444,#f97316)',
                  }} />
                <div className="absolute inset-y-0 rounded-full opacity-30"
                  style={{
                    left: `${matchRate || 0}%`,
                    right: `${100 - 60}%`,
                    background: 'linear-gradient(90deg,#6366f1,#4f46e5)',
                  }} />
                {/* Marker at 60% */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-emerald-500"
                  style={{ left: '60%' }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-slate-400">0%</span>
                <span className="text-[9px] text-emerald-600 font-bold" style={{ marginLeft: '52%' }}>
                  Objectif 60%
                </span>
                <span className="text-[9px] text-slate-400">100%</span>
              </div>
            </div>
            <div className="text-center flex-shrink-0">
              <p className="text-2xl font-black text-emerald-500">60%</p>
              <p className="text-[10px] text-slate-400 font-semibold">Objectif</p>
            </div>
          </div>
        </div>

        {/* ── Summary ── */}
        {plan.summary && (
          <div className="flex gap-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
            <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200
                            flex items-center justify-center flex-shrink-0">
              <Target size={15} className="text-amber-600" />
            </div>
            <p className="text-sm text-amber-900 leading-relaxed">{plan.summary}</p>
          </div>
        )}

        {/* ── Priority skills ── */}
        {plan.priority_skills?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Target size={11} className="text-indigo-600" />
              </div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Compétences prioritaires à acquérir
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {plan.priority_skills.map((s, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl border
                                        bg-white border-indigo-200 shadow-sm">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center
                                   text-[10px] font-black text-white flex-shrink-0"
                    style={{ background: i === 0 ? '#4f46e5' : i === 1 ? '#7c3aed' : i === 2 ? '#0891b2' : '#64748b' }}>
                    {i + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-700">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Learning path ── */}
        {plan.learning_path?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-lg bg-indigo-100 flex items-center justify-center">
                <BookOpen size={11} className="text-indigo-600" />
              </div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Parcours d'apprentissage
              </p>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-8 bottom-4 w-0.5 bg-indigo-100" />

              <div className="space-y-4">
                {plan.learning_path.map((step, i) => (
                  <div key={i} className="relative pl-14">
                    {/* Step number circle */}
                    <div className="absolute left-0 top-3 w-10 h-10 rounded-2xl flex items-center
                                    justify-center text-white text-sm font-black shadow-sm z-10"
                      style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                      {i + 1}
                    </div>

                    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                      {/* Step header */}
                      <div className="flex items-center justify-between px-5 py-3.5
                                      bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                        <div>
                          <p className="font-bold text-slate-800">{step.skill}</p>
                          {step.why && (
                            <p className="text-[11px] text-slate-400 mt-0.5 italic">{step.why}</p>
                          )}
                        </div>
                        <ArrowRight size={14} className="text-slate-300 flex-shrink-0" />
                      </div>

                      <div className="p-4 space-y-3">
                        {/* Video resource cards */}
                        {step.resources?.length > 0 && (
                          <div className="grid grid-cols-2 gap-3">
                            {step.resources.slice(0, 4).map((r, j) => (
                              <VideoResourceCard key={j} {...r} />
                            ))}
                          </div>
                        )}

                        {/* Hands-on project */}
                        {step.project && (
                          <VideoResourceCard
                            type="projet"
                            name={step.project}
                            platform=""
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Certifications ── */}
        {plan.certifications?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-lg bg-amber-100 flex items-center justify-center">
                <Award size={11} className="text-amber-600" />
              </div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Certifications recommandées
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {plan.certifications.map((c, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-amber-50
                                        border border-amber-200">
                  <div className="w-8 h-8 rounded-xl bg-white border border-amber-200
                                  flex items-center justify-center flex-shrink-0">
                    <Award size={14} className="text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-amber-900 leading-tight">{c.name}</p>
                    <p className="text-[10px] text-amber-600 mt-1 font-semibold">{c.platform}</p>
                    <p className="text-[10px] text-amber-700 mt-0.5 leading-relaxed">{c.relevance}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Soft skills ── */}
        {plan.soft_skills?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp size={11} className="text-blue-600" />
              </div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Compétences comportementales
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {plan.soft_skills.map((s, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full text-xs font-semibold
                                         bg-blue-50 text-blue-700 border border-blue-200">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Encouragement ── */}
        {plan.encouragement && (
          <div className="relative overflow-hidden rounded-2xl p-5"
            style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)' }}>
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle,#a5b4fc,transparent)' }} />
            <div className="flex items-start gap-3 relative z-10">
              <Zap size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-indigo-100 font-medium italic leading-relaxed">
                "{plan.encouragement}"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
