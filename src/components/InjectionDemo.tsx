// F4 — Panel "intenta inyectar". Manda la entrada CRUDA del usuario a
// POST /api/injection-demo; el backend la bindea como un único parámetro `?`.
// Demuestra que el payload entra como texto literal, no como código SQL.
import { useEffect, useState } from 'react'
import { postInjectionDemo, getApiErrorMessage } from '../api'
import type { InjectionResponse, Scale } from '../types'

const ALL_SCALES: Scale[] = ['1k', '10k', '100k', '1M']

// Payloads de ejemplo (docs/03_QUERIES.md).
const PAYLOADS = [
  "Historia' OR '1'='1",
  "'; DROP TABLE Reserva; --",
  "x%' UNION SELECT dni FROM Usuario --",
]

interface Props {
  scalesAvailable: Scale[]
  defaultScale?: Scale
}

function formatCell(v: unknown): string {
  if (v === null || v === undefined) return '∅'
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

export default function InjectionDemo({ scalesAvailable, defaultScale }: Props) {
  const [titulo, setTitulo] = useState('')
  const [scale, setScale] = useState<Scale>(defaultScale ?? '1k')
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<InjectionResponse | null>(null)

  useEffect(() => {
    if (defaultScale) setScale(defaultScale)
  }, [defaultScale])

  async function probar() {
    setRunning(true)
    setError(null)
    try {
      const res = await postInjectionDemo({ scale, titulo })
      setResult(res)
    } catch (err) {
      setError(getApiErrorMessage(err))
      setResult(null)
    } finally {
      setRunning(false)
    }
  }

  const columns: string[] = []
  for (const row of result?.rows ?? []) {
    for (const k of Object.keys(row)) {
      if (!columns.includes(k)) columns.push(k)
    }
  }

  return (
    <section className="panel">
      <h2>SQL injection — pruébalo</h2>
      <p className="health-detail">
        Escribe un payload malicioso en el título. El backend lo bindea como un único
        parámetro <code>?</code> (<code>'%' || titulo || '%'</code>), nunca concatenado.
      </p>

      <div className="form-grid">
        <label className="field" style={{ flex: '1 1 320px' }}>
          <span className="field-label">Título a buscar</span>
          <input
            type="text"
            value={titulo}
            placeholder="prueba un payload…"
            onChange={(e) => setTitulo(e.target.value)}
          />
        </label>

        <label className="field">
          <span className="field-label">Escala</span>
          <select value={scale} onChange={(e) => setScale(e.target.value as Scale)}>
            {ALL_SCALES.map((s) => (
              <option key={s} value={s}>
                {s}
                {scalesAvailable.length > 0 && !scalesAvailable.includes(s)
                  ? ' (no cargada)'
                  : ''}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Payloads de ejemplo */}
      <div className="payloads">
        <span className="field-label">Payloads de ejemplo:</span>
        {PAYLOADS.map((p) => (
          <button key={p} className="ghost payload-btn" onClick={() => setTitulo(p)}>
            <code>{p}</code>
          </button>
        ))}
      </div>

      <div className="run-bar">
        <button onClick={probar} disabled={running}>
          {running ? 'Probando…' : 'Probar'}
        </button>
      </div>

      {error && (
        <p className="error-box" style={{ marginTop: 16 }}>
          {error}
        </p>
      )}

      {result && (
        <div className="result">
          <div className="sql-section">
            <h3>SQL ejecutado (PreparedStatement)</h3>
            <pre className="sql-pre">{result.sqlMostrado}</pre>
            <div className="binds">
              <span className="binds-label">Param bindeado:</span>
              <span className="bind-chip">
                <span className="bind-pos">$1</span>
                {result.paramBindeado}
              </span>
            </div>
          </div>

          <div className="rows-section">
            <h3>
              Resultado{' '}
              <span className="health-detail">
                ({result.rowCount} {result.rowCount === 1 ? 'fila' : 'filas'})
              </span>
            </h3>
            {result.rows.length === 0 ? (
              <p className="health-detail">
                Cero filas: ningún título contiene literalmente ese texto.
              </p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      {columns.map((c) => (
                        <th key={c}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, i) => (
                      <tr key={i}>
                        {columns.map((c) => (
                          <td key={c}>{formatCell(row[c])}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p className="injection-note">✓ {result.nota}</p>
        </div>
      )}
    </section>
  )
}
