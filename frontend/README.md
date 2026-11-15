# Frontend — Restaurante Orígenes SV

SPA con React 19, Vite, Reactstrap, Bootstrap y React Router.

## Requisitos y ejecución

Usa Node.js 20.19+ o 22.12+ y npm. Desde `frontend/`:

```sh
npm install
cp .env.example .env
npm run dev
```

`npm run build` genera `dist/`; `npm run preview` permite previsualizar ese build.
Vite envía `/api` al backend en `http://localhost:3000`. Para cambiarlo, inicia
Vite con `BACKEND_URL=http://host:puerto npm run dev`.

## Variables de entorno

| Variable | Descripción | Valor inicial |
|---|---|---|
| `VITE_API_URL` | Prefijo del API consumido por el navegador | `/api` |
| `VITE_USE_MOCK` | Habilita datos de demostración en módulos que los implementen | `true` |

Las variables `VITE_*` se publican en el bundle del navegador: no guardar secretos
en ellas. En esta base solo POS/catálogo inicial usa fixtures; el resto de datos
de demostración permanece en `src/mocks/` y se muestran solo si `VITE_USE_MOCK=true`. Al desactivarlo,
los módulos no presentan datos de demostración; integra entonces los endpoints
mediante `src/api/`.
