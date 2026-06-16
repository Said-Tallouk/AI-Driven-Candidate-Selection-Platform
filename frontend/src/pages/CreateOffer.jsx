import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Plus, Loader2, CheckCircle2, ChevronRight, Sparkles, ChevronDown } from 'lucide-react'
import api from '../api/client'
import { parseApiError } from '../api/parseError'

const LEVELS = ['Junior', 'Confirmé', 'Senior', 'Expert']

const SUGGEST_SKILLS = [
  'Python','SQL','JavaScript','React','Node.js','Docker','AWS','Azure','Git',
  'Machine Learning','TensorFlow','FastAPI','PostgreSQL','MongoDB','Spark',
]

const IT_TEMPLATES = [
  {
    icon: '🧠',
    label: 'Data Scientist',
    title: 'Data Scientist',
    level: 'Confirmé',
    experience: 3,
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'Scikit-learn', 'SQL', 'Pandas', 'NumPy', 'Deep Learning', 'Statistics', 'Jupyter'],
    description: `We are looking for a passionate Data Scientist to join our Data & AI team.

Key Responsibilities:
• Collect, clean, and explore large volumes of structured and unstructured data to extract strategic insights that drive business decisions.
• Design, train, and evaluate machine learning and deep learning models (classification, regression, clustering, NLP, computer vision) tailored to specific business problems.
• Build reproducible and automated data processing pipelines using Python (Pandas, NumPy, Scikit-learn, TensorFlow/Keras).
• Analyze model outputs, interpret performance metrics (AUC, F1-score, RMSE), and communicate clear, actionable recommendations to stakeholders.
• Collaborate closely with product, marketing, and engineering teams to transform raw data into deployable AI solutions.
• Prepare and deliver data-driven presentations and synthesis reports for both technical and non-technical audiences.
• Stay current with the latest advancements in artificial intelligence, machine learning, and data science through active technology watch.

Required Profile:
Master's degree (Bac+5) in Computer Science, Applied Mathematics, or Statistics. Strong command of Python and the data science ecosystem. Analytical mindset, intellectual curiosity, and ability to work effectively in cross-functional teams.`,
  },
  {
    icon: '⚙️',
    label: 'Data Engineer',
    title: 'Data Engineer',
    level: 'Confirmé',
    experience: 3,
    skills: ['Python', 'Spark', 'SQL', 'Airflow', 'Kafka', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS', 'ETL'],
    description: `We are looking for an experienced Data Engineer to design and maintain our data infrastructure at scale.

Key Responsibilities:
• Design, develop, and maintain robust and scalable ETL/ELT pipelines for ingesting, transforming, and loading data from diverse sources (APIs, relational databases, files, real-time streams).
• Build and optimize data warehouse, data lake, and data lakehouse architectures on cloud environments (AWS S3, Redshift, Glue) or on-premise systems.
• Implement real-time data streaming with Apache Kafka and orchestrate complex workflows using Apache Airflow.
• Ensure data quality, consistency, and freshness by implementing automated validation, monitoring, and alerting mechanisms.
• Partner with Data Scientists and analytics teams to understand their data needs and deliver reliable, well-documented datasets.
• Optimize complex SQL queries on PostgreSQL, MySQL, or Spark SQL for maximum performance.
• Containerize applications with Docker and manage deployments on Kubernetes clusters.
• Document data architectures, data flows, and data dictionaries to ensure maintainability and knowledge sharing.

Required Profile:
Master's degree (Bac+5) in Computer Science or Software Engineering. Proficiency in Python, SQL, and Big Data technologies. Detail-oriented, well-organized, and enthusiastic about large-scale technical challenges.`,
  },
  {
    icon: '💻',
    label: 'Full Stack Developer',
    title: 'Full Stack Developer',
    level: 'Confirmé',
    experience: 3,
    skills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'PostgreSQL', 'MongoDB', 'Docker', 'Git', 'REST API', 'AWS'],
    description: `We are looking for a versatile Full Stack Developer to contribute to the design and development of our web applications.

Key Responsibilities:
• Develop modern, responsive, and accessible user interfaces using React.js and TypeScript, adhering to Figma mockups and UX/UI best practices.
• Design and implement performant, secure RESTful APIs with Node.js/Express, ensuring full documentation via Swagger/OpenAPI.
• Model and manage relational databases (PostgreSQL) and NoSQL databases (MongoDB), optimizing queries and data structures for efficiency.
• Actively participate in Agile/Scrum ceremonies: sprint planning, daily stand-ups, code reviews, and retrospectives.
• Set up and maintain CI/CD pipelines (GitHub Actions, GitLab CI) to ensure continuous and reliable deployments.
• Containerize applications with Docker and deploy to AWS cloud infrastructure (EC2, S3, RDS, Lambda).
• Write unit and integration tests (Jest, Cypress) to ensure code quality and prevent regressions.
• Contribute to technical architecture discussions and propose innovative solutions to improve scalability and maintainability.

Required Profile:
Bachelor's or Master's degree (Bac+4/5) in Software Development. Strong command of JavaScript/TypeScript, React, and Node.js. Team-oriented, autonomous, and passionate about delivering high-quality web products.`,
  },
  {
    icon: '🔧',
    label: 'DevOps Engineer',
    title: 'DevOps Engineer',
    level: 'Senior',
    experience: 4,
    skills: ['Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'AWS', 'Azure', 'Linux', 'Git', 'CI/CD', 'Ansible'],
    description: `We are looking for a Senior DevOps Engineer to automate, stabilize, and optimize our infrastructure and software delivery processes.

Key Responsibilities:
• Design, deploy, and maintain end-to-end CI/CD pipelines (Jenkins, GitLab CI, GitHub Actions) to automate build, test, security scanning, and deployment phases.
• Provision and manage cloud infrastructure (AWS, Azure) as code using Terraform and Ansible, applying Infrastructure as Code (IaC) principles at scale.
• Administer and optimize Kubernetes clusters (EKS, AKS): deployments, auto-scaling, resource management, and zero-downtime rolling updates.
• Containerize applications with Docker, defining optimized and secure images for development, staging, and production environments.
• Implement monitoring, alerting, and observability solutions (Prometheus, Grafana, ELK Stack) to ensure service availability and performance.
• Manage infrastructure security: secrets management (Vault), IAM policies, Docker image vulnerability scanning, and access compliance.
• Collaborate with development teams to integrate DevSecOps best practices from the design phase onwards.
• Conduct disaster recovery exercises and ensure RTO/RPO objectives align with SLA commitments.

Required Profile:
Master's degree (Bac+5) in Computer Science or Systems & Networks. Solid experience with Linux, Kubernetes, and public cloud. AWS/Azure/GCP certifications valued. Rigorous, reactive, and with a strong automation mindset.`,
  },
  {
    icon: '🔐',
    label: 'Cyber Security',
    title: 'Cybersecurity Engineer',
    level: 'Senior',
    experience: 4,
    skills: ['Penetration Testing', 'SIEM', 'Firewall', 'Linux', 'Python', 'Wireshark', 'SOC', 'OWASP', 'ISO 27001', 'Cryptography'],
    description: `We are looking for a Senior Cybersecurity Engineer to protect our information systems and strengthen our overall security posture.

Key Responsibilities:
• Conduct comprehensive technical security audits (penetration testing, vulnerability assessments, security code reviews) on web applications, APIs, networks, and cloud infrastructure.
• Operate and improve the Security Operations Center (SOC): monitor security events via SIEM platforms (Splunk, IBM QRadar), investigate incidents, and respond to alerts.
• Define and implement the company's security policy in compliance with ISO 27001, GDPR, and frameworks including OWASP, NIST, and CIS Controls.
• Manage and configure security equipment: next-generation firewalls (NGFW), proxies, IDS/IPS, WAF, VPN, and DLP solutions.
• Lead cybersecurity awareness campaigns and training sessions for all employees across the organization.
• Continuously monitor emerging threats (CVEs, threat intelligence feeds) and apply security patches within required timeframes.
• Design secure architectures for new projects by applying Security by Design and Zero Trust principles.
• Produce detailed audit reports with risk prioritization and remediation plans for both technical teams and executive leadership.

Required Profile:
Master's degree (Bac+5) in Information Security or Networks. Valued certifications: OSCP, CEH, CISSP, CISM. Strong knowledge of Linux, TCP/IP networking, and security protocols. Analytical, discreet, and responsive in incident situations.`,
  },
  {
    icon: '📱',
    label: 'Mobile Developer',
    title: 'Mobile Developer',
    level: 'Confirmé',
    experience: 2,
    skills: ['Flutter', 'React Native', 'Dart', 'JavaScript', 'iOS', 'Android', 'Firebase', 'REST API', 'Git', 'UI/UX'],
    description: `We are looking for a passionate Mobile Developer to design and build high-impact mobile applications for iOS and Android.

Key Responsibilities:
• Develop high-performance, smooth cross-platform mobile applications using Flutter (Dart) or React Native (JavaScript/TypeScript), ensuring an optimal user experience on both iOS and Android.
• Implement pixel-perfect user interfaces that faithfully reproduce Figma mockups, following Apple Human Interface Guidelines and Google Material Design principles.
• Integrate RESTful APIs and third-party services (Firebase, Google Maps, online payments, push notifications via FCM/APNs).
• Manage application state with appropriate solutions (Provider, Riverpod, Redux, MobX) and implement a clean architecture (Clean Architecture, MVVM).
• Optimize application performance: startup time, animation smoothness, memory consumption, and battery efficiency.
• Write unit and widget tests to ensure stability and prevent regressions in critical features.
• Prepare, sign, and publish applications on the App Store (Apple) and Google Play Store, managing release cycles and user feedback.
• Provide ongoing maintenance and feature evolution for existing applications and participate in regular code reviews.

Required Profile:
Bachelor's or Master's degree (Bac+4/5) in Software Development. Proficiency in Flutter or React Native with published applications in your portfolio. Strong UX attention to detail, autonomy, and passion for mobile technologies.`,
  },
  {
    icon: '☁️',
    label: 'Cloud Architect',
    title: 'Cloud Architect',
    level: 'Expert',
    experience: 6,
    skills: ['AWS', 'Azure', 'GCP', 'Terraform', 'Kubernetes', 'Docker', 'Microservices', 'CI/CD', 'Security', 'Serverless'],
    description: `We are looking for an Expert Cloud Architect to design and drive our cloud strategy and modernize our enterprise infrastructure at scale.

Key Responsibilities:
• Define and evolve the company's cloud architecture across AWS, Azure, and/or GCP, aligning technical decisions with business objectives, cost constraints, and security requirements.
• Lead cloud migration projects (lift & shift, re-platforming, re-architecting) and guide teams in adopting cloud-native services and patterns.
• Design highly available, resilient, and scalable architectures based on microservices, containers (Kubernetes), and serverless approaches (Lambda, Azure Functions, Cloud Run).
• Standardize Infrastructure as Code practices with Terraform and Ansible, and define reusable architecture blueprints for project teams.
• Define cloud governance policies: cost management (FinOps), identity and access management (IAM), data encryption, and regulatory compliance (GDPR, SOC2).
• Evaluate and select cloud vendors and services through comparative studies (POC/POV) and cost-benefit analyses.
• Coach development and DevOps teams on cloud technologies and architectural best practices, fostering a cloud-native culture.
• Produce architecture documentation (ADRs, C4 diagrams, RFCs) and participate in architecture review boards to validate new initiatives.

Required Profile:
Master's degree (Bac+5) in Computer Science or Information Systems. Cloud certifications required (AWS Solutions Architect Professional, Azure Solutions Architect Expert, or GCP Professional Cloud Architect). Technical leadership, strategic vision, and excellent communication skills.`,
  },
  {
    icon: '🤖',
    label: 'ML Engineer',
    title: 'Machine Learning Engineer',
    level: 'Senior',
    experience: 4,
    skills: ['Python', 'TensorFlow', 'PyTorch', 'MLflow', 'Kubeflow', 'Docker', 'Spark', 'SQL', 'REST API', 'Git'],
    description: `We are looking for a Senior Machine Learning Engineer to industrialize and deploy our AI models into production at scale.

Key Responsibilities:
• Own the complete machine learning model lifecycle: from the experimentation phase through to production deployment and ongoing monitoring.
• Design and maintain robust, automated MLOps pipelines using MLflow, Kubeflow, or Metaflow for experiment versioning, artifact management, and automated retraining triggers.
• Build high-performance inference APIs (FastAPI, Flask) and deploy them in Docker containers orchestrated by Kubernetes, ensuring scalability and high availability.
• Implement model monitoring mechanisms in production: data drift detection, model drift detection, performance metric tracking, and automated alerting systems.
• Optimize model performance (quantization, pruning, distillation, ONNX optimization) to reduce inference latency and infrastructure costs.
• Partner closely with Data Scientists to transform Jupyter notebook prototypes into maintainable, tested, and well-documented production-grade code.
• Build and maintain reusable feature engineering pipelines via feature stores (Feast, Tecton) and ensure train/serve consistency.
• Contribute to defining MLOps best practices and shape the technical roadmap of the internal AI platform.

Required Profile:
Master's degree (Bac+5) in Computer Science, Mathematics, or AI. Solid experience with Python, TensorFlow/PyTorch, and model deployment. Software engineering rigor combined with a deep understanding of machine learning algorithms.`,
  },
  {
    icon: '🗄️',
    label: 'Backend Developer',
    title: 'Backend Developer',
    level: 'Confirmé',
    experience: 3,
    skills: ['Python', 'FastAPI', 'Django', 'PostgreSQL', 'Redis', 'Docker', 'REST API', 'Git', 'Linux', 'Microservices'],
    description: `We are looking for a confirmed Backend Developer to design and maintain the services and APIs powering our high-traffic applications.

Key Responsibilities:
• Design, develop, and maintain performant, secure, and well-documented RESTful and GraphQL APIs using Python (FastAPI, Django REST Framework).
• Model relational databases in PostgreSQL: schema design, migration scripts, query optimization, and appropriate indexing strategies.
• Implement distributed caching mechanisms with Redis to reduce database load and improve response times across services.
• Architect and develop decoupled microservices, leveraging asynchronous message queues (RabbitMQ, Kafka, Celery) for background processing tasks.
• Ensure API security: JWT/OAuth2 authentication, authorization management, and protection against SQL injection, XSS, and other OWASP vulnerabilities.
• Write unit, integration, and load tests (pytest, Locust) to guarantee service reliability and performance under peak traffic conditions.
• Containerize services with Docker and contribute to CI/CD pipelines to automate deployments across staging and production environments.
• Conduct code reviews, document APIs with Swagger/OpenAPI, and share engineering best practices across the team.

Required Profile:
Bachelor's or Master's degree (Bac+4/5) in Computer Science or Software Engineering. Strong command of Python and backend web frameworks. Good understanding of distributed systems, databases, and large-scale performance challenges.`,
  },
  {
    icon: '🎨',
    label: 'Frontend Developer',
    title: 'Frontend Developer',
    level: 'Confirmé',
    experience: 2,
    skills: ['React', 'TypeScript', 'JavaScript', 'TailwindCSS', 'HTML', 'CSS', 'Git', 'Figma', 'REST API', 'Jest'],
    description: `We are looking for a creative and detail-oriented Frontend Developer to craft exceptional user experiences across our web applications.

Key Responsibilities:
• Develop modern, responsive, and accessible (WCAG 2.1) user interfaces with React.js and TypeScript, ensuring cross-browser and cross-device compatibility.
• Faithfully translate Figma mockups and prototypes into reusable React components, adhering to the design system and brand standards.
• Integrate RESTful and GraphQL APIs provided by backend teams, managing global application state with Redux Toolkit or React Query.
• Optimize web application performance: lazy loading, code splitting, image optimization, Core Web Vitals improvement (LCP, FID, CLS), and Lighthouse score enhancement.
• Set up and maintain a shared UI component library (Storybook) used across multiple product teams.
• Write unit tests (Jest, React Testing Library) and end-to-end tests (Cypress, Playwright) to ensure stability of critical user flows.
• Collaborate closely with UX designers, Product Managers, and backend developers in an Agile/Scrum environment.
• Monitor the JavaScript/React ecosystem for emerging technologies and continuously propose improvements to the frontend architecture.

Required Profile:
Bachelor's or Master's degree (Bac+4/5) in Web Development or Computer Science. Strong command of React, TypeScript, and modern frontend tooling. Aesthetic sensibility, code quality focus, and strong user experience orientation.`,
  },
]

export default function CreateOffer() {
  const navigate = useNavigate()
  const [title, setTitle]         = useState('')
  const [desc, setDesc]           = useState('')
  const [exp, setExp]             = useState(2)
  const [level, setLevel]         = useState('Confirmé')
  const [skills, setSkills]       = useState([])
  const [showTemplates, setShowTemplates] = useState(false)

  const applyTemplate = (tpl) => {
    setTitle(tpl.title)
    setDesc(tpl.description)
    setExp(tpl.experience)
    setLevel(tpl.level)
    setSkills(tpl.skills)
    setShowTemplates(false)
    setSaved(false)
    setSavedOffer(null)
  }
  const [skillInput, setSkillInput] = useState('')
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [error, setError]         = useState('')

  const addSkill = (s = skillInput) => {
    const val = s.trim()
    if (val && !skills.includes(val)) setSkills(prev => [...prev, val])
    setSkillInput('')
  }
  const removeSkill = s => setSkills(prev => prev.filter(x => x !== s))

  const [savedOffer, setSavedOffer] = useState(null)
  const [publishing, setPublishing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) { setError('Le titre est obligatoire.'); return }
    setSaving(true); setError('')
    try {
      const res = await api.post('/offers', {
        title, description: desc,
        experience: Number(exp), level, skills,
      })
      setSavedOffer(res.data)
      setSaved(true)
    } catch (err) {
      setError(parseApiError(err, 'Erreur lors de la création.'))
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!savedOffer) return
    setPublishing(true)
    try {
      await api.patch(`/offers/${savedOffer.id}/publish?published=true`)
      navigate('/applications')
    } catch {
      navigate('/applications')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ── Header ── */}
      <div>
        <h1 className="page-title">Create an Offer</h1>
        <p className="page-sub">Define the position and requirements for AI matching.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="col-span-2 space-y-5">

          {/* ── Templates IT ── */}
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-violet-500" />
                <p className="text-sm font-bold text-gray-700">Predefined IT Templates</p>
                <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {IT_TEMPLATES.length} modèles
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplates(v => !v)}
                className="flex items-center gap-1.5 text-xs font-semibold text-violet-600
                           hover:text-violet-700 transition-colors"
              >
                {showTemplates ? 'Hide' : 'Choose a template'}
                <ChevronDown size={13} className={`transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showTemplates && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {IT_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100
                               bg-white hover:border-violet-300 hover:bg-violet-50 transition-all text-left group"
                  >
                    <span className="text-xl flex-shrink-0">{tpl.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 group-hover:text-violet-700 truncate">
                        {tpl.label}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {tpl.level} · {tpl.experience} ans · {tpl.skills.length} skills
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!showTemplates && (
              <p className="text-xs text-gray-400 mt-2">
                Select a template to auto-fill the form.
              </p>
            )}
          </div>

          {/* Title */}
          <div className="card p-6">
            <label className="field-label">Job Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex : Data Engineer Senior"
              className="field-input text-base font-semibold"
              autoFocus
            />
          </div>

          {/* Level + Exp */}
          <div className="card p-6">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="field-label">Job Level</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {LEVELS.map(l => (
                    <button
                      key={l} type="button"
                      onClick={() => setLevel(l)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all
                        ${level === l
                          ? 'border-violet-500 bg-violet-50 text-violet-700 shadow-sm'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="field-label">Required Experience</label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="range" min={0} max={20} value={exp}
                    onChange={e => setExp(e.target.value)}
                    className="flex-1 accent-violet-600"
                  />
                  <div
                    className="w-16 py-2 rounded-xl text-center font-black text-sm font-mono-num"
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                      color: 'white',
                    }}
                  >
                    {exp} an{exp > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="card p-6">
            <label className="field-label">Required Skills</label>

            {/* Input row */}
            <div className="flex gap-2 mt-1">
              <input
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill() } }}
                placeholder="Ex: Python, SQL, Docker... (Entrée pour ajouter)"
                className="field-input flex-1"
              />
              <button
                type="button" onClick={() => addSkill()}
                disabled={!skillInput.trim()}
                className="btn-primary px-4 py-0 text-sm"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Suggestions */}
            <div className="mt-3">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-2">
                Quick suggestions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGEST_SKILLS.filter(s => !skills.includes(s)).slice(0, 10).map(s => (
                  <button
                    key={s} type="button" onClick={() => addSkill(s)}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold
                               bg-gray-100 text-gray-500 hover:bg-violet-50 hover:text-violet-700
                               border border-transparent hover:border-violet-200 transition-all"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected skills */}
            {skills.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-2">
                  Selected skills ({skills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map(s => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full
                                 text-xs font-semibold font-mono bg-white border border-violet-200
                                 text-violet-700 shadow-sm"
                    >
                      {s}
                      <button
                        type="button" onClick={() => removeSkill(s)}
                        className="text-violet-400 hover:text-red-400 transition-colors"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="card p-6">
            <label className="field-label">Job Description</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={5}
              placeholder="Décrivez les missions, l'environnement de travail, les responsabilités..."
              className="field-textarea mt-1"
            />
          </div>

          {/* Alerts */}
          {error && <div className="alert-err"><span>⚠</span>{error}</div>}

          {saved ? (
            <div className="space-y-3">
              <div className="alert-ok">
                <CheckCircle2 size={16} className="flex-shrink-0" />
                Offer created successfully!
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={publishing}
                  className="btn-primary py-3.5 text-sm"
                >
                  {publishing
                    ? <><Loader2 size={15} className="animate-spin" /> Publishing...</>
                    : '🌐  Publish Offer'
                  }
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/applications')}
                  className="py-3.5 rounded-xl border-2 border-gray-200 text-sm font-bold
                             text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Later →
                </button>
              </div>
            </div>
          ) : (
            <button type="submit" disabled={saving} className="btn-primary w-full py-4 text-sm">
              {saving
                ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
                : '💾  Save Offer'
              }
            </button>
          )}
        </form>

        {/* ── Live Preview ── */}
        <div className="space-y-4">
          <div className="card p-6 sticky top-6">
            <p className="section-label">Live Preview</p>

            {/* Title */}
            <div className="mb-4">
              <h3 className="font-extrabold text-gray-900 text-lg leading-tight">
                {title || <span className="text-gray-300">Titre du poste...</span>}
              </h3>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="pill-found">{level}</span>
              <span className="pill-neutral">{exp} an{exp > 1 ? 's' : ''} exp.</span>
            </div>

            {/* Skills */}
            {skills.length > 0 ? (
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                  Skills ({skills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map(s => (
                    <span key={s} className="pill-found">{s}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-gray-300 text-xs">
                Ajoutez des compétences
              </div>
            )}

            {/* Description preview */}
            {desc && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">
                  Description
                </p>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-4">{desc}</p>
              </div>
            )}
          </div>

          {/* Next step hint */}
          <div
            className="card p-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #f5f3ff, #eff6ff)' }}
          >
            <span className="text-2xl">📁</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-700">Next Step</p>
              <p className="text-xs text-gray-400 mt-0.5">Upload & analyse des CVs</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  )
}
