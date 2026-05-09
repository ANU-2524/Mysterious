import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { useDashboardStats, useSectorRisks } from '@/api/risks'
import { useWatchlist } from '@/api/watchlist'
import { SeverityBadge } from '@/components/SeverityBadge'
import { useUIStore } from '@/store/uiStore'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export function DashboardPage() {
  const { data: stats } = useDashboardStats()
  const { data: sectors } = useSectorRisks()
  const { data: watchlist } = useWatchlist()
  const selectEntity = useUIStore((s) => s.selectEntity)

  return (
    <div className="p-6 space-y-6 relative">
      <div className="scanline" />
      <div className="flex justify-between items-end border-b border-cosmic-border pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">TERMINAL <span className="text-cosmic-cyan">01</span></h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cosmic-green animate-pulse" />
            <p className="text-[10px] font-mono uppercase tracking-widest text-cosmic-text-muted">Live Security Intelligence // System Active</p>
          </div>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-[10px] font-mono text-cosmic-text-muted">LATENCY: 24ms</p>
          <p className="text-[10px] font-mono text-cosmic-text-muted">UPTIME: 99.9%</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Entities Monitored" value={stats?.total_entities ?? 0} color="cyan" />
        <StatCard label="Alerts Today" value={stats?.alerts_today ?? 0} color="amber" />
        <StatCard label="Critical Alerts" value={stats?.critical_today ?? 0} color="red" />
        <StatCard label="Avg Risk Score" value={stats?.avg_risk_score.toFixed(1) ?? '0.0'} color="cyan" />
      </div>

      {/* Highest risk entity */}
      {stats?.highest_risk_entity && (
        <div className="card border-l-4 border-l-cosmic-red">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-cosmic-text-muted uppercase tracking-wider mb-1">Highest Risk Entity</p>
              <button
                onClick={() => selectEntity({ id: stats.highest_risk_entity!.id, name: stats.highest_risk_entity!.name })}
                className="text-lg font-semibold text-cosmic-text-primary hover:text-cosmic-cyan transition-colors"
              >
                {stats.highest_risk_entity.name}
              </button>
              <p className="text-xs text-cosmic-text-secondary mt-1">{stats.highest_risk_entity.sector}</p>
            </div>
            <div className="text-right">
              <SeverityBadge severity={stats.highest_risk_entity.severity} />
              <p className="text-2xl font-bold font-mono text-cosmic-red mt-2">
                {stats.highest_risk_entity.score.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sector risk chart */}
      <div className="grid grid-cols-1 gap-6">
        {sectors && sectors.length > 0 && (
          <div className="card">
            <h2 className="text-sm font-semibold text-cosmic-text-primary mb-4">Risk by Sector</h2>
            <div className="h-64">
              <Bar
                data={{
                  labels: sectors.map((s) => s.sector),
                  datasets: [
                    {
                      label: 'Avg Risk Score',
                      data: sectors.map((s) => s.avg_risk_score),
                      backgroundColor: 'rgba(0, 212, 255, 0.6)',
                      borderColor: '#00D4FF',
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: 'rgba(13, 13, 32, 0.95)',
                      titleColor: '#E8E8F0',
                      bodyColor: '#8888aa',
                      borderColor: 'rgba(0, 212, 255, 0.3)',
                      borderWidth: 1,
                    },
                  },
                  scales: {
                    x: {
                      grid: { color: 'rgba(255, 255, 255, 0.05)' },
                      ticks: { color: '#555570' },
                    },
                    y: {
                      min: 0,
                      max: 100,
                      grid: { color: 'rgba(255, 255, 255, 0.05)' },
                      ticks: { color: '#555570' },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Sector table */}
      {sectors && sectors.length > 0 && (
        <div className="card overflow-x-auto">
          <h2 className="text-sm font-semibold text-cosmic-text-primary mb-4">Sector Details</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cosmic-border">
                <th className="text-left py-2 text-cosmic-text-muted font-medium">Sector</th>
                <th className="text-right py-2 text-cosmic-text-muted font-medium">Entities</th>
                <th className="text-right py-2 text-cosmic-text-muted font-medium">Avg Score</th>
                <th className="text-right py-2 text-cosmic-text-muted font-medium">Max Score</th>
                <th className="text-left py-2 text-cosmic-text-muted font-medium">Top Risk</th>
              </tr>
            </thead>
            <tbody>
              {sectors.map((sector) => (
                <tr key={sector.sector} className="border-b border-cosmic-border/50 hover:bg-cosmic-bg-elevated transition-colors">
                  <td className="py-2 text-cosmic-text-primary">{sector.sector}</td>
                  <td className="py-2 text-right text-cosmic-text-secondary">{sector.entity_count}</td>
                  <td className="py-2 text-right font-mono text-cosmic-cyan">{sector.avg_risk_score.toFixed(1)}</td>
                  <td className="py-2 text-right font-mono text-cosmic-amber">{sector.max_risk_score.toFixed(1)}</td>
                  <td className="py-2 text-cosmic-text-secondary">{sector.top_entity ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: 'cyan' | 'amber' | 'red' }) {
  const colorClass = {
    cyan: 'text-cosmic-cyan',
    amber: 'text-cosmic-amber',
    red: 'text-cosmic-red',
  }[color]

  const borderClass = {
    cyan: 'border-cosmic-cyan/20',
    amber: 'border-cosmic-amber/20',
    red: 'border-cosmic-red/20',
  }[color]

  return (
    <div className={`card-intelligence ${borderClass} group hover:border-opacity-50 transition-all duration-300`}>
      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
        <div className={`w-8 h-8 rounded-full border ${borderClass}`} />
      </div>
      <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-cosmic-text-muted mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className={`text-2xl font-bold font-mono tracking-tighter ${colorClass}`}>{value}</p>
        <div className={`w-1 h-1 rounded-full ${colorClass} animate-pulse`} />
      </div>
    </div>
  )
}
