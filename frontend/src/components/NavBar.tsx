import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useWatchlist } from '@/api/watchlist'
import { useUIStore } from '@/store/uiStore'
import { useState, useRef, useEffect } from 'react'
import { SeverityBadge } from '@/components/SeverityBadge'

const NAV_LINKS = [
  { path: '/app', label: 'Galaxy Map' },
  { path: '/app/dashboard', label: 'Dashboard' },
  { path: '/app/timeline', label: 'Timeline' },
  { path: '/app/reports', label: 'Reports' },
]

export function NavBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { email, role, clearAuth } = useAuthStore()
  const { data: watchlist } = useWatchlist()
  const selectEntity = useUIStore((s) => s.selectEntity)
  
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsWatchlistOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-cosmic-border bg-cosmic-bg-secondary/80 backdrop-blur-sm z-50 flex-shrink-0">
      {/* Logo */}
      <Link to="/app" className="flex items-center gap-3 group">
        <div className="w-8 h-8 rounded-full bg-cosmic-cyan/20 border border-cosmic-cyan/40 flex items-center justify-center group-hover:shadow-cyan-glow transition-all duration-300">
          <span className="text-cosmic-cyan text-sm font-bold">L</span>
        </div>
        <span className="font-semibold text-cosmic-text-primary tracking-wide">
          <span className="text-gradient-cyan">RiskLens</span>
          <span className="text-cosmic-text-muted text-xs ml-2 font-mono uppercase tracking-tighter">risk intelligence</span>
        </span>
      </Link>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-1">
        {NAV_LINKS.map((link) => {
          const isActive = location.pathname === link.path
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`relative px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-cosmic-cyan'
                  : 'text-cosmic-text-secondary hover:text-cosmic-text-primary'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-cosmic-cyan-glow border border-cosmic-cyan/20 rounded-lg"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">{link.label}</span>
            </Link>
          )
        })}

        {/* Watchlist Dropdown */}
        <div className="relative ml-2" ref={dropdownRef}>
          <button
            onClick={() => setIsWatchlistOpen(!isWatchlistOpen)}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all duration-200 border ${
              isWatchlistOpen 
                ? 'bg-cosmic-bg-elevated border-cosmic-cyan text-cosmic-cyan shadow-cyan-glow-sm' 
                : 'bg-transparent border-cosmic-border-light text-cosmic-text-secondary hover:text-cosmic-text-primary hover:border-cosmic-border'
            }`}
          >
            <span>Watchlist</span>
            {watchlist && watchlist.length > 0 && (
              <span className="bg-cosmic-cyan/20 text-cosmic-cyan text-[10px] px-1.5 py-0.5 rounded-full border border-cosmic-cyan/30">
                {watchlist.length}
              </span>
            )}
            <span className={`transition-transform duration-200 ${isWatchlistOpen ? 'rotate-180' : ''}`}>▾</span>
          </button>

          <AnimatePresence>
            {isWatchlistOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 top-full mt-2 w-72 bg-cosmic-bg-secondary border border-cosmic-border rounded-xl shadow-2xl z-[100] overflow-hidden backdrop-blur-md"
              >
                <div className="p-3 border-b border-cosmic-border flex items-center justify-between">
                  <span className="text-xs font-semibold text-cosmic-text-muted uppercase tracking-wider">Monitored Entities</span>
                  <Link to="/app/dashboard" className="text-[10px] text-cosmic-cyan hover:underline" onClick={() => setIsWatchlistOpen(false)}>Full List</Link>
                </div>
                
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {watchlist?.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-xs text-cosmic-text-muted italic">Watchlist is empty</p>
                    </div>
                  ) : (
                    watchlist?.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          selectEntity({ id: item.entity_id, name: item.entity_name })
                          setIsWatchlistOpen(false)
                        }}
                        className="p-3 hover:bg-cosmic-bg-elevated cursor-pointer border-b border-cosmic-border/30 last:border-0 transition-colors group"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-cosmic-text-primary group-hover:text-cosmic-cyan truncate transition-colors">
                              {item.entity_name}
                            </p>
                            <p className="text-[10px] text-cosmic-text-secondary truncate">{item.sector}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-bold font-mono text-cosmic-cyan">{item.current_risk_score?.toFixed(1) ?? '—'}</p>
                            <SeverityBadge severity={item.severity ?? 'LOW'} />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* User info */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs text-cosmic-text-secondary">{email}</span>
          <span className="text-xs font-mono text-cosmic-cyan uppercase">{role}</span>
        </div>
        <button
          onClick={handleLogout}
          className="btn-ghost text-sm py-1.5"
          aria-label="Sign out"
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}
