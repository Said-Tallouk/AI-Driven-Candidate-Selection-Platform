/**
 * Convertit une erreur Axios/FastAPI en string affichable.
 * FastAPI peut renvoyer detail comme string ou comme tableau d'objets Pydantic.
 */
export function parseApiError(err, fallback = 'Une erreur est survenue.') {
  if (!err?.response) {
    return 'Impossible de joindre le serveur. Vérifiez que le backend est démarré (port 8000).'
  }
  const detail = err.response?.data?.detail
  if (!detail) return fallback
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map(d => d.msg || JSON.stringify(d)).join(' · ')
  }
  return JSON.stringify(detail)
}
