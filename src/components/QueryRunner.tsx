// F2 — Selector de consulta: carga GET /api/queries y arma dropdown de consulta +
// dropdown de escala + checkbox "con índice" + inputs dinámicos según `params`.
// (F3 añadirá el botón "Ejecutar" → POST /api/run y el render del resultado.)
import { useEffect, useMemo, useState } from 'react'
import { getQueries, postRun, getApiErrorMessage } from '../api'
import type { QueryCatalogItem, RunResponse, Scale } from '../types'
import ResultView from './ResultView'

const ALL_SCALES: Scale[] = ['1k', '10k', '100k', '1M']

interface Props {
  // Escalas que respondieron al ping (de /api/health). Vacío si aún no hay BD cargadas.
  scalesAvailable: Scale[]
  defaultScale?: Scale
}

export default function QueryRunner({ scalesAvailable, defaultScale }: Props) {
  const [queries, setQueries] = useState<QueryCatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // --- Estado del formulario ---
  const [queryId, setQueryId] = useState<string>('')
  const [scale, setScale] = useState<Scale>(defaultScale ?? '1k')
  const [withIndex, setWithIndex] = useState(true)
  const [params, setParams] = useState<Record<string, string | number>>({})

  // --- Estado de la ejecución (POST /api/run) ---
  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)
  const [result, setResult] = useState<RunResponse | null>(null)

  // Cargar catálogo
  useEffect(() => {
    let cancel = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getQueries()
        if (cancel) return
        setQueries(data.queries)
        if (data.queries.length > 0) setQueryId(data.queries[0].id)
      } catch (err) {
        if (!cancel) setError(getApiErrorMessage(err))
      } finally {
        if (!cancel) setLoading(false)
      }
    })()
    return () => {
      cancel = true
    }
  }, [])

  // Si la escala por defecto del backend cambia (al cargar health), adoptarla.
  useEffect(() => {
    if (defaultScale) setScale(defaultScale)
  }, [defaultScale])

  const selected = useMemo(
    () => queries.find((q) => q.id === queryId) ?? null,
    [queries, queryId],
  )

  // Al cambiar de consulta, reinicia los params con sus defaults.
  useEffect(() => {
    if (!selected) {
      setParams({})
      return
    }
    const next: Record<string, string | number> = {}
    for (const p of selected.params) next[p.name] = p.default
    setParams(next)
  }, [selected])

  async function runQuery() {
    if (!selected) return
    setRunning(true)
    setRunError(null)
    try {
      const res = await postRun({
        queryId: selected.id,
        scale,
        withIndex,
        params,
      })
      setResult(res)
    } catch (err) {
      setRunError(getApiErrorMessage(err))
      setResult(null)
    } finally {
      setRunning(false)
    }
  }

  if (loading) {
    return (
      <section className="panel">
        <h2>Consulta</h2>
        <p className="health-detail">Cargando catálogo…</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="panel">
        <h2>Consulta</h2>
        <p className="error-box">{error}</p>
      </section>
    )
  }

  const scaleAvailable = (s: Scale) => scalesAvailable.includes(s)

  return (
    <section className="panel">
      <h2>Consulta</h2>

      <div className="form-grid">
        {/* Dropdown de consulta */}
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

        {/* Dropdown de escala */}
        <label className="field">
          <span className="field-label">Escala</span>
          <select value={scale} onChange={(e) => setScale(e.target.value as Scale)}>
            {ALL_SCALES.map((s) => (
              <option key={s} value={s}>
                {s}
                {scalesAvailable.length > 0 && !scaleAvailable(s) ? ' (no cargada)' : ''}
              </option>
            ))}
          </select>
        </label>

        {/* Checkbox con índice */}
        <label className="field field-checkbox">
          <span className="field-label">Índice</span>
          <span className="checkbox-row">
            <input
              type="checkbox"
              checked={withIndex}
              onChange={(e) => setWithIndex(e.target.checked)}
            />
            <span>con índice</span>
          </span>
        </label>
      </div>

      {/* Descripción de la consulta seleccionada */}
      {selected && (
        <p className="health-detail">
          {selected.descripcion}
          {selected.esRango && <span className="badge-rango">rango B-tree</span>}
        </p>
      )}

      {/* Inputs dinámicos según params */}
      {selected && selected.params.length > 0 && (
        <div className="form-grid">
          {selected.params.map((p) => (
            <label className="field" key={p.name}>
              <span className="field-label">
                {p.name}
                {p.requerido && <span className="req">*</span>}
              </span>
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
      )}

      {selected && selected.params.length === 0 && (
        <p className="health-detail">Esta consulta no recibe parámetros.</p>
      )}

      {/* F3 — ejecución */}
      <div className="run-bar">
        <button onClick={runQuery} disabled={running || !selected}>
          {running ? 'Ejecutando…' : 'Ejecutar'}
        </button>
        <span className="health-detail">
          {selected?.id} · escala {scale} · {withIndex ? 'con índice' : 'sin índice'}
        </span>
      </div>

      {runError && (
        <p className="error-box" style={{ marginTop: 16 }}>
          {runError}
        </p>
      )}

      {result && <ResultView result={result} />}
    </section>
  )
}
