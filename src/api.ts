// Cliente axios + funciones tipadas contra docs/01_API_CONTRACT.md.
// baseURL desde import.meta.env.VITE_API_URL (ver .env).
import axios, { AxiosError } from 'axios'
import type {
  HealthResponse,
  QueriesResponse,
  RunRequest,
  RunResponse,
  InjectionRequest,
  InjectionResponse,
  BenchmarkRequest,
  BenchmarkResponse,
  ApiError,
} from './types'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export const http = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 30000,
})

/**
 * Extrae un mensaje legible del error.
 * El contrato dice que los errores vienen como { "error": "mensaje" }.
 */
export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<ApiError>
    if (ax.response?.data?.error) return ax.response.data.error
    if (ax.code === 'ERR_NETWORK') return 'No se pudo conectar al backend. ¿Está corriendo en ' + baseURL + '?'
    return ax.message
  }
  if (err instanceof Error) return err.message
  return 'Error desconocido'
}

export async function getHealth(): Promise<HealthResponse> {
  const { data } = await http.get<HealthResponse>('/api/health')
  return data
}

export async function getQueries(): Promise<QueriesResponse> {
  const { data } = await http.get<QueriesResponse>('/api/queries')
  return data
}

export async function postRun(req: RunRequest): Promise<RunResponse> {
  const { data } = await http.post<RunResponse>('/api/run', req)
  return data
}

export async function postInjectionDemo(req: InjectionRequest): Promise<InjectionResponse> {
  const { data } = await http.post<InjectionResponse>('/api/injection-demo', req)
  return data
}

export async function postBenchmark(req: BenchmarkRequest): Promise<BenchmarkResponse> {
  const { data } = await http.post<BenchmarkResponse>('/api/benchmark', req)
  return data
}

export { baseURL as apiBaseURL }
