import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

function safeParseUser() {
  try {
    const saved = localStorage.getItem('sm_user')
    const parsed = saved ? JSON.parse(saved) : null
    // Restaurer le header Authorization si token présent
    if (parsed?.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`
    }
    return parsed
  } catch {
    // localStorage corrompu → reset propre
    localStorage.removeItem('sm_user')
    localStorage.removeItem('sm_token')
    localStorage.removeItem('sm_openai')
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(safeParseUser)

  const login = useCallback(async (username, password) => {
    const res = await api.post('/auth/login', { username, password })
    const { token, username: uname } = res.data
    localStorage.setItem('sm_token', token)
    localStorage.setItem('sm_user', JSON.stringify({ username: uname, token }))
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser({ username: uname, token })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('sm_token')
    localStorage.removeItem('sm_user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
