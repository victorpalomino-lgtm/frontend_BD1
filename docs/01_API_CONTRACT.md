# 01 — Contrato de API (LEY — no romper sin avisar al humano)

Base URL en dev: `http://localhost:8080`
Todas las respuestas son JSON UTF-8. Errores: HTTP 4xx/5xx con `{ "error": "mensaje" }`.

CORS: el backend permite el origen del frontend (Vite `http://localhost:5173`) y el
dominio de ngrok durante la demo. Ver `backend/CLAUDE.md`.

---

## GET /api/health
Sanity check + qué escalas hay cargadas.

**200**
```json
{
  "status": "ok",
  "defaultScale": "1k",
  "scalesAvailable": ["1k", "10k", "100k", "1M"]
}
```
`scalesAvailable` refleja qué bases existen realmente (las que respondieron al ping).

---

## GET /api/queries
Catálogo de las consultas del demo. El frontend arma el dropdown y los inputs con esto.

**200**
```json
{
  "queries": [
    {
      "id": "C1",
      "nombre": "Lectores con multas pendientes sobre el promedio",
      "descripcion": "Filtro de igualdad + agregación con subconsulta (HAVING SUM > AVG).",
      "esRango": false,
      "params": []
    },
    {
      "id": "C2",
      "nombre": "Reservas por tema desde una fecha (rango B-tree)",
      "descripcion": "Filtro de RANGO de fechas + agregación por área Dewey. Usa índice B-tree.",
      "esRango": true,
      "params": [
        { "name": "desde", "tipo": "date", "default": "2025-01-01", "requerido": true }
      ]
    },
    {
      "id": "C3",
      "nombre": "Autores prolíficos sin libros perdidos",
      "descripcion": "Subconsulta NOT EXISTS con joins anidados.",
      "esRango": false,
      "params": [
        { "name": "minObras", "tipo": "int", "default": 5, "requerido": true }
      ]
    }
  ]
}
```

---

## POST /api/run
Ejecuta una consulta del catálogo, con o sin índice, sobre una escala. Devuelve filas,
tiempo y plan. **El SQL siempre se ejecuta con PreparedStatement** (placeholders bindeados).

**Request**
```json
{
  "queryId": "C2",
  "scale": "1k",
  "withIndex": true,
  "params": { "desde": "2025-01-01" }
}
```
- `queryId`: "C1" | "C2" | "C3"
- `scale`: "1k" | "10k" | "100k" | "1M"
- `withIndex`: boolean
- `params`: objeto con los params declarados en `/api/queries` (vacío `{}` para C1)

**200**
```json
{
  "queryId": "C2",
  "scale": "1k",
  "withIndex": true,
  "sqlMostrado": "SELECT ... WHERE r.fecha_reserva >= $1 ...",
  "paramsBindeados": ["2025-01-01"],
  "executionTimeMs": 0.169,
  "planningTimeMs": 0.402,
  "rowCount": 8,
  "rows": [
    { "tema": "Literatura", "num_reservas": 14 }
  ],
  "plan": "Hash Join (...)\n  -> Bitmap Heap Scan on reserva ...\nExecution Time: 0.169 ms",
  "indicesDefinidos": ["idx_reserva_fecha", "idx_libro_categoria", "idx_reserva_libro"]
}
```
- `sqlMostrado`: el SQL con `$1, $2...` (solo para mostrar en pantalla; NO se ejecuta así).
- `paramsBindeados`: los valores que se bindearon, en orden (para mostrar al lado del SQL).
- `rows`: máximo **50 filas** (el backend trunca; `rowCount` es el total real reportado).
- `plan`: texto completo de `EXPLAIN (ANALYZE)`.

**Mecánica con/sin índice** (la implementa el backend, el frontend no se entera):
- Los índices existen siempre en la BD (creados al arrancar, idempotente).
- `withIndex=false` → el backend hace `SET enable_indexscan/indexonlyscan/bitmapscan = OFF`
  en la misma conexión antes del EXPLAIN (mismo método que la metodología del Hito 2).
- `withIndex=true` → `RESET` de esos parámetros.

---

## POST /api/injection-demo
Panel de "intenta inyectar". Busca libros por título con la entrada **cruda del usuario**,
bindeada como parámetro. Sirve para escribir un payload malicioso y comprobar que se trata
como texto literal.

**Request**
```json
{ "scale": "1k", "titulo": "Historia' OR '1'='1" }
```

**200**
```json
{
  "sqlMostrado": "SELECT id_libro, titulo, disponibilidad FROM Libro WHERE titulo ILIKE $1 LIMIT 50",
  "paramBindeado": "%Historia' OR '1'='1%",
  "rowCount": 0,
  "rows": [],
  "nota": "La entrada se bindeó como literal. No se ejecutó como SQL; las tablas siguen intactas."
}
```
El input va **siempre** como `'%' || titulo || '%'` en un único parámetro `?`. Nunca se
concatena dentro del string SQL.

---

## POST /api/benchmark  (Hito 5 — opcional pero recomendado para "1k a 1M")
Corre una consulta en las 4 escalas, con y sin índice, para que el frontend dibuje la
curva tiempo vs. volumen (como las Figuras 2–4 del informe).

**Request**
```json
{ "queryId": "C1", "params": {} }
```

**200**
```json
{
  "queryId": "C1",
  "puntos": [
    { "scale": "1k",   "sinIndiceMs": 0.330,  "conIndiceMs": 0.247 },
    { "scale": "10k",  "sinIndiceMs": 3.348,  "conIndiceMs": 1.905 },
    { "scale": "100k", "sinIndiceMs": 34.91,  "conIndiceMs": 21.80 },
    { "scale": "1M",   "sinIndiceMs": 675.41, "conIndiceMs": 232.55 }
  ]
}
```
Los tiempos son medidos en vivo (no hardcodeados). Si una escala no está cargada, se omite
del arreglo.

---

## Resumen de endpoints (checklist para el frontend)

| Método | Ruta                  | Para qué                                  | Hito |
|--------|-----------------------|-------------------------------------------|------|
| GET    | /api/health           | escalas disponibles                       | B1/F1 |
| GET    | /api/queries          | catálogo de consultas                     | B2/F2 |
| POST   | /api/run              | ejecutar consulta (con/sin índice)        | B3/F3 |
| POST   | /api/injection-demo   | demo prepared statements                  | B4/F4 |
| POST   | /api/benchmark        | curva 1k→1M                               | B5/F5 |
