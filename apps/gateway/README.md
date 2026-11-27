# Gateway

En desarrollo, Vite sirve la SPA y reenvía `/api` al backend; no hace falta
iniciar un tercer proceso. Para despliegues con Nginx, usa `nginx.conf` y publica
el contenido de `apps/frontend/dist` en el directorio estático del servidor.
