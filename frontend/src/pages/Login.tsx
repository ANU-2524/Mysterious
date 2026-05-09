import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '@/api/client'
import { useAuthStore } from '@/store/authStore'

export function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('analyst')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const endpoint = isRegistering ? '/auth/register' : '/auth/login'
      const payload = isRegistering 
        ? { email, password, role } 
        : { email, password }

      const { data } = await apiClient.post<{ access_token: string }>(endpoint, payload)

      // Decode JWT to extract user info (simple base64 decode)
      try {
        const base64Url = data.access_token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))
        
        const jwtPayload = JSON.parse(jsonPayload)
        console.log('Decoded token:', jwtPayload)
        
        setAuth(data.access_token, jwtPayload.email || jwtPayload.sub, jwtPayload.role || 'ANALYST')
        navigate('/app') // Changed from '/' to '/app' to ensure proper routing
      } catch (decodeErr) {
        console.error('Failed to decode token:', decodeErr)
        setError('Session initialization failed. Please try again.')
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(err.response?.data?.detail ?? (isRegistering ? 'Registration failed' : 'Login failed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#020205]">
      <div className="scanline" />
      
      {/* High-tech background elements */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(0,212,255,0.1)_0%,_transparent_50%)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cosmic-cyan/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] animate-pulse-slow" />
      </div>

      <div className="card-intelligence max-w-md w-full border-cosmic-cyan/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 p-8 backdrop-blur-xl">
        {/* Logo Unit */}
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="relative group mb-4">
            <div className="w-16 h-16 rounded-xl bg-cosmic-cyan/10 border border-cosmic-cyan/40 flex items-center justify-center group-hover:border-cosmic-cyan transition-all duration-500 overflow-hidden">
               <span className="text-cosmic-cyan text-2xl font-bold font-mono">RL</span>
               <div className="absolute inset-0 bg-gradient-to-t from-cosmic-cyan/20 to-transparent" />
            </div>
            <div className="absolute -inset-2 bg-cosmic-cyan/10 blur-xl opacity-50 rounded-full" />
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tighter text-white leading-none">
              RISK<span className="text-cosmic-cyan">LENS</span>
            </h1>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cosmic-text-muted mt-2 border-t border-cosmic-border pt-1">
              Auth Gateway // Node 01
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="block text-[10px] font-mono text-cosmic-text-muted uppercase tracking-[0.2em]">
              User Identifier
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ACCESS_EMAIL@SYSTEM"
                className="w-full bg-black/40 border border-cosmic-border px-4 py-3 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-cosmic-cyan focus:ring-1 focus:ring-cosmic-cyan/30 transition-all placeholder:opacity-30"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono text-cosmic-text-muted uppercase tracking-[0.2em]">
              Security Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-cosmic-border px-4 py-3 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-cosmic-cyan focus:ring-1 focus:ring-cosmic-cyan/30 transition-all placeholder:opacity-30"
                required
                autoComplete={isRegistering ? "new-password" : "current-password"}
              />
            </div>
          </div>

          {isRegistering && (
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-cosmic-text-muted uppercase tracking-[0.2em]">
                Access Level
              </label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-black/40 border border-cosmic-border px-4 py-3 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-cosmic-cyan transition-all appearance-none"
              >
                <option value="analyst">LEVEL 03: ANALYST</option>
                <option value="viewer">LEVEL 01: VIEWER</option>
              </select>
            </div>
          )}

          {error && (
            <div className="bg-cosmic-red/10 border border-cosmic-red/30 rounded p-3 text-[11px] font-mono text-cosmic-red animate-shake">
              <span className="font-bold mr-2">[ERROR_AUTH]:</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-cosmic-cyan hover:bg-[#00e5ff] text-black font-bold py-3 rounded-lg transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:grayscale font-mono text-sm tracking-widest shadow-[0_0_20px_rgba(0,212,255,0.2)]"
          >
            {isLoading 
              ? (isRegistering ? "INITIALIZING..." : "LOGGING_IN...") 
              : (isRegistering ? "INITIALIZE_IDENTITY" : "ESTABLISH_SESSION")}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-4">
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-[10px] font-mono text-cosmic-text-muted hover:text-cosmic-cyan transition-colors uppercase tracking-widest underline underline-offset-4 decoration-cosmic-border"
          >
            {isRegistering ? '// Return to established node' : '// Request new credentials'}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-cosmic-border">
          <p className="text-xs text-cosmic-text-muted text-center mb-2">Demo Credentials:</p>
          <div className="space-y-1 text-xs text-cosmic-text-secondary italic opacity-70 text-center">
            <p>test@test.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  )
}

