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
| F2   | Selector de consulta                | ⬜ pendiente |                |
| F3   | Panel de ejecución                  | ⬜ pendiente |                |
| F4   | Panel de SQL injection              | ⬜ pendiente |                |
| F5   | Gráfico 1k→1M (opcional)            | ⬜ pendiente |                |
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
- 2026-06-29 — [F] — F1 — Esqueleto Vite + React + TS (React 18, Vite 6). `src/types.ts` copia los tipos de TODO el contrato (health/queries/run/injection/benchmark). `src/api.ts` = cliente axios con `baseURL` desde `VITE_API_URL` (`.env` → http://localhost:8080) + helpers tipados y `getApiErrorMessage` que lee `{error}` del backend. `components/HealthBar.tsx` (F1): `GET /api/health`, punto verde/rojo, "Conectado a N escalas", chips por escala, botón Reintentar, manejo de carga/error. `App.tsx` arma la página con placeholders para F2–F5. Estilos en `index.css` pensados para proyector (alto contraste, fuentes grandes, sin animaciones). `npm run build` (tsc + vite) OK; dev server en :5173 responde 200. Arranque: `npm install && npm run dev`.
- 2026-06-28 — [B] — B1 — Esqueleto Spring Boot 4.1 (Java 21, JDBC plano). Config `bnp.*` en application.yml (scales 1k/10k/100k/1M, user/pass por env). `ScaleDataSources` con un `DriverManagerDataSource` por escala. `GET /api/health` pinguea cada escala (SELECT 1) y devuelve las vivas. CORS para localhost:5173 y *.ngrok. Excluida `DataSourceAutoConfiguration`. Compila y arranca; `/api/health` → 200 `{"status":"ok","defaultScale":"1k","scalesAvailable":[]}` (vacío: aún no existen las BD `bnp_*`). Arranque: `./mvnw spring-boot:run`.
