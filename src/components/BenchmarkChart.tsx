// F5 (opcional) — Curva 1k→1M. POST /api/benchmark corre una consulta en las 4 escalas,
// con y sin índice, y dibuja tiempo vs. volumen con eje Y logarítmico (recharts).
import { useEffect, useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { getQueries, postBenchmark, getApiErrorMessage } from '../api'
import type { BenchmarkResponse, QueryCatalogItem } from '../types'

export default function BenchmarkChart() {
  const [queries, setQueries] = useState<QueryCatalogItem[]>([])
  const [queryId, setQueryId] = useState<string>('')
  const [params, setParams] = useState<Record<string, string | number>>({})

  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<BenchmarkResponse | null>(null)

  // Cargar catálogo (para elegir la consulta y sus params).
  useEffect(() => {
    let cancel = false
    ;(async () => {
      try {
        const res = await getQueries()
        if (cancel) return
        setQueries(res.queries)
        if (res.queries.length > 0) setQueryId(res.queries[0].id)
      } catch {
        // Silencioso: F5 es opcional; si el catálogo falla, el panel queda inerte.
      }
    })()
    return () => {
      cancel = true
    }
  }, [])

  const selected = useMemo(
    () => queries.find((q) => q.id === queryId) ?? null,
    [queries, queryId],
  )

  useEffect(() => {
    if (!selected) {
      setParams({})
      return
    }
    const next: Record<string, string | number> = {}
    for (const p of selected.params) next[p.name] = p.default
    setParams(next)
  }, [selected])

  async function correr() {
    if (!selected) return
    setRunning(true)
    setError(null)
    try {
      const res = await postBenchmark({ queryId: selected.id, params })
      setData(res)
    } catch (err) {
      setError(getApiErrorMessage(err))
      setData(null)
    } finally {
      setRunning(false)
    }
  }

  return (
    <section className="panel">
      <h2>Benchmark 1k → 1M (opcional)</h2>
      <p className="health-detail">
        Corre la consulta en las 4 escalas, con y sin índice. Eje Y logarítmico (ms).
      </p>

      <div className="form-grid">
        <label className="field">
          <span className="field-label">Consulta</span>
          <select value={queryId} onChange={(e) => setQueryId(e.target.value)}>
            {queries.map((q) => (
              <option key={q.id} value={q.id}>
                {q.id} — {q.nombre}
              </option>
            ))}
          </select>
        </label>

        {selected?.params.map((p) => (
          <label className="field" key={p.name}>
            <span className="field-label">{p.name}</span>
            <input
              type={p.tipo === 'date' ? 'date' : 'number'}
              value={String(params[p.name] ?? '')}
              onChange={(e) =>
                setParams((prev) => ({
                  ...prev,
                  [p.name]: p.tipo === 'int' ? Number(e.target.value) : e.target.value,
                }))
              }
            />
          </label>
        ))}
      </div>

      <div className="run-bar">
        <button onClick={correr} disabled={running || !selected}>
          {running ? 'Corriendo…' : 'Correr benchmark'}
        </button>
        {running && <span className="health-detail">Esto mide en vivo; puede tardar.</span>}
      </div>

      {error && (
        <p className="error-box" style={{ marginTop: 16 }}>
          {error}
        </p>
      )}

      {data && data.puntos.length > 0 && (
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={data.puntos} margin={{ top: 16, right: 24, bottom: 8, left: 8 }}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
              <XAxis dataKey="scale" stroke="#94a3b8" />
              <YAxis
                scale="log"
                domain={['auto', 'auto']}
                allowDataOverflow
                stroke="#94a3b8"
                label={{
                  value: 'ms (log)',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#94a3b8',
                }}
              />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#f1f5f9',
                }}
                formatter={(v) => `${v} ms`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sinIndiceMs"
                name="Sin índice"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="conIndiceMs"
                name="Con índice"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {data && data.puntos.length === 0 && (
        <p className="health-detail">El backend no devolvió puntos (¿escalas no cargadas?).</p>
      )}
    </section>
  )
}
