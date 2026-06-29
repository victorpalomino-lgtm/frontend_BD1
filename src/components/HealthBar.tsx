// F1 — Estado de conexión con el backend + escalas disponibles.
// Presentacional: el estado de /api/health vive en App (hook useHealth).
import { apiBaseURL } from '../api'
import type { UseHealth } from '../hooks/useHealth'

export default function HealthBar({ status, health, error, refetch }: UseHealth) {
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

        <button className="ghost" onClick={refetch} disabled={status === 'loading'}>
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
