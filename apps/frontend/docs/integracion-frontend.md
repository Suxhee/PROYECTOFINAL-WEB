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

## 6. Pendientes técnicos

- Integración con los endpoints reales.
- Actualización de indicadores de caja y stock.
- Incorporación del estado de carga de alertas.
- Mejora de la navegación en dispositivos móviles.
- Integración de los módulos del equipo.
- Verificación de conflictos entre ramas.
- Pruebas funcionales conjuntas.
- Verificación de instalación limpia.

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