# 02 — Hitos (checklist ejecutable)

Marca `[x]` al cerrar cada hito y deja una línea en `05_ESTADO.md`.
Prefijo **B** = backend (IntelliJ). Prefijo **F** = frontend (VS Code).
Backend y frontend avanzan en paralelo; el contrato (`01_API_CONTRACT.md`) los mantiene sincronizados.

## Orden recomendado
B1 → (B2, F1 en paralelo) → B3 → F2 → F3 → B4 → F4 → B5 → F5 → DEMO.
El frontend puede arrancar contra datos de ejemplo del contrato aunque el backend no esté listo.

---

## Backend (IntelliJ)

- [x] **B1 — Esqueleto + /api/health**
  - Proyecto Spring Boot (Java 21), deps: `web`, `jdbc`, driver `postgresql`.
  - Config de las 4 escalas (mapa scale→jdbcUrl) en `application.yml`. Ver `04_DB_SETUP.md`.
  - `GET /api/health` pingueando cada escala y devolviendo las disponibles.
  - CORS habilitado para `http://localhost:5173` y `*.ngrok-free.app` / `*.ngrok.app`.

- [ ] **B2 — /api/queries**
  - Catálogo fijo de C1/C2/C3 tal cual el contrato. Puede ser un objeto en código.

- [ ] **B3 — /api/run (núcleo del demo)**
  - SQL de C1/C2/C3 desde `03_QUERIES.md`, con placeholders `?` para los params.
  - Crear índices al arrancar (idempotente, `CREATE INDEX IF NOT EXISTS`) en cada escala.
  - Toggle con/sin índice vía `SET enable_*` **en la misma conexión** que el EXPLAIN.
  - Ejecutar `EXPLAIN (ANALYZE, FORMAT TEXT)` y parsear `Execution Time` / `Planning Time`.
  - Ejecutar también la query "normal" para devolver filas (máx. 50).
  - Devolver `sqlMostrado` con `$1..$n` y `paramsBindeados`.

- [ ] **B4 — /api/injection-demo**
  - `SELECT ... FROM Libro WHERE titulo ILIKE ?` con `'%'||titulo||'%'` bindeado.
  - Nunca concatenar el input en el string SQL.

- [ ] **B5 — /api/benchmark (opcional)**
  - Reutiliza la lógica de B3 corriendo las 4 escalas × {con, sin índice}.

## Frontend (VS Code)

- [x] **F1 — Esqueleto + healthcheck**
  - Vite + React + TS. `axios` con `baseURL` desde `VITE_API_URL`.
  - Mostrar el estado de conexión y las escalas disponibles (`/api/health`).

- [x] **F2 — Selector de consulta**
  - Cargar `/api/queries`, dropdown de consulta + dropdown de escala + toggle "con índice".
  - Inputs dinámicos según `params` (date para C2, number para C3).

- [x] **F3 — Panel de ejecución (núcleo del demo)**
  - Botón "Ejecutar" → `POST /api/run`.
  - Mostrar: `sqlMostrado` + `paramsBindeados` (resaltados), `executionTimeMs`,
    tabla de `rows`, y el `plan` en bloque monoespaciado con scroll.

- [x] **F4 — Panel de SQL injection**
  - Input de texto + botón. Llama `/api/injection-demo`.
  - Mostrar el SQL, el `paramBindeado`, las filas (o cero) y la `nota`.
  - Incluir 2–3 payloads de ejemplo clicables (ver `03_QUERIES.md`).

- [x] **F5 — Gráfico 1k→1M (opcional)**
  - `POST /api/benchmark` → curva con `recharts` (sin índice vs con índice, eje Y log).

## Demo / deploy

- [ ] **D1 — Correr local**: backend `:8080`, frontend `:5173`, BD cargada (mín. 1k y 1M).
- [ ] **D2 — ngrok**: exponer el backend; apuntar `VITE_API_URL` al URL de ngrok. Ver `04_DB_SETUP.md`.
- [ ] **D3 — Ensayo**: correr C2 (rango btree) con/sin índice en 1k y 1M, y el panel de injection.
