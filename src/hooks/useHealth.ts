// Estado compartido de GET /api/health: lo consume HealthBar (F1) y QueryRunner (F2),
// así no se pide /api/health dos veces.
import { useCallback, useEffect, useState } from 'react'
import { getHealth, getApiErrorMessage } from '../api'
import type { HealthResponse } from '../types'

export type HealthStatus = 'loading' | 'ok' | 'error'

export interface UseHealth {
  status: HealthStatus
  health: HealthResponse | null
  error: string | null
  refetch: () => void
}

export function useHealth(): UseHealth {
  const [status, setStatus] = useState<HealthStatus>('loading')
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const data = await getHealth()
      setHealth(data)
      setStatus('ok')
    } catch (err) {
      setError(getApiErrorMessage(err))
      setHealth(null)
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { status, health, error, refetch }
}
