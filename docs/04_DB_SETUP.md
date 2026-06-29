# 04 — Setup de base de datos, entorno y ngrok

## 1. Cargar las escalas en PostgreSQL

El experimento del Hito 2 usa 4 bases independientes. Para el demo basta tener al menos
`bnp_1k` y `bnp_1m` (1k para que todo sea instantáneo, 1M para que se note el índice).

Desde los scripts del proyecto (`01_create_tables.sql`, `02_load_data.sql`, `03_missing_data.sql`):

```bash
# 1k
createdb bnp_1k
psql -d bnp_1k -f 01_create_tables.sql
psql -d bnp_1k -v scale=1000     -f 02_load_data.sql
psql -d bnp_1k -f 03_missing_data.sql

# 10k
createdb bnp_10k
psql -d bnp_10k -f 01_create_tables.sql
psql -d bnp_10k -v scale=10000   -f 02_load_data.sql
psql -d bnp_10k -f 03_missing_data.sql

# 100k
createdb bnp_100k
psql -d bnp_100k -f 01_create_tables.sql
psql -d bnp_100k -v scale=100000 -f 02_load_data.sql
psql -d bnp_100k -f 03_missing_data.sql

# 1M
createdb bnp_1m
psql -d bnp_1m -f 01_create_tables.sql
psql -d bnp_1m -v scale=1000000  -f 02_load_data.sql
psql -d bnp_1m -f 03_missing_data.sql
```

O, si ya tienen los dumps:
```bash
createdb bnp_1k && psql -d bnp_1k -f dump_1k.sql
createdb bnp_1m && psql -d bnp_1m -f dump_1M.sql
```

> El backend crea los índices de `03_QUERIES.md` automáticamente al arrancar
> (`CREATE INDEX IF NOT EXISTS`), así que **no** hay que crearlos a mano.

## 2. Config del backend (`backend/src/main/resources/application.yml`)

```yaml
server:
  port: 8080

bnp:
  default-scale: "1k"
  scales:
    "1k":   "jdbc:postgresql://localhost:5432/bnp_1k"
    "10k":  "jdbc:postgresql://localhost:5432/bnp_10k"
    "100k": "jdbc:postgresql://localhost:5432/bnp_100k"
    "1M":   "jdbc:postgresql://localhost:5432/bnp_1m"
  db-user: "postgres"
  db-password: "postgres"   # cámbialo por el tuyo; o usa variable de entorno
```

El backend abre una conexión a la URL de la escala pedida en cada request (demo, bajo
volumen de usuarios → simple y suficiente). No hace falta `AbstractRoutingDataSource`.

## 3. Config del frontend (`frontend/.env`)

```
VITE_API_URL=http://localhost:8080
```
Para la demo con ngrok, cambiar a la URL pública del túnel (ver abajo) y reiniciar Vite.

## 4. Correr en local

```bash
# Terminal 1 — backend (IntelliJ o):
./mvnw spring-boot:run        # o ./gradlew bootRun

# Terminal 2 — frontend:
npm install
npm run dev                   # http://localhost:5173
```

## 5. ngrok (deploy en vivo)

Lo más simple: **exponer solo el backend** y dejar el frontend corriendo en local
apuntando al túnel.

```bash
ngrok http 8080
# copia el URL https://xxxx.ngrok-free.app
```

Luego en `frontend/.env`:
```
VITE_API_URL=https://xxxx.ngrok-free.app
```
y reiniciar `npm run dev`.

El backend ya permite CORS desde dominios `*.ngrok-free.app` / `*.ngrok.app` (ver
`backend/CLAUDE.md`), así que el navegador no bloqueará las llamadas.

> Alternativa (un solo túnel, sin CORS): hacer `npm run build` y copiar `dist/` a
> `backend/src/main/resources/static/`, así Spring Boot sirve el frontend y el backend
> por el mismo puerto 8080, y se expone un único `ngrok http 8080`. Útil el día de la demo;
> en desarrollo mejor separados.

## 6. Notas de versión (heredadas del Hito 2)
- Postgres real del experimento: 16.x. Un dump hecho con `pg_dump` ~18 puede tirar el
  warning cosmético `unrecognized configuration parameter "transaction_timeout"` al cargar.
  No afecta los datos.
