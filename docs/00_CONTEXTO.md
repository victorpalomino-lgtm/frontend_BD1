# 00 — Contexto del proyecto (LEER PRIMERO)

> Esta carpeta `docs/` es la **única fuente de verdad** del demo backend+frontend.
> Va copiada **idéntica** en los dos proyectos (backend y frontend).
> Si necesitas saber dónde quedó el trabajo, lee en este orden:
> `05_ESTADO.md` → `02_HITOS.md` → `01_API_CONTRACT.md`.

## Qué es esto

Demo web (puntos adicionales) para el proyecto de **Base de Datos I — BNP** (UTEC, 2026.1,
prof. Brenner Ojeda). Equipo: Víctor Palomino, Sebastián Casas, Rodolfo Lara.

El Hito 1 (requisitos, ER, relacional) y el Hito 2 (implementación + experimento de
índices) **ya están entregados**. Lo que se construye aquí es **solo el demo en vivo**:
una página web simple que ejecute las consultas reales contra PostgreSQL y muestre,
en pantalla, lo que el informe demuestra en tablas estáticas.

**El protagonista del demo es la base de datos, no la UI.** Backend y frontend deben ser
lo más simples posible. Nada de autenticación, ORM pesado, ni features de adorno.

## Qué tiene que demostrar el demo (requisitos del profesor)

1. **Consultas reales** a la BD ejecutándose en vivo, mostrando tiempo y plan (EXPLAIN ANALYZE).
2. **Con índice vs. sin índice**, alternable desde la web.
3. **Una consulta de rango con índice B-tree** (es la Consulta 2, filtro por `fecha_reserva`).
4. **Sin SQL injection**: todo parámetro de usuario va por *prepared statement* (placeholders `?`),
   nunca concatenado. Hay un panel dedicado para *intentar* inyectar y ver que falla.
5. **De 1k a 1M**: poder correr una consulta sobre las 4 escalas (1k, 10k, 100k, 1M).
6. **Deploy en vivo con ngrok** el día de la sustentación.

> Nota: el apunte "quitar los índices por defecto tipo hash" se **ignora** a pedido del
> equipo (Postgres no crea índices hash por defecto; fue un apunte mal tomado).

## Arquitectura (mínima, anti-conflicto)

```
┌────────────────────┐        HTTP/JSON        ┌─────────────────────┐
│  Frontend (VS Code)│  ───────────────────▶   │  Backend (IntelliJ) │
│  React + TS + Vite │   contrato = docs/01    │  Spring Boot + JDBC │
└────────────────────┘                         └──────────┬──────────┘
                                                           │ JDBC (PreparedStatement)
                                                           ▼
                                          ┌─────────────────────────────────┐
                                          │ PostgreSQL 16                    │
                                          │ bnp_1k / bnp_10k / bnp_100k /    │
                                          │ bnp_1m  (4 dumps del Hito 2)     │
                                          └─────────────────────────────────┘
```

- **Backend** = Spring Boot con **JDBC plano (JdbcTemplate)**, sin entidades JPA. El punto
  del proyecto son queries SQL crudas + EXPLAIN; un ORM solo estorbaría y escondería el SQL.
- **Frontend** = una sola página React que consume el backend.
- **El contrato (`01_API_CONTRACT.md`) es ley.** Mientras ambos lo respeten, no se tocan
  el código entre sí y no hay conflictos.

## Regla de orquestación (importante)

- Las dos instancias de Claude Code trabajan **en carpetas distintas** y **nunca editan**
  la carpeta del otro.
- El **contrato de API solo lo cambia el humano** (Casas). Si una instancia necesita
  cambiar un endpoint, lo **propone en `05_ESTADO.md`** y espera; no rompe el contrato
  por su cuenta.
- Cada instancia, al terminar un hito, **actualiza `05_ESTADO.md`** y marca el checkbox
  en `02_HITOS.md`.

## Pendientes heredados del Hito 2 (no bloquean el demo, pero tenerlos presentes)

- `monto` / `valor_reposicion`: en el DDL son `NUMERIC(8,2)`, el diccionario del Hito 1
  decía `float`. El demo usa lo que está en la BD cargada (NUMERIC).
- Valores de dominio (CHECK) los fijó el equipo en el DDL; el demo no los cambia.
- `reserva.prioridad` es `varchar(20)`; un `ORDER BY prioridad` ordena como texto. El demo
  no depende de eso.
