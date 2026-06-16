import React, { Component } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './index.css'

class RootErrorBoundary extends Component {
  state = { error: null, info: null }

  static getDerivedStateFromError(err) {
    return { error: err }
  }

  componentDidCatch(err, info) {
    this.setState({ info })
    console.error('[App Error]', err, info)
  }

  handleReset = () => {
    localStorage.clear()
    window.location.href = '/'
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: '40px 60px', fontFamily: 'Inter, sans-serif',
          background: '#fff1f2', minHeight: '100vh', color: '#b91c1c'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
            ⚠ Erreur de l'application
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
            Une erreur inattendue s'est produite. Détails ci-dessous :
          </p>
          <pre style={{
            background: '#fee2e2', padding: '16px', borderRadius: '10px',
            fontSize: '12px', whiteSpace: 'pre-wrap', marginBottom: '20px',
            border: '1px solid #fca5a5', maxHeight: '300px', overflow: 'auto'
          }}>
            {this.state.error?.toString()}
            {this.state.info?.componentStack}
          </pre>
          <button
            onClick={this.handleReset}
            style={{
              background: '#7c3aed', color: 'white', border: 'none',
              padding: '10px 24px', borderRadius: '8px', fontSize: '14px',
              fontWeight: 600, cursor: 'pointer'
            }}
          >
            Réinitialiser et se reconnecter
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </RootErrorBoundary>
  </React.StrictMode>
)
