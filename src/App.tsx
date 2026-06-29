import HealthBar from './components/HealthBar'
import QueryRunner from './components/QueryRunner'
import InjectionDemo from './components/InjectionDemo'
import BenchmarkChart from './components/BenchmarkChart'
import { useHealth } from './hooks/useHealth'

export default function App() {
  const health = useHealth()

  return (
    <>
      <h1>Demo BNP — Base de Datos I</h1>
      <p className="subtitle">
        Consultas en vivo contra PostgreSQL: SQL, tiempo, plan e índices.
      </p>

      {/* F1 — healthcheck */}
      <HealthBar {...health} />

      {/* F2 — selector de consulta (F3 añadirá la ejecución) */}
      <QueryRunner
        scalesAvailable={health.health?.scalesAvailable ?? []}
        defaultScale={health.health?.defaultScale}
      />

      {/* F4 — panel anti-SQL-injection */}
      <InjectionDemo
        scalesAvailable={health.health?.scalesAvailable ?? []}
        defaultScale={health.health?.defaultScale}
      />

      {/* F5 — gráfico 1k→1M (opcional) */}
      <BenchmarkChart />
    </>
  )
}
