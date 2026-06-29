# Demo BNP — Base de Datos I (puntos adicionales)

Demo web para sustentar el proyecto BNP: ejecuta en vivo las consultas del Hito 2 contra
PostgreSQL, alterna con/sin índice, mide tiempo y plan, y demuestra resistencia a SQL injection.

## Cómo está organizado (y por qué no hay conflictos)

```
proyecto-bnp/
├── docs/                 ← FUENTE DE VERDAD (va idéntica en los 2 proyectos)
│   ├── 00_CONTEXTO.md        qué es y cómo se conecta todo (leer primero)
│   ├── 01_API_CONTRACT.md    el contrato de endpoints (LEY)
│   ├── 02_HITOS.md           checklist ejecutable B1..B5 / F1..F5
│   ├── 03_QUERIES.md         el SQL, índices y mecánica del demo
│   ├── 04_DB_SETUP.md        cargar BD, .env, ngrok
│   └── 05_ESTADO.md          bitácora viva (dónde quedó el trabajo)
├── backend/CLAUDE.md     ← instrucciones para Claude Code en IntelliJ
└── frontend/CLAUDE.md    ← instrucciones para Claude Code en VS Code
```

Dos instancias de Claude Code trabajan **en paralelo y aisladas**: una solo toca el backend,
la otra solo el frontend. Lo único que comparten es `docs/` (sobre todo el contrato). Mientras
ambos respeten `01_API_CONTRACT.md`, no se pisan. El contrato **solo lo cambia el humano**.

## Setup (una vez)

1. **Crea los dos repos/carpetas reales** donde vas a trabajar:
   - uno para el backend (lo abres en IntelliJ),
   - otro para el frontend (lo abres en VS Code).
2. **Copia la carpeta `docs/` completa en CADA uno** de los dos. Así cada Claude Code lee la
   misma fuente. (Si prefieres no duplicar, ponla en un repo compartido y enlázala; pero
   duplicar es lo más simple y a prueba de fallos.)
3. Pon `backend/CLAUDE.md` en la raíz del proyecto backend y `frontend/CLAUDE.md` en la raíz
   del frontend (renómbralos a `CLAUDE.md`).

## Cómo avanzar

1. Carga al menos `bnp_1k` y `bnp_1m` en PostgreSQL (ver `docs/04_DB_SETUP.md`).
2. En IntelliJ, abre Claude Code y dile: *"Lee CLAUDE.md y arranca por el hito B1."*
3. En VS Code, abre Claude Code y dile: *"Lee CLAUDE.md y arranca por el hito F1."*
4. Cada uno marca sus hitos en `docs/02_HITOS.md` y deja nota en `docs/05_ESTADO.md`.

## Para retomar o resumir en cualquier momento
Abre `docs/05_ESTADO.md`: la tabla de hitos y el LOG te dicen exactamente dónde quedó todo.

## Checklist del día de la demo
- [ ] Backend en :8080, frontend en :5173, BD cargada (1k y 1M).
- [ ] `ngrok http 8080`; pon el URL en `frontend/.env` (`VITE_API_URL`).
- [ ] Corre C2 (rango B-tree) en 1M con índice OFF → ON: se ve el salto de tiempo.
- [ ] Panel de injection: pega un payload, muestra que entró como literal.
