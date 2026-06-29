# 05 — Estado del trabajo (BITÁCORA VIVA)

> Lee esto **primero** para saber dónde quedó todo. Cada instancia de Claude Code
> **agrega una entrada al cerrar un hito** y actualiza la tabla de abajo.
> No borres entradas viejas; solo agrega al final del log.

## Estado actual de los hitos

| Hito | Descripción                         | Estado      | Quién / cuándo |
|------|-------------------------------------|-------------|----------------|
| B1   | Esqueleto + /api/health             | ✅ hecho     | Claude(B) / 2026-06-28 |
| B2   | /api/queries                        | ⬜ pendiente |                |
| B3   | /api/run (con/sin índice)           | ⬜ pendiente |                |
| B4   | /api/injection-demo                 | ⬜ pendiente |                |
| B5   | /api/benchmark (opcional)           | ⬜ pendiente |                |
| F1   | Esqueleto + healthcheck             | ✅ hecho     | Claude(F) / 2026-06-29 |
| F2   | Selector de consulta                | ✅ hecho     | Claude(F) / 2026-06-29 |
| F3   | Panel de ejecución                  | ✅ hecho     | Claude(F) / 2026-06-29 |
| F4   | Panel de SQL injection              | ✅ hecho     | Claude(F) / 2026-06-29 |
| F5   | Gráfico 1k→1M (opcional)            | ✅ hecho     | Claude(F) / 2026-06-29 |
| D1   | Correr local                        | ⬜ pendiente |                |
| D2   | ngrok                               | ⬜ pendiente |                |
| D3   | Ensayo de demo                      | ⬜ pendiente |                |

Estados: ⬜ pendiente · 🟨 en curso · ✅ hecho · ⛔ bloqueado

## Cómo resumir el proyecto en una frase (para retomar rápido)
Demo web (React + Spring Boot/JDBC) que ejecuta las 3 consultas del Hito 2 BNP contra
PostgreSQL, alternando con/sin índice, mostrando tiempo y plan, con un panel anti-SQL-injection.
Contrato de API en `01_API_CONTRACT.md`.

## Decisiones / cambios de contrato (solo el humano aprueba)
- (vacío)

## Bloqueos / dudas para Casas
- (vacío)

---

## LOG (agregar al final, formato: fecha — [B/F] — hito — qué se hizo)

- 2026-06-28 — [docs] — setup — Creados los archivos fuente (docs + CLAUDE.md de backend y frontend).
- 2026-06-29 — [F] — F5 — Gráfico 1k→1M (opcional). Instalado `recharts` (^3.9). Nuevo `components/BenchmarkChart.tsx`: dropdown de consulta + inputs de params (reusa catálogo de `/api/queries`), botón "Correr benchmark" → `POST /api/benchmark`, dibuja `LineChart` con eje X = escala y eje Y logarítmico (ms), dos líneas: "Sin índice" (rojo) y "Con índice" (verde), tooltip y leyenda. Maneja error y caso de `puntos` vacío (escalas no cargadas). Nota: el build avisa que el chunk supera 500 kB por el peso de recharts (irrelevante en demo local). Ajuste de tipos: el `formatter` del Tooltip de recharts 3.x no acepta anotación `(v:number)`; se dejó inferir. `npm run build` OK. ⇒ TODOS los hitos del frontend (F1–F5) cerrados; falta probar contra backend real (B2–B5) y BD `bnp_*` cargadas.
- 2026-06-29 — [F] — F4 — Panel anti-SQL-injection. Nuevo `components/InjectionDemo.tsx`: input de texto (título) + dropdown de escala + 3 payloads de ejemplo clicables (de `03_QUERIES.md`: `Historia' OR '1'='1`, `'; DROP TABLE Reserva; --`, `x%' UNION SELECT dni FROM Usuario --`) que rellenan el input. Botón "Probar" → `POST /api/injection-demo`. Muestra `sqlMostrado` en `<pre>`, el `paramBindeado` resaltado como chip `$1` (evidencia de que entró como literal), tabla de `rows` (o "cero filas: ningún título contiene literalmente ese texto") y la `nota` del backend en un recuadro verde. Manejo de carga/error. `npm run build` OK. Aún sin probar contra BD real (B4 backend / bases `bnp_*` pendientes).
- 2026-06-29 — [F] — F3 — Panel de ejecución (núcleo). `QueryRunner` arma el `RunRequest` (queryId/scale/withIndex/params) y llama `POST /api/run` con estado running/error/result. Nuevo `components/ResultView.tsx` muestra: `executionTimeMs` GRANDE (lo que mira el profe) con Planning/Índice ON-OFF/Filas al lado; `sqlMostrado` en `<pre>` con los `paramsBindeados` resaltados como chips `$1,$2…`; tabla de `rows` (columnas = unión de claves, scroll vertical, sticky header, avisa si `rowCount` > filas mostradas); chips de `indicesDefinidos`; y el `plan` completo vía nuevo `components/PlanView.tsx` (`<pre>` monoespaciado con scroll). Manejo de error de la llamada (muestra el `{error}` del backend). Aún sin probar contra datos reales (no hay BD `bnp_*` cargadas); tipado calza con el contrato y `npm run build` OK. Tip demo: C2 en 1M con índice OFF→ON muestra el salto de tiempo.
- 2026-06-29 — [F] — F2 — Selector de consulta. Estado de `/api/health` subido a un hook compartido `src/hooks/useHealth.ts` (lo usan HealthBar y QueryRunner; un solo fetch). `HealthBar` ahora es presentacional (recibe props del hook). Nuevo `components/QueryRunner.tsx`: carga `GET /api/queries`, dropdown de consulta (id — nombre), dropdown de escala (1k/10k/100k/1M, marca "(no cargada)" las que no están en `scalesAvailable`), checkbox "con índice" (default ON), inputs dinámicos según `params` (date para C2 `desde`, number para C3 `minObras`) inicializados con sus `default` y reseteados al cambiar de consulta; muestra la `descripcion` y un badge "rango B-tree" para C2. Manejo de carga/error del catálogo. La ejecución (POST /api/run) queda para F3. `npm run build` OK.
- 2026-06-29 — [F] — F1 — Esqueleto Vite + React + TS (React 18, Vite 6). `src/types.ts` copia los tipos de TODO el contrato (health/queries/run/injection/benchmark). `src/api.ts` = cliente axios con `baseURL` desde `VITE_API_URL` (`.env` → http://localhost:8080) + helpers tipados y `getApiErrorMessage` que lee `{error}` del backend. `components/HealthBar.tsx` (F1): `GET /api/health`, punto verde/rojo, "Conectado a N escalas", chips por escala, botón Reintentar, manejo de carga/error. `App.tsx` arma la página con placeholders para F2–F5. Estilos en `index.css` pensados para proyector (alto contraste, fuentes grandes, sin animaciones). `npm run build` (tsc + vite) OK; dev server en :5173 responde 200. Arranque: `npm install && npm run dev`.
- 2026-06-28 — [B] — B1 — Esqueleto Spring Boot 4.1 (Java 21, JDBC plano). Config `bnp.*` en application.yml (scales 1k/10k/100k/1M, user/pass por env). `ScaleDataSources` con un `DriverManagerDataSource` por escala. `GET /api/health` pinguea cada escala (SELECT 1) y devuelve las vivas. CORS para localhost:5173 y *.ngrok. Excluida `DataSourceAutoConfiguration`. Compila y arranca; `/api/health` → 200 `{"status":"ok","defaultScale":"1k","scalesAvailable":[]}` (vacío: aún no existen las BD `bnp_*`). Arranque: `./mvnw spring-boot:run`.
