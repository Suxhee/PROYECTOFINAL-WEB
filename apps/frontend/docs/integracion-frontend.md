# Integración de módulos del frontend

## Información general

- Proyecto: ERP/POS Orígenes SV.
- Fecha: 26/11/2026.
- Rama: feature/compras-proveedores.
- Tecnologías: React, Vite, Bootstrap y Reactstrap.

## 1. Arquitectura del frontend

El frontend está organizado en las siguientes carpetas:

- api: servicios de comunicación con el backend.
- components: componentes compartidos.
- hooks: lógica reutilizable de React.
- mocks: datos simulados.
- pages: páginas correspondientes a cada módulo.
- routes: configuración de navegación.
- utils: funciones auxiliares.

## 2. Rutas principales

| Ruta | Módulo |
|---|---|
| /pos | Punto de venta |
| /inventario | Inventario y recetas |
| /compras | Compras y proveedores |
| /caja | Gestión de caja |
| /rrhh | Recursos humanos |

La aplicación utiliza BrowserRouter, AppRoutes,
Layout y Outlet para administrar la navegación.

## 3. Componentes compartidos

- DataTable.
- FormField.
- AlertMessage.
- LoadingSpinner.
- ConfirmModal.
- PageHeader.

Estos componentes permiten mantener una interfaz
consistente y reducir la duplicación de código.

## 4. Estrategia de integración

Se propone integrar las ramas en el siguiente orden:

1. feature/frontend-base hacia develop.
2. feature/compras-proveedores hacia develop.
3. Ramas correspondientes a los demás módulos.

El orden y método de integración deberán acordarse
con los integrantes del equipo.

Se recomienda conservar el historial de commits
al integrar la rama base, debido a que la rama
de compras deriva de ella.

## 5. Comunicación entre módulos

El registro de compras deberá actualizar las
existencias del inventario mediante el backend.

Los indicadores de caja y alertas de stock
deberán reflejar los cambios realizados en
los módulos correspondientes.

## 6. Estado de implementación y pendientes técnicos

### 6.1. Actividades completadas

- Implementación de la navegación general del frontend.
- Incorporación de indicadores de caja y alertas de stock.
- Actualización periódica de indicadores cada 30 segundos.
- Incorporación de estados de carga y mensajes de error.
- Adaptación de la navegación a dispositivos móviles.
- Centralización de las solicitudes HTTP.
- Incorporación de una pantalla para rutas inexistentes.
- Implementación de un componente ErrorBoundary.
- Implementación de alertas preventivas de compras.
- Ejecución satisfactoria de 22 pruebas automatizadas de alertas.
- Elaboración del manual de usuario de compras y proveedores.
- Elaboración de la documentación de arquitectura técnica.

### 6.2. Actividades verificadas experimentalmente

- Instalación limpia de dependencias en Windows.
- Instalación y compilación en Linux mediante Docker.
- Compilación de producción del frontend.
- Distribución de archivos estáticos mediante Nginx.
- Verificación de rutas de la SPA mediante Nginx.
- Verificación del proxy mediante un servicio temporal de prueba.

Las modificaciones experimentales de dependencias se
realizaron en una copia independiente del repositorio.

Su incorporación definitiva requiere coordinación
y aprobación del equipo.

### 6.3. Actividades pendientes

- Integración con los endpoints reales del backend.
- Actualización real del inventario mediante compras.
- Integración de los módulos desarrollados por el equipo.
- Verificación y resolución de conflictos entre ramas.
- Pruebas funcionales conjuntas.
- Consolidación de las dependencias definitivas.
- Prueba controlada del componente ErrorBoundary.
- Verificación de autenticación y autorización.
- Despliegue público del sistema.
- Validación integral de la versión final.

Las funcionalidades verificadas en modo de demostración
no deben considerarse automáticamente integradas con
el backend ni con la base de datos.

## 7. Verificaciones realizadas

| Verificación | Resultado |
|---|---|
| Estructura de carpetas | Correcta |
| Configuración de rutas | Correcta |
| Dependencias instaladas | Verificadas |
| Componentes compartidos | Verificados |
| Directorio de trabajo Git | Limpio antes de documentar |
| Cambios acumulados | Sin errores de espacios |
| Compilación de producción | Exitosa |

La compilación se realizó con Vite 6.4.6,
transformando 281 módulos en 4.20 segundos.

## 8. Limitaciones actuales

El módulo de compras funciona con datos simulados.

La integración definitiva depende de la
implementación del backend y de la disponibilidad
de las ramas de los demás integrantes.

La compilación exitosa no garantiza por sí sola
el funcionamiento de todos los módulos integrados.