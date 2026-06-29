// Muestra el plan de EXPLAIN (ANALYZE) en un bloque monoespaciado con scroll.
interface Props {
  plan: string
}

export default function PlanView({ plan }: Props) {
  return (
    <div className="plan-block">
      <pre className="plan-pre">{plan}</pre>
    </div>
  )
}
