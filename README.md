# Restaurante Orígenes SV

Monorepo inicial para el ERP/POS multisucursal del caso de negocio.

## Estructura

- `apps/frontend/`: React 19 + Vite + Reactstrap.
- `apps/backend/`: Express + Sequelize + SQL Server.
- `apps/gateway/`: configuración Nginx para producción.
- `database/`: scripts y migraciones de base de datos.
- `scripts/dev.mjs`: supervisor para desarrollo.

## Requisitos

Node.js 20.19+ y npm. Para levantar también el backend, una instancia SQL Server
accesible con credenciales configuradas.

## Instalación y desarrollo

Desde la raíz del repositorio:

```sh
npm install
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
# Configura las credenciales SQL Server en apps/backend/.env
npm run dev
```

`npm run dev` inicia backend y frontend en una sola terminal. El frontend queda
en `http://127.0.0.1:5173`, reenvía `/api` al backend en `http://127.0.0.1:3000`
y cierra ambos procesos al presionar Ctrl+C. Puertos configurables en el `.env`
raíz con `BACKEND_PORT` y `FRONTEND_PORT`. El backend limita CORS al origen del
frontend local; configura `CORS_ORIGIN` para cambiarlo en otros entornos. El proxy
de Vite mantiene las llamadas del navegador bajo el mismo origen. Si cambias el
puerto frontend, actualiza también `CORS_ORIGIN`.

Para compilar el frontend: `npm run build`.

> Esta es una estructura de inicio: autenticación y operaciones de negocio no
> están habilitadas; consulta la documentación antes de usarla en producción.