# CLAUDE.md — Frontend BNP (VS Code)

Eres la instancia de Claude Code a cargo **solo del frontend**. No edites nada del backend.

## Antes de empezar (cada sesión)
Lee, en este orden: `docs/05_ESTADO.md` → `docs/02_HITOS.md` → `docs/01_API_CONTRACT.md`.
El contrato es la fuente de verdad: programa **contra esos JSON**, no contra lo que imagines.

## Tu objetivo
Una **sola página** que demuestre las consultas del proyecto BNP. Simple, clara, legible en
un proyector. El protagonista es lo que pasa en la base de datos: SQL, tiempo, plan. La UI
es el marco, no el show.

## Stack (no cambiar sin avisar al humano)
- Vite + React + TypeScript.
- `axios` para HTTP, `baseURL` desde `import.meta.env.VITE_API_URL`.
- Estilos: CSS plano o una librería ligera. Sin design systems pesados.
- (Opcional, solo F5) `recharts` para la curva 1k→1M.

## Estructura sugerida (mínima)
```
frontend/
  .env                      // VITE_API_URL=http://localhost:8080
  src/
    api.ts                  // cliente axios + tipos del contrato
    types.ts                // interfaces que reflejan docs/01_API_CONTRACT.md
    App.tsx                 // arma la página con los paneles de abajo
    components/
      HealthBar.tsx         // F1: estado de conexión + escalas
      QueryRunner.tsx       // F2+F3: selector + ejecución + resultado
      PlanView.tsx          // muestra el plan en <pre> con scroll
      InjectionDemo.tsx     // F4
      BenchmarkChart.tsx    // F5 (opcional)
```

## Paneles (qué muestra cada uno)
- **HealthBar (F1):** llama `/api/health`; muestra "conectado a {N} escalas" y un punto verde/rojo.
- **QueryRunner (F2+F3):**
  - Carga `/api/queries`. Dropdown de consulta + dropdown de escala + checkbox "con índice".
  - Renderiza inputs según `params` (date para C2 `desde`, number para C3 `minObras`).
  - Botón "Ejecutar" → `POST /api/run`. Muestra, bien separados:
    - el `sqlMostrado` con `$1..` y, debajo, los `paramsBindeados` resaltados;
    - `executionTimeMs` grande (es lo que el profe va a mirar);
    - tabla con `rows`;
    - el `plan` en bloque monoespaciado (`PlanView`).
  - Tip de demo: al togglear "con índice" off↔on en escala 1M se ve el salto de tiempo.
- **InjectionDemo (F4):** input de texto + 2–3 botones con payloads de ejemplo
  (ver `docs/03_QUERIES.md`). Llama `/api/injection-demo` y muestra `sqlMostrado`,
  `paramBindeado`, filas (o cero) y la `nota`. Mensaje claro: "el payload entró como texto".
- **BenchmarkChart (F5, opcional):** botón → `POST /api/benchmark` → curva sin/con índice, eje Y log.

## Reglas duras
1. Tipa las respuestas con interfaces que copien **exactamente** los campos del contrato.
   Si el backend devuelve algo distinto, no adivines: anótalo en `docs/05_ESTADO.md`.
2. Maneja el estado de carga y el error de cada llamada (mostrar el `error` del backend).
3. No metas lógica de negocio ni SQL en el frontend; solo consume la API.
4. Que funcione en un proyector: fuentes legibles, contraste alto, nada de animaciones.

## Al terminar un hito
Marca el checkbox en `docs/02_HITOS.md` y agrega una línea al LOG de `docs/05_ESTADO.md`.

## Comando de arranque
`npm install && npm run dev` → http://localhost:5173
