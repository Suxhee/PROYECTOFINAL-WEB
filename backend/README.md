# Backend — Restaurante Orígenes SV

API inicial Express 5 con capas de rutas/controladores/servicios/modelos y
conexión SQL Server mediante Sequelize.

## Requisitos y ejecución

Requiere Node.js 20.19+ y npm, además de una instancia SQL Server accesible.
Desde `backend/`:

```sh
npm install
cp .env.example .env
# Edita las credenciales locales antes de iniciar
npm run dev
```

El servidor verifica conexión a la base de datos antes de escuchar en el puerto
configurado. `GET /api/health` indica que el proceso responde. La estructura de
modelos no sincroniza ni modifica el esquema automáticamente; usa migraciones
revisadas para preparar la base.

## Seguridad y despliegue

Helmet, límite de solicitudes, límite de JSON y CORS deshabilitado por defecto
están configurados. No se debe exponer el servicio directamente a Internet:
usa HTTPS en Nginx, configura `TRUST_PROXY` al número real de proxies y aplica
autenticación/autorización y permisos por sucursal antes de habilitar operaciones.
Mantén `DB_TRUST_SERVER_CERTIFICATE=false` en producción y protege los secretos
fuera del repositorio. La selección de dependencias no garantiza que estén libres
de vulnerabilidades; revisa avisos, versiones y lockfile antes de desplegar.

Los endpoints de negocio aún responden `501` intencionalmente: no hay
autenticación ni flujos transaccionales implementados en este scaffold.
