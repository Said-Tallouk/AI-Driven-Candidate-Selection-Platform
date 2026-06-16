import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

// Inject token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sm_token')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

// Redirect to login on 401 — sauf pour le endpoint de login lui-même
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginCall = err.config?.url?.includes('/auth/login')
    if (err.response?.status === 401 && !isLoginCall) {
      localStorage.removeItem('sm_token')
      localStorage.removeItem('sm_user')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export default api
