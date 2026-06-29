import HealthBar from './components/HealthBar'

export default function App() {
  return (
    <>
      <h1>Demo BNP — Base de Datos I</h1>
      <p className="subtitle">
        Consultas en vivo contra PostgreSQL: SQL, tiempo, plan e índices.
      </p>

      {/* F1 — healthcheck */}
      <HealthBar />

      {/* F2/F3 — QueryRunner, F4 — InjectionDemo, F5 — BenchmarkChart (siguientes hitos) */}
    </>
  )
}
