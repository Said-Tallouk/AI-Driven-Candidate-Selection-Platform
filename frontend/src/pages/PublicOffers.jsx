import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase, MapPin, Clock, ChevronRight,
  Search, Loader2, Zap, Users, TrendingUp,
  Upload, Brain, Award, CheckCircle, Star,
} from 'lucide-react'

export default function PublicOffers() {
  const navigate = useNavigate()
  const [offers, setOffers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    fetch('/api/public/offers')
      .then(r => r.json())
      .then(data => setOffers(Array.isArray(data) ? data : []))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = offers.filter(o =>
    o.title.toLowerCase().includes(search.toLowerCase()) ||
    o.skills?.some(s => s.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Navbar ── */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 4px 12px rgba(124,58,237,0.35)' }}>
              🎯
            </div>
            <div>
              <p className="font-extrabold text-gray-900 text-sm leading-none tracking-tight">
                Skills<span className="text-violet-600">Matcher</span>
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">AI Recruitment</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a href="#offres" className="text-sm text-gray-500 font-medium hover:text-gray-800 transition-colors">
              Job Offers
            </a>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold
                         hover:bg-violet-700 transition-colors shadow-sm"
            >
              HR Space
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#4c1d95 0%,#5b21b6 40%,#4338ca 100%)', minHeight: '600px' }}
      >
        {/* Blobs décoratifs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
          <div className="absolute top-10 right-[45%] w-64 h-64 rounded-full opacity-8"
            style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
        </div>

        {/* Layout: texte gauche + photo droite full-height */}
        <div className="flex flex-col lg:flex-row items-stretch min-h-[600px]">

          {/* ── Gauche : illustration + texte + search ── */}
          <div className="flex-1 flex flex-col justify-center px-10 lg:px-16 xl:px-20 py-10 z-10">

            {/* Illustration grande */}
            <div className="w-full max-w-xs mb-1 -ml-2">
              <img
                src="/hr-illustration.jpg"
                alt="HR illustration"
                className="w-full h-auto"
                style={{
                  maskImage: 'radial-gradient(ellipse 80% 76% at 50% 50%, black 42%, transparent 70%)',
                  WebkitMaskImage: 'radial-gradient(ellipse 80% 76% at 50% 50%, black 42%, transparent 70%)',
                }}
              />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 w-fit
                            bg-white/10 border border-white/20 text-[11px] font-semibold text-violet-200">
              <Zap size={11} /> Matching IA propulsé par Groq Llama 3.3
            </div>

            <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] mb-4">
              Find the job<br />
              <span className="text-violet-300">made for you</span>
            </h1>

            <p className="text-violet-200 text-base mb-8 max-w-md leading-relaxed">
              Postulez en 2 minutes. Notre IA analyse votre profil et vous met en avant auprès des recruteurs.
            </p>

            {/* Search bar */}
            <div className="max-w-lg relative mb-8">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Poste, compétence, technologie..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-0 shadow-2xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-violet-300 text-gray-700"
              />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold">
                  ✕
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8">
              {[
                { icon: <Briefcase size={15} />, val: offers.length, label: 'offres actives' },
                { icon: <Users size={15} />,     val: '100%',        label: 'gratuit candidats' },
                { icon: <TrendingUp size={15} />,val: 'IA',          label: 'analyse instantanée' },
              ].map(({ icon, val, label }) => (
                <div key={label} className="flex items-center gap-2 text-white/70 text-sm">
                  <span className="text-violet-300">{icon}</span>
                  <span className="font-black text-white">{val}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Droite : grande photo pleine hauteur ── */}
          <div className="relative flex-shrink-0 w-full lg:w-[48%] h-[320px] lg:h-auto overflow-hidden">
            <img
              src="/hr-team.jpg"
              alt="Entretien professionnel"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>

        {/* Barre de séparation invisible pour espacer search/stats si mobile */}
        <div className="lg:hidden relative max-w-3xl mx-auto px-6 text-center pb-10">
          <div className="max-w-xl mx-auto relative mb-6">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Poste, compétence..."
              className="w-full pl-11 pr-4 py-4 rounded-2xl border-0 shadow-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-violet-300 text-gray-700"
            />
          </div>
        </div>

      </section>

      {/* ── How it works ── */}
      <section className="bg-white py-16 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold
                             bg-violet-50 text-violet-600 border border-violet-100 mb-3">
              Simple & rapide
            </span>
            <h2 className="text-2xl font-black text-gray-900">Comment ça marche ?</h2>
            <p className="text-gray-400 text-sm mt-2">Postulez en 3 étapes, notre IA fait le reste</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Upload size={22} className="text-violet-600" />,
                step: '01',
                title: 'Déposez votre CV',
                desc: 'Importez votre CV en PDF. Notre IA extrait automatiquement vos compétences et votre expérience.',
              },
              {
                icon: <Brain size={22} className="text-violet-600" />,
                step: '02',
                title: 'Analyse IA instantanée',
                desc: 'Groq Llama 3.3 compare votre profil avec les offres et calcule un score de compatibilité.',
              },
              {
                icon: <Award size={22} className="text-violet-600" />,
                step: '03',
                title: 'Soyez mis en avant',
                desc: 'Les recruteurs voient votre profil avec votre score et vos points forts mis en évidence.',
              },
            ].map(({ icon, step, title, desc }) => (
              <div key={step} className="relative group">
                <div className="bg-slate-50 rounded-2xl p-6 border border-gray-100
                                hover:border-violet-200 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-violet-50 border border-violet-100
                                    flex items-center justify-center flex-shrink-0
                                    group-hover:bg-violet-100 transition-colors">
                      {icon}
                    </div>
                    <span className="text-3xl font-black text-gray-100 select-none">{step}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mt-4 mb-2">{title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why us (photo + text) ── */}
      <section className="py-16 bg-slate-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">

          {/* Photo */}
          <div className="flex-shrink-0 w-full lg:w-[45%]">
            <div className="relative">
              <img
                src="/hr-team.jpg"
                alt="Entretien professionnel"
                className="w-full h-72 object-cover rounded-2xl shadow-xl"
              />
              {/* Badge flottant */}
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-lg px-4 py-3
                              flex items-center gap-3 border border-gray-100">
                <div className="flex -space-x-2">
                  {['#7c3aed','#4f46e5','#10b981'].map(c => (
                    <div key={c} className="w-7 h-7 rounded-full border-2 border-white"
                         style={{ background: c }} />
                  ))}
                </div>
                <div>
                  <p className="text-xs font-black text-gray-900">+500 candidats</p>
                  <p className="text-[10px] text-gray-400">recrutés ce mois</p>
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="flex-1">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold
                             bg-violet-50 text-violet-600 border border-violet-100 mb-4">
              Pourquoi nous choisir ?
            </span>
            <h2 className="text-2xl font-black text-gray-900 leading-tight mb-4">
              L'IA au service<br />
              <span className="text-violet-600">de votre carrière</span>
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              SkillsMatcher utilise l'intelligence artificielle pour connecter
              les meilleurs talents avec les entreprises qui leur correspondent vraiment.
              Fini les candidatures à l'aveugle.
            </p>
            <ul className="space-y-3">
              {[
                'Matching sémantique basé sur vos vraies compétences',
                'Analyse de CV en moins de 10 secondes',
                '100% gratuit pour les candidats, toujours',
                'Feedback immédiat sur votre compatibilité',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                  <CheckCircle size={16} className="text-violet-500 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>

            {/* Stars */}
            <div className="flex items-center gap-2 mt-6">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs text-gray-400">4.9/5 · basé sur 200+ avis candidats</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Offers section ── */}
      <section id="offres" className="max-w-5xl mx-auto px-6 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-black text-gray-900">Offres d'emploi</h2>
            <p className="text-sm text-gray-400 mt-1">
              {loading ? 'Loading...' : `${filtered.length} offer${filtered.length !== 1 ? 's' : ''} available`}
            </p>
          </div>
          {search && (
            <button onClick={() => setSearch('')}
              className="text-xs text-violet-600 font-semibold hover:underline">
              Effacer le filtre
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 size={28} className="animate-spin text-violet-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
            <div className="text-5xl mb-4">📭</div>
            <p className="font-bold text-gray-500 text-lg">No offers available</p>
            <p className="text-sm text-gray-400 mt-2">
              {search ? 'No results for this search.' : 'Check back soon — new offers are coming!'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((offer, i) => (
              <div
                key={offer.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6
                           hover:shadow-lg hover:border-violet-200 transition-all duration-200
                           cursor-pointer group"
                style={{ animationDelay: `${i * 40}ms` }}
                onClick={() => navigate(`/offres/${offer.id}/postuler`)}
              >
                <div className="flex items-center gap-5">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50
                                  border border-violet-100 flex items-center justify-center flex-shrink-0
                                  group-hover:border-violet-300 transition-colors">
                    <Briefcase size={22} className="text-violet-500" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base group-hover:text-violet-700
                                       transition-colors truncate">
                          {offer.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin size={11} className="text-gray-300" /> {offer.level}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} className="text-gray-300" />
                            {offer.experience} an{offer.experience !== 1 ? 's' : ''} d'expérience
                          </span>
                        </div>
                      </div>

                      {/* CTA */}
                      <button
                        className="flex-shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-xl
                                   text-xs font-bold transition-all duration-200
                                   bg-violet-600 text-white hover:bg-violet-700 shadow-sm
                                   group-hover:shadow-md"
                        onClick={e => { e.stopPropagation(); navigate(`/offres/${offer.id}/postuler`) }}
                      >
                        Apply <ChevronRight size={13} />
                      </button>
                    </div>

                    {offer.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {offer.skills.slice(0, 7).map(s => (
                          <span key={s}
                            className="px-2.5 py-1 rounded-full text-[11px] font-semibold
                                       bg-slate-50 text-slate-600 border border-slate-200
                                       group-hover:bg-violet-50 group-hover:text-violet-600
                                       group-hover:border-violet-200 transition-colors">
                            {s}
                          </span>
                        ))}
                        {offer.skills.length > 7 && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] text-gray-400">
                            +{offer.skills.length - 7}
                          </span>
                        )}
                      </div>
                    )}

                    {offer.description && (
                      <p className="text-xs text-gray-400 mt-2 line-clamp-1 leading-relaxed">
                        {offer.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 bg-white py-8 mt-6">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <span className="font-bold text-sm text-gray-700">
              Skills<span className="text-violet-600">Matcher</span>
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Powered by AI · Free for candidates
          </p>
          <button
            onClick={() => navigate('/login')}
            className="text-xs font-semibold text-violet-600 hover:underline"
          >
            HR Space →
          </button>
        </div>
      </footer>
    </div>
  )
}
