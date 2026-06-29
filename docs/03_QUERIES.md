# 03 — Consultas, índices y mecánica del demo

Todo el SQL viene del Hito 2 ya entregado (Secciones 5.1–5.3 del informe). No inventar
columnas ni cambiar la lógica. Lo único que se agrega son los **placeholders `?`** para
los parámetros de usuario.

## Consulta 1 (C1) — Lectores con multas pendientes sobre el promedio
Igualdad + agregación con subconsulta. Sin parámetros de usuario.

```sql
SELECT u.id_usuario
FROM Usuario u
JOIN Lector   l ON l.id_usuario   = u.id_usuario
JOIN Prestamo p ON p.id_usuario   = u.id_usuario
JOIN Multa    m ON m.id_prestamo  = p.id_prestamo
WHERE m.estado_pago = 'Pendiente'
GROUP BY u.id_usuario
HAVING SUM(m.monto) > (
    SELECT AVG(monto) FROM Multa WHERE estado_pago = 'Pendiente'
);
```
`'Pendiente'` es una constante del dominio, no entrada de usuario → puede quedar literal.

**Índices (C1):**
```sql
CREATE INDEX IF NOT EXISTS idx_multa_estado_pago ON Multa(estado_pago);
CREATE INDEX IF NOT EXISTS idx_multa_prestamo    ON Multa(id_prestamo);
CREATE INDEX IF NOT EXISTS idx_prestamo_usuario  ON Prestamo(id_usuario);
```

## Consulta 2 (C2) — Reservas por tema desde una fecha  ★ RANGO B-TREE
Filtro de **rango** de fechas + agregación por área Dewey. Esta es la consulta que cumple
el requisito "consulta de rango con índice B-tree". El parámetro `desde` es entrada de usuario.

```sql
SELECT split_part(c.nombre_categoria, ' ', 1) AS tema,
       COUNT(*) AS num_reservas
FROM Reserva   r
JOIN Libro     li ON li.id_libro     = r.id_libro
JOIN Categoria c  ON c.id_categoria  = li.id_categoria
WHERE r.fecha_reserva >= ?            -- param: desde (date)
GROUP BY tema
ORDER BY num_reservas DESC;
```

**Índices (C2)** — `idx_reserva_fecha` es **B-tree explícito** (es el que ataca el rango):
```sql
CREATE INDEX IF NOT EXISTS idx_reserva_fecha    ON Reserva USING btree (fecha_reserva);
CREATE INDEX IF NOT EXISTS idx_libro_categoria  ON Libro(id_categoria);
CREATE INDEX IF NOT EXISTS idx_reserva_libro    ON Reserva(id_libro);
```

## Consulta 3 (C3) — Autores prolíficos sin libros perdidos
`NOT EXISTS` con joins anidados. Param de usuario: `minObras` (default 5).

```sql
SELECT a.id_autor, a.nombre, COUNT(DISTINCT e.id_libro) AS num_libros
FROM Autor a
JOIN Escribe e ON e.id_autor = a.id_autor
WHERE NOT EXISTS (
    SELECT 1
    FROM Escribe e2
    JOIN Prestamo      p  ON p.id_libro    = e2.id_libro
    JOIN Libro_Perdido lp ON lp.id_prestamo = p.id_prestamo
    WHERE e2.id_autor = a.id_autor
)
GROUP BY a.id_autor, a.nombre
HAVING COUNT(DISTINCT e.id_libro) >= ?     -- param: minObras (int)
ORDER BY num_libros DESC
LIMIT 10;
```

**Índices (C3):**
```sql
CREATE INDEX IF NOT EXISTS idx_escribe_libro        ON Escribe(id_libro);
CREATE INDEX IF NOT EXISTS idx_prestamo_libro       ON Prestamo(id_libro);
CREATE INDEX IF NOT EXISTS idx_libroperdido_prestamo ON Libro_Perdido(id_prestamo);
```

---

## Cómo medir con/sin índice (mismo método que el Hito 2)

Los índices **siempre existen** (se crean al arrancar el backend). El "sin índice" se simula
deshabilitando las rutas por índice en la sesión, no borrando índices ni llaves:

```sql
-- withIndex = false (antes del EXPLAIN, en la MISMA conexión):
SET enable_indexscan     = OFF;
SET enable_indexonlyscan = OFF;
SET enable_bitmapscan    = OFF;

-- withIndex = true:
RESET enable_indexscan;
RESET enable_indexonlyscan;
RESET enable_bitmapscan;
```

**Crítico (backend):** el `SET`, el `EXPLAIN (ANALYZE)` y el `RESET` tienen que ocurrir en
**la misma conexión física**. Con JdbcTemplate, hacerlo dentro de un único
`jdbcTemplate.execute(ConnectionCallback)` o una transacción con la misma conexión. Si se
hace en llamadas sueltas, el pool puede dar conexiones distintas y el toggle no aplica.

Para el tiempo, parsear de la salida de `EXPLAIN (ANALYZE)` las líneas:
```
Planning Time: 0.402 ms
Execution Time: 0.169 ms
```

Opcional recomendado: correr la query 1 vez de "calentamiento" y reportar la 2ª, para
evitar el ruido del primer plan (el informe promedia 3 corridas; para el demo en vivo basta 1).

---

## Payloads para el panel de SQL injection (F4)

Botones de ejemplo que el frontend puede ofrecer para pegar en el input de título:

1. `Historia' OR '1'='1`
2. `'; DROP TABLE Reserva; --`
3. `x%' UNION SELECT dni FROM Usuario --`

Resultado esperado en los tres: la app responde normal (0 o pocas filas que **literalmente**
contengan ese texto en el título), **ninguna tabla se altera**, y se muestra el
`paramBindeado` para evidenciar que entró como un solo literal. Mensaje a leer en la
sustentación: el motor recibió el payload como dato, no como código, porque se usó
prepared statement con `?`.
