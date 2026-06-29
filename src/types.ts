// Tipos que reflejan EXACTAMENTE el contrato en docs/01_API_CONTRACT.md.
// Si el backend devuelve algo distinto, NO adivinar: anotarlo en docs/05_ESTADO.md.

export type Scale = '1k' | '10k' | '100k' | '1M'
export type QueryId = 'C1' | 'C2' | 'C3'

// ---- GET /api/health ----
export interface HealthResponse {
  status: string // "ok"
  defaultScale: Scale
  scalesAvailable: Scale[] // escalas que respondieron al ping
}

// ---- GET /api/queries ----
export type ParamTipo = 'date' | 'int'

export interface QueryParam {
  name: string
  tipo: ParamTipo
  default: string | number
  requerido: boolean
}

export interface QueryCatalogItem {
  id: QueryId
  nombre: string
  descripcion: string
  esRango: boolean
  params: QueryParam[]
}

export interface QueriesResponse {
  queries: QueryCatalogItem[]
}

// ---- POST /api/run ----
export interface RunRequest {
  queryId: QueryId
  scale: Scale
  withIndex: boolean
  params: Record<string, string | number>
}

export interface RunResponse {
  queryId: QueryId
  scale: Scale
  withIndex: boolean
  sqlMostrado: string
  paramsBindeados: (string | number)[]
  executionTimeMs: number
  planningTimeMs: number
  rowCount: number
  rows: Record<string, unknown>[]
  plan: string
  indicesDefinidos: string[]
}

// ---- POST /api/injection-demo ----
export interface InjectionRequest {
  scale: Scale
  titulo: string
}

export interface InjectionResponse {
  sqlMostrado: string
  paramBindeado: string
  rowCount: number
  rows: Record<string, unknown>[]
  nota: string
}

// ---- POST /api/benchmark (opcional) ----
export interface BenchmarkRequest {
  queryId: QueryId
  params: Record<string, string | number>
}

export interface BenchmarkPoint {
  scale: Scale
  sinIndiceMs: number
  conIndiceMs: number
}

export interface BenchmarkResponse {
  queryId: QueryId
  puntos: BenchmarkPoint[]
}

// ---- Errores ----
// Errores: HTTP 4xx/5xx con { "error": "mensaje" }
export interface ApiError {
  error: string
}
