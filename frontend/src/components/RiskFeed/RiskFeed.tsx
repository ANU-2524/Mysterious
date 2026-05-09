import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAlerts } from '@/api/risks'
import type { AlertRecord } from '@/api/risks'
import { useUIStore } from '@/store/uiStore'
import { SeverityBadge } from '@/components/SeverityBadge'
import { formatDistanceToNow } from '@/utils/time'

export function RiskFeed() {
  const { data: alerts, isLoading } = useAlerts(24)
  const [liveAlerts, setLiveAlerts] = useState<AlertRecord[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const selectEntity = useUIStore((s) => s.selectEntity)

  // Merge API alerts with live WebSocket alerts
  useEffect(() => {
    if (alerts) setLiveAlerts(alerts)
  }, [alerts])

  // WebSocket live feed
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/api/risks/live`

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string) as Record<string, unknown>
          if (msg.type === 'alert') {
            setLiveAlerts((prev) => [msg as unknown as AlertRecord, ...prev.slice(0, 49)])
          }
        } catch {
          // ignore parse errors
        }
      }

      // Keep-alive ping
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send('ping')
      }, 30_000)

      return () => {
        clearInterval(pingInterval)
        ws.close()
      }
    } catch {
      return undefined
    }
  }, [])

  return (
    <div className="flex flex-col h-full bg-cosmic-bg-secondary/30">
      <div className="px-4 py-3 border-b border-cosmic-border flex items-center justify-between bg-black/40">
        <div className="flex flex-col">
          <h2 className="text-xs font-bold text-white uppercase tracking-widest">Signal Monitor</h2>
          <span className="text-[10px] text-cosmic-cyan/50 font-mono">CHANNEL: 0x88-RISK</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-cosmic-green/20 bg-cosmic-green/5">
          <span className="w-1.5 h-1.5 rounded-full bg-cosmic-green animate-pulse shadow-[0_0_5px_rgba(52,199,89,0.8)]" />
          <span className="text-[10px] text-cosmic-green font-mono font-bold">STREAMING</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card animate-pulse h-20" />
            ))}
          </div>
        )}

        <AnimatePresence initial={false}>
          {liveAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: -20, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCard
                alert={alert}
                onClick={() => selectEntity({ id: alert.entity_id, name: alert.entity_name })}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {!isLoading && liveAlerts.length === 0 && (
          <div className="text-center py-8 text-cosmic-text-muted text-sm">
            No alerts in the last 24 hours
          </div>
        )}
      </div>
    </div>
  )
}

function AlertCard({ alert, onClick }: { alert: AlertRecord; onClick: () => void }) {
  const borderColor = {
    CRITICAL: 'border-l-cosmic-red',
    HIGH: 'border-l-cosmic-amber',
    MEDIUM: 'border-l-yellow-600',
    LOW: 'border-l-cosmic-cyan',
  }[alert.severity] ?? 'border-l-cosmic-border'

  const glowColor = {
    CRITICAL: 'group-hover:shadow-[0_0_15px_rgba(255,59,48,0.2)]',
    HIGH: 'group-hover:shadow-[0_0_15px_rgba(255,184,0,0.15)]',
    MEDIUM: 'group-hover:shadow-[0_0_15px_rgba(234,179,8,0.1)]',
    LOW: 'group-hover:shadow-[0_0_15px_rgba(0,212,255,0.1)]',
  }[alert.severity] ?? ''

  return (
    <button
      onClick={onClick}
      className={`w-full text-left card-intelligence border-l-2 ${borderColor} ${glowColor} p-2 hover:bg-cosmic-cyan/5 transition-all duration-300 group`}
      aria-label={`View details for ${alert.entity_name}`}
    >
      <div className="flex items-start justify-between gap-1 mb-1">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-cosmic-text-muted uppercase tracking-tighter">Entity ID: {alert.entity_id.toString().padStart(3, '0')}</span>
          <span className="text-sm font-bold text-white tracking-tight group-hover:text-cosmic-cyan transition-colors">
            {alert.entity_name}
          </span>
        </div>
        <SeverityBadge severity={alert.severity} />
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-cosmic-border/30">
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-cosmic-text-muted uppercase">Risk Index</span>
          <span className="text-xs font-mono font-bold text-cosmic-cyan">
             {alert.current_score?.toFixed(1) ?? 'N/A'}/100
          </span>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-mono text-cosmic-text-muted block uppercase">Interval</span>
          <span className="text-[11px] text-white/70 font-mono">
            T-{formatDistanceToNow(alert.triggered_at)}
          </span>
        </div>
      </div>
    </button>
  )
}
