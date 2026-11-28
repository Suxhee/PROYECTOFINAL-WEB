# Instalación y despliegue del frontend

## 1. Objetivo

Documentar el procedimiento de instalación, compilación y despliegue local del frontend del sistema ERP/POS Restaurante Orígenes SV, garantizando su reproducibilidad en los entornos evaluados.

Fecha de verificación: 27 de noviembre de 2026.

## 2. Tecnologías utilizadas

- React.
- React Router DOM.
- Reactstrap.
- Bootstrap.
- Vite.
- Node.js.
- npm.
- Nginx.
- Docker.

## 3. Requisitos del sistema

- Node.js 20.19 o superior, respetando los requisitos de las dependencias.
- npm.
- Git.
- Docker Desktop para las pruebas de despliegue local.
- SQL Server para la integración con el backend real.

## 4. Instalación del proyecto

Desde la raíz del repositorio, ejecutar:

```sh
npm ci
```

Este comando instala las dependencias utilizando las versiones registradas en el archivo package-lock.json.

La instalación reproducible fue verificada con una configuración experimental corregida del archivo lock. Su incorporación al repositorio compartido está pendiente de aprobación.

## 5. Variables de entorno

Crear el archivo apps/frontend/.env utilizando como referencia apps/frontend/.env.example.

```env
VITE_API_URL=/api
VITE_USE_MOCK=true
```

VITE_API_URL establece la dirección base de los servicios de API.

VITE_USE_MOCK permite utilizar datos simulados durante el desarrollo y las demostraciones.

Las variables con prefijo VITE_ pueden quedar expuestas en la compilación del frontend, por lo que no deben contener credenciales privadas.

## 6. Ejecución en desarrollo

Para ejecutar únicamente el frontend:

```sh
npm run dev --workspace=origenes-sv-frontend
```

Para iniciar conjuntamente el frontend y el backend:

```sh
npm run dev
```

El segundo procedimiento requiere configurar previamente las variables de entorno y la conexión a SQL Server del backend.

## 7. Compilación de producción

Desde la raíz del repositorio:

```sh
npm run build
```

Los archivos generados se almacenan en apps/frontend/dist.

El resultado incluye el documento HTML principal, los recursos JavaScript y CSS optimizados y los archivos públicos de la aplicación.

## 8. Vista previa de producción

```sh
npm run preview --workspace=origenes-sv-frontend
```

Este comando permite verificar localmente la versión compilada antes de realizar un despliegue.

No constituye un alojamiento público de la aplicación.

## 9. Configuración de Nginx

El proyecto dispone del archivo apps/gateway/nginx.conf.

Nginx cumple las siguientes responsabilidades:

- Servir los archivos compilados del frontend.
- Escuchar solicitudes en el puerto 8080.
- Redirigir las solicitudes de API al backend.
- Permitir la navegación directa y recarga de rutas SPA.

La configuración de rutas utiliza:

```nginx
try_files $uri $uri/ /index.html;
```

Esta instrucción permite entregar el documento HTML principal cuando una ruta no corresponde a un archivo físico.

La comunicación con el backend utiliza:

```nginx
proxy_pass http://backend:3000/api/;
```

El nombre backend debe resolverse dentro de la infraestructura de despliegue.

## 10. Pruebas de despliegue con Docker

Se utilizó la imagen nginx:stable-alpine y una red independiente denominada origenes-prueba-net.

Se crearon dos contenedores:

- origenes-gateway-prueba: servidor del frontend compilado.
- origenes-backend-prueba: servidor HTTP temporal para comprobar el proxy inverso.

La configuración original de Nginx fue utilizada sin modificaciones.

La aplicación se publicó localmente en el puerto 8080.

El endpoint temporal /api/health respondió con HTTP 200 y contenido JSON.

El backend temporal no implementa operaciones de negocio ni conexión a SQL Server.

## 11. Verificación de rutas SPA

| Ruta | Resultado HTTP |
|---|---|
| / | 200 |
| /pos | 200 |
| /compras | 200 |
| /inventario | 200 |
| /caja | 200 |
| /rrhh | 200 |
| /ruta-inexistente | 200 |
| /api/health | 200 |
| /api/ruta-inexistente | 404 |

Se comprobó mediante SHA-256 que todas las rutas del frontend entregan el mismo documento HTML.

También se verificó la disponibilidad de los recursos JavaScript, CSS y SVG con sus respectivos tipos de contenido.

Se completaron satisfactoriamente las 12 pruebas visuales mediante Nginx, incluyendo navegación, recarga de rutas, registro de proveedores, registro de facturas, alertas preventivas, cuentas por pagar, página de error y revisión de la consola del navegador.

## 12. Corrección de dependencias de Rollup

Durante una instalación limpia en Windows se identificó la ausencia de la dependencia nativa de Rollup correspondiente a la plataforma.

El problema impedía ejecutar la compilación del frontend.

En una copia independiente del repositorio se regeneró el archivo package-lock.json incluyendo las dependencias opcionales.

Posteriormente se verificó la instalación mediante npm ci tanto en Windows como en Linux.

Las dependencias nativas verificadas fueron:

- @rollup/rollup-win32-x64-msvc.
- @rollup/rollup-linux-x64-gnu.

Ambas correspondientes a Rollup 4.68.9 en la configuración experimental.

## 13. Compatibilidad de React

Durante la regeneración de dependencias se detectó la instalación simultánea de React 18 y React 19.

La dependencia react-popper, utilizada por Reactstrap, declara compatibilidad con React 16.8, 17 y 18.

Como solución experimental se establecieron las versiones:

- React 18.3.1.
- React DOM 18.3.1.

La modificación permitió obtener un árbol de dependencias con una única versión de React.

La compilación, las pruebas unitarias y las pruebas funcionales locales fueron satisfactorias.

El cambio de versión requiere aprobación del equipo antes de incorporarse al repositorio compartido.

## 14. Resultados multiplataforma

| Comprobación | Windows | Linux |
|---|---|---|
| Instalación limpia | Exitosa | Exitosa |
| Dependencia nativa de Rollup | Correcta | Correcta |
| Compilación | Exitosa | Exitosa |
| Tiempo de compilación registrado | 4.10 s | 5.28 s |
| Módulos transformados | 280 | 280 |
| JavaScript compilado | 286.26 KB | 286.26 KB |
| CSS compilado | 231.65 KB | 231.65 KB |
| Pruebas unitarias aprobadas | 22 | 22 |
| Pruebas unitarias fallidas | 0 | 0 |
| Vulnerabilidades reportadas | 0 | 0 |
| Versión de React | 18.3.1 | 18.3.1 |
| Versión de Rollup | 4.68.9 | 4.68.9 |

Las pruebas corresponden a la configuración experimental de dependencias.

## 15. Advertencias identificadas

Durante la instalación se identificaron las siguientes advertencias:

- Dependencia obsoleta dottie 2.0.7.
- Script postinstall de esbuild pendiente de aprobación explícita.
- Disponibilidad de una nueva versión de npm.

Estas advertencias no impidieron la instalación ni la compilación en los entornos evaluados.

La auditoría de npm no reportó vulnerabilidades conocidas en las comprobaciones realizadas.

## 16. Limitaciones y actividades pendientes

- Aprobar la unificación de React con el equipo.
- Incorporar las correcciones de dependencias al repositorio compartido.
- Integrar los servicios reales del backend.
- Verificar las operaciones con SQL Server.
- Realizar el despliegue público definitivo.
- Actualizar el README general después de aprobar la configuración compartida.

## 17. Conclusión

Las pruebas realizadas demuestran que la configuración experimental del frontend puede instalarse y compilarse correctamente en Windows y Linux.

También se verificó el funcionamiento de Nginx como servidor de archivos estáticos y proxy inverso mediante un backend temporal.

Estos resultados proporcionan una base técnica para el despliegue definitivo del sistema, sujeto a la integración de los módulos y la aprobación de las dependencias compartidas.