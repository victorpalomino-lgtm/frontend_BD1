// F1 — Estado de conexión con el backend + escalas disponibles.
// Llama GET /api/health y muestra un punto verde/rojo, "conectado a N escalas"
// y un chip por cada escala viva.
import { useCallback, useEffect, useState } from 'react'
import { getHealth, getApiErrorMessage, apiBaseURL } from '../api'
import type { HealthResponse } from '../types'

type Status = 'loading' | 'ok' | 'error'

export default function HealthBar() {
  const [status, setStatus] = useState<Status>('loading')
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const check = useCallback(async () => {
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
    check()
  }, [check])

  const scales = health?.scalesAvailable ?? []
  const n = scales.length

  return (
    <section className="panel">
      <h2>Conexión</h2>

      <div className="health">
        <span className={`health-dot ${status === 'loading' ? 'loading' : status}`} />

        <span className="health-status">
          {status === 'loading' && 'Comprobando…'}
          {status === 'ok' && `Conectado a ${n} ${n === 1 ? 'escala' : 'escalas'}`}
          {status === 'error' && 'Sin conexión'}
        </span>

        <button className="ghost" onClick={check} disabled={status === 'loading'}>
          Reintentar
        </button>
      </div>

      {status === 'ok' && (
        <>
          <p className="health-detail">
            Backend: <code>{apiBaseURL}</code> · escala por defecto:{' '}
            <code>{health?.defaultScale}</code>
          </p>
          {n > 0 ? (
            <div className="scales">
              {scales.map((s) => (
                <span key={s} className="scale-chip">
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="health-detail">
              El backend respondió, pero no hay bases <code>bnp_*</code> cargadas todavía.
            </p>
          )}
        </>
      )}

      {status === 'error' && error && (
        <p className="error-box" style={{ marginTop: 12 }}>
          {error}
        </p>
      )}
    </section>
  )
}
