// Render del resultado de POST /api/run (F3, núcleo del demo).
// Muestra, bien separados: SQL + params bindeados, tiempo de ejecución grande,
// tabla de filas, índices definidos y el plan completo.
import PlanView from './PlanView'
import type { RunResponse } from '../types'

interface Props {
  result: RunResponse
}

function formatCell(v: unknown): string {
  if (v === null || v === undefined) return '∅'
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

export default function ResultView({ result }: Props) {
  const {
    sqlMostrado,
    paramsBindeados,
    executionTimeMs,
    planningTimeMs,
    rowCount,
    rows,
    plan,
    indicesDefinidos,
    withIndex,
  } = result

  // Columnas: unión de las claves presentes en las filas (preserva orden de aparición).
  const columns: string[] = []
  for (const row of rows) {
    for (const k of Object.keys(row)) {
      if (!columns.includes(k)) columns.push(k)
    }
  }

  const truncated = rowCount > rows.length

  return (
    <div className="result">
      {/* Tiempo de ejecución: el protagonista */}
      <div className="time-row">
        <div className="time-big">
          <span className="time-value">{executionTimeMs}</span>
          <span className="time-unit">ms</span>
          <span className="time-caption">Execution Time</span>
        </div>
        <div className="time-small">
          <div>
            Planning: <strong>{planningTimeMs} ms</strong>
          </div>
          <div>
            Índice:{' '}
            <strong className={withIndex ? 'on' : 'off'}>
              {withIndex ? 'ON' : 'OFF'}
            </strong>
          </div>
          <div>
            Filas: <strong>{rowCount}</strong>
          </div>
        </div>
      </div>

      {/* SQL mostrado + params bindeados */}
      <div className="sql-section">
        <h3>SQL ejecutado (PreparedStatement)</h3>
        <pre className="sql-pre">{sqlMostrado}</pre>
        {paramsBindeados.length > 0 && (
          <div className="binds">
            <span className="binds-label">Params bindeados:</span>
            {paramsBindeados.map((p, i) => (
              <span key={i} className="bind-chip">
                <span className="bind-pos">${i + 1}</span>
                {String(p)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabla de filas */}
      <div className="rows-section">
        <h3>
          Resultado{' '}
          <span className="health-detail">
            ({rowCount} {rowCount === 1 ? 'fila' : 'filas'}
            {truncated && `, mostrando ${rows.length}`})
          </span>
        </h3>
        {rows.length === 0 ? (
          <p className="health-detail">Sin filas.</p>
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
                {rows.map((row, i) => (
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

      {/* Índices definidos */}
      {indicesDefinidos.length > 0 && (
        <div className="indices-section">
          <h3>Índices definidos</h3>
          <div className="scales">
            {indicesDefinidos.map((idx) => (
              <span key={idx} className="scale-chip">
                {idx}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Plan */}
      <div className="plan-section">
        <h3>Plan — EXPLAIN (ANALYZE)</h3>
        <PlanView plan={plan} />
      </div>
    </div>
  )
}
