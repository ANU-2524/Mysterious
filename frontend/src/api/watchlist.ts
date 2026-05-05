import { useQuery } from '@tanstack/react-query'
import { apiClient } from './client'

export interface WatchlistItem {
  id: number
  entity_id: number
  entity_name: string
  sector: string | null
  current_risk_score: number | null
  severity: string | null
  added_at: string
}

export function useWatchlist() {
  return useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const { data } = await apiClient.get<WatchlistItem[]>('/watchlist')
      return data
    },
  })
}
