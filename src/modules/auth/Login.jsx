import { useState } from 'react'
import { supabase } from '../../utils/supabase'
import { useTheme } from '../../utils/theme'

export function Login() {
  const t = useTheme()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Compte créé ! Vérifiez votre email pour confirmer votre inscription.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', height: 36, padding: '0 12px',
    border: `0.5px solid ${t.border}`, borderRadius: 8,
    background: t.bg, color: t.text, fontSize: 14,
    boxSizing: 'border-box', outline: 'none',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  }

  const labelStyle = {
    fontSize: 12, fontWeight: 500, color: t.textSecondary,
    display: 'block', marginBottom: 5,
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: t.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      padding: 16,
    }}>
      <div style={{
        background: t.bgSurface,
        border: `0.5px solid ${t.border}`,
        borderRadius: 16,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 380,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: t.accent, margin: '0 auto 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: t.text, margin: '0 0 4px' }}>
            VO Platform
          </h1>
          <p style={{ fontSize: 13, color: t.textMuted, margin: 0 }}>
            {mode === 'login' ? 'Connectez-vous à votre espace' : 'Créez votre compte professionnel'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Adresse email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="votre@email.com"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{
              marginBottom: 14, padding: '8px 12px', borderRadius: 8,
              background: '#FEE2E2', color: '#DC2626', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              marginBottom: 14, padding: '8px 12px', borderRadius: 8,
              background: '#D1FAE5', color: '#065F46', fontSize: 13,
            }}>
              {success}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%', height: 38, borderRadius: 8,
              background: loading ? t.bgTertiary : t.accent,
              color: '#fff', border: 'none',
              fontSize: 14, fontWeight: 600,
              cursor: loading ? 'default' : 'pointer',
              transition: 'background 0.15s',
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          >
            {loading
              ? '…'
              : mode === 'login' ? 'Se connecter' : 'Créer le compte'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <span style={{ fontSize: 13, color: t.textMuted }}>
            {mode === 'login' ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
          </span>
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess('') }}
            style={{
              background: 'none', border: 'none',
              color: t.accent, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', padding: 0,
            }}
          >
            {mode === 'login' ? 'Créer un compte' : 'Se connecter'}
          </button>
        </div>
      </div>
    </div>
  )
}
