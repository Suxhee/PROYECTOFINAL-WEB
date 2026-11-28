# Frontend — Restaurante Orígenes SV

SPA con React 19, Vite, Reactstrap, Bootstrap y React Router.

## Requisitos y ejecución

Usa Node.js 20.19+ o 22.12+ y npm. Desde la raíz del monorepo:

```sh
npm run dev
```

El comando raíz inicia el frontend y el backend en paralelo. El frontend queda
en `http://127.0.0.1:5173` y Vite reenvía `/api` al backend. `npm run build`
genera `apps/frontend/dist/`; `npm run preview --workspace=origenes-sv-frontend`
permite previsualizar ese build.

## Variables de entorno

| Variable | Descripción | Valor inicial |
|---|---|---|
| `VITE_API_URL` | Prefijo del API consumido por el navegador | `/api` |
| `VITE_USE_MOCK` | Habilita datos de demostración en módulos que los implementen | `true` |

Las variables `VITE_*` se publican en el bundle del navegador: no guardar
secretos en ellas. Los mocks de cada módulo se muestran solo si
`VITE_USE_MOCK=true`. Al desactivarlo, integra los endpoints mediante `src/api/`.

## Probar Caja y RRHH sin backend

Desde la raíz, después de `npm install` y de copiar `apps/frontend/.env.example`
a `apps/frontend/.env`, ejecutar:

```sh
npm run dev --workspace=origenes-sv-frontend
npm test --workspace=origenes-sv-frontend
```

Ejecutar el segundo comando en otra terminal. Mantener `VITE_USE_MOCK=true`
para la demostración; el modo real todavía requiere implementar los endpoints.
Consultar `docs/caja-rrhh.md` y `docs/api.md`.
