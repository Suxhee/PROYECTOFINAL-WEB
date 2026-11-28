# Arquitectura técnica del frontend

**Proyecto:** ERP/POS Restaurante Orígenes SV

**Versión:** 1.0

**Fecha:** Noviembre de 2026

## 1. Introducción

El frontend del sistema Restaurante Orígenes SV proporciona
una interfaz web para administrar las operaciones comerciales,
administrativas y financieras del restaurante.

La aplicación se organiza mediante una arquitectura modular
basada en componentes reutilizables, servicios de comunicación,
funciones auxiliares y páginas correspondientes a cada área
funcional del sistema.

## 2. Objetivo

Documentar la estructura técnica del frontend, las tecnologías
utilizadas, la distribución de responsabilidades, los mecanismos
de comunicación y las decisiones de implementación.

Esta documentación facilita el mantenimiento, la integración
de módulos y la incorporación de nuevas funcionalidades.

## 3. Arquitectura general del sistema

El sistema utiliza una arquitectura cliente-servidor que
separa la interfaz de usuario, la lógica del servidor y
el almacenamiento de información.

| Capa | Tecnología | Responsabilidad |
|---|---|---|
| Presentación | React | Interfaz de usuario e interacción. |
| Estilos | Bootstrap y Reactstrap | Diseño y componentes visuales. |
| Comunicación | Fetch API y HTTP | Intercambio de información. |
| Backend | Express | Servicios y lógica del servidor. |
| Acceso a datos | Sequelize | Comunicación con la base de datos. |
| Persistencia | SQL Server | Almacenamiento de información. |
| Gateway | Nginx | Distribución de archivos y proxy inverso. |

El frontend se implementa como una SPA (Single Page Application),
permitiendo navegar entre módulos sin realizar una recarga
completa del documento HTML.

La comunicación con el backend se realiza mediante solicitudes
HTTP a los servicios disponibles.

La integración definitiva de las operaciones depende de la
implementación de los endpoints correspondientes.

## 4. Tecnologías utilizadas

| Tecnología | Finalidad |
|---|---|
| JavaScript | Lenguaje de programación del frontend. |
| JSX | Definición declarativa de interfaces. |
| React | Construcción de componentes y administración de estados. |
| Vite | Servidor de desarrollo y compilación. |
| React Router | Navegación entre páginas. |
| Bootstrap | Estilos y diseño responsivo. |
| Reactstrap | Componentes visuales integrados con React. |
| CSS | Personalización de estilos. |
| Fetch API | Solicitudes HTTP. |
| Node.js | Entorno de ejecución de herramientas de desarrollo. |
| npm | Administración de dependencias. |
| Git | Control de versiones. |
| GitHub | Colaboración y almacenamiento del repositorio. |
| Nginx | Publicación del frontend compilado y proxy inverso. |
| Docker | Entornos aislados para pruebas de instalación y despliegue. |

Las versiones y requisitos de instalación se documentan
en el archivo instalacion-despliegue.md.

## 5. Organización del repositorio

El proyecto utiliza una estructura de monorepositorio,
permitiendo administrar diferentes aplicaciones y recursos
dentro de un mismo repositorio Git.

| Directorio | Responsabilidad |
|---|---|
| apps/frontend | Aplicación web de React. |
| apps/backend | Servicios del servidor Express. |
| apps/gateway | Configuración del gateway Nginx. |
| database | Recursos y scripts de base de datos. |
| scripts | Automatización de tareas del proyecto. |

La separación de responsabilidades permite desarrollar
y mantener las diferentes capas del sistema de manera
organizada.

## 6. Estructura del frontend

La aplicación frontend presenta la siguiente organización:

    apps/frontend/
    ├── docs/
    │   ├── evidencias/
    │   └── manuales/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   │   ├── layout/
    │   │   └── ui/
    │   ├── hooks/
    │   ├── mocks/
    │   ├── pages/
    │   │   ├── caja/
    │   │   ├── compras/
    │   │   ├── inventario/
    │   │   ├── pos/
    │   │   └── rrhh/
    │   ├── routes/
    │   ├── utils/
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── tests/
    ├── package.json
    └── vite.config.js

### 6.1. Responsabilidades de los directorios

| Directorio | Responsabilidad |
|---|---|
| api | Servicios de comunicación y acceso a datos. |
| components/layout | Estructura visual y navegación general. |
| components/ui | Componentes visuales reutilizables. |
| hooks | Lógica reutilizable basada en hooks de React. |
| mocks | Datos simulados para pruebas y demostraciones. |
| pages | Interfaces correspondientes a cada módulo. |
| routes | Configuración de las rutas de navegación. |
| utils | Funciones auxiliares, cálculos y validaciones. |
| tests | Pruebas automatizadas del frontend. |
| docs | Documentación técnica y funcional. |
| docs/manuales | Manuales de usuario. |
| docs/evidencias | Capturas y evidencias de funcionamiento. |

### 6.2. Archivos principales

| Archivo | Responsabilidad |
|---|---|
| main.jsx | Punto de entrada de la aplicación React. |
| App.jsx | Componente principal de la aplicación. |
| index.css | Estilos globales del frontend. |
| routes/AppRoutes.jsx | Definición de rutas. |
| components/layout/Layout.jsx | Estructura compartida de las páginas. |
| components/layout/Navbar.jsx | Barra de navegación e indicadores generales. |
| components/ErrorBoundary.jsx | Manejo de determinados errores de renderizado. |
| api/client.js | Cliente centralizado de solicitudes HTTP. |
| package.json | Dependencias y comandos del frontend. |
| vite.config.js | Configuración del entorno de desarrollo. |

Esta organización busca reducir el acoplamiento entre
módulos y facilitar la reutilización de código.

## 7. Navegación y enrutamiento

La navegación se implementa mediante React Router,
permitiendo acceder a diferentes módulos sin recargar
completamente la aplicación.

### 7.1. Rutas principales

| Ruta | Módulo |
|---|---|
| / | Redirección hacia /pos. |
| /pos | Punto de venta. |
| /inventario | Inventario y recetas. |
| /compras | Compras y proveedores. |
| /caja | Gestión de caja. |
| /rrhh | Recursos humanos. |
| * | Página de ruta no encontrada. |

### 7.2. Componentes de navegación

| Componente | Responsabilidad |
|---|---|
| BrowserRouter | Administración de la navegación mediante URL. |
| AppRoutes | Definición de las rutas disponibles. |
| Layout | Estructura visual compartida. |
| Navbar | Navegación entre módulos. |
| Outlet | Renderizado del contenido de la ruta seleccionada. |
| Navigate | Redirección entre rutas. |
| NavLink | Enlaces con identificación de la ruta activa. |
| NotFound | Pantalla para rutas inexistentes. |

### 7.3. Flujo de navegación

    main.jsx
        |
        v
    App.jsx
        |
        v
    AppRoutes.jsx
        |
        v
    Layout.jsx
        |
        +-- Navbar.jsx
        |
        +-- Outlet
              |
              +-- POS
              +-- Inventario
              +-- Compras
              +-- Caja
              +-- RRHH

La estructura compartida evita repetir la barra de
navegación en cada página.

### 7.4. Diseño responsivo

La barra de navegación utiliza componentes de Reactstrap
para adaptar su presentación a diferentes tamaños de pantalla.

En dispositivos móviles, los enlaces se presentan mediante
un menú desplegable controlado por el estado del componente.

Al seleccionar un módulo, el menú puede cerrarse
automáticamente para facilitar la navegación.

## 8. Componentes reutilizables

Los componentes visuales compartidos se encuentran
en el directorio src/components/ui.

| Componente | Responsabilidad |
|---|---|
| DataTable | Presentación de registros mediante tablas dinámicas. |
| FormField | Campos de formulario y mensajes de validación. |
| AlertMessage | Mensajes de éxito, error, advertencia e información. |
| LoadingSpinner | Indicadores de carga. |
| ConfirmModal | Confirmación de operaciones. |
| PageHeader | Encabezados y descripciones de páginas. |

Estos componentes reciben propiedades que permiten
personalizar su comportamiento y presentación.

Su reutilización facilita la consistencia visual,
reduce la duplicación de código y permite realizar
modificaciones centralizadas.

Los ejemplos de utilización se encuentran en
[componentes.md](componentes.md).

## 9. Administración de estados y hooks

El frontend utiliza los mecanismos de estado de React
para administrar información dinámica y actualizar
la interfaz cuando cambian los datos.

### 9.1. Hooks utilizados

| Hook | Responsabilidad |
|---|---|
| useState | Almacenar y actualizar estados locales. |
| useEffect | Ejecutar efectos asociados al ciclo de vida y dependencias. |
| useCallback | Mantener referencias estables de funciones según sus dependencias. |
| useLocation | Consultar la ubicación actual de la navegación. |

### 9.2. Estados de los componentes

Los componentes administran estados relacionados con:

- Información obtenida mediante servicios.
- Datos ingresados en formularios.
- Pestañas seleccionadas.
- Filtros de búsqueda.
- Apertura y cierre de ventanas modales.
- Operaciones de carga.
- Operaciones de guardado.
- Mensajes de éxito y error.

La actualización de estos estados permite que React
renderice nuevamente los componentes correspondientes.

### 9.3. Hooks personalizados

Los hooks personalizados se encuentran en src/hooks.

| Archivo | Responsabilidad |
|---|---|
| useCajaEstado.js | Consultar y actualizar el estado de caja. |
| useAlertasStock.js | Consultar insumos e identificar alertas de existencias. |

Estos hooks permiten separar la lógica de consulta
de los componentes responsables de la presentación.

### 9.4. Actualización de indicadores

La barra de navegación presenta indicadores relacionados
con el estado de caja y las alertas de stock.

Los indicadores solicitan una actualización cuando
cambia la ruta activa y periódicamente cada 30 segundos.

El intervalo se elimina mediante la función de limpieza
del efecto correspondiente para evitar mantener
temporizadores innecesarios.

### 9.5. Operaciones asíncronas

Las consultas y operaciones de registro utilizan
promesas y funciones async/await.

Se emplean estructuras try, catch y finally para
administrar los resultados, errores y estados de carga.

En determinadas consultas se utiliza una variable de
control para evitar actualizar el estado de un componente
después de que haya sido desmontado.

Esta medida no cancela directamente las solicitudes HTTP.

## 10. Comunicación con el backend

La comunicación se organiza mediante una capa de
servicios ubicada en src/api.

Esta separación permite que los componentes visuales
utilicen funciones de negocio sin implementar
directamente toda la lógica de comunicación HTTP.

### 10.1. Servicios disponibles

| Archivo | Área funcional |
|---|---|
| client.js | Cliente HTTP centralizado. |
| ventas.js | Punto de venta. |
| inventario.js | Inventario y recetas. |
| compras.js | Compras y proveedores. |
| caja.js | Operaciones de caja. |
| rrhh.js | Recursos humanos. |

La existencia de estos archivos no implica que todos
los endpoints del backend estén implementados.

### 10.2. Cliente HTTP centralizado

El archivo src/api/client.js centraliza las solicitudes
realizadas mediante Fetch API.

Sus responsabilidades incluyen:

- Construir la URL de la solicitud.
- Establecer el método HTTP.
- Preparar encabezados.
- Serializar cuerpos de solicitudes en formato JSON.
- Procesar respuestas del servidor.
- Identificar respuestas HTTP no exitosas.
- Gestionar errores de comunicación.

### 10.3. Métodos HTTP

| Método | Finalidad |
|---|---|
| GET | Consultar información. |
| POST | Registrar nuevos recursos u operaciones. |
| PUT | Actualizar recursos existentes. |
| DELETE | Eliminar recursos cuando el servicio lo permita. |

El cliente HTTP proporciona funciones auxiliares
para utilizar estos métodos.

### 10.4. Variables de entorno

| Variable | Responsabilidad |
|---|---|
| VITE_API_URL | Dirección base de los servicios HTTP. |
| VITE_USE_MOCK | Activación del modo de demostración. |

Configuración de ejemplo:

    VITE_API_URL=/api
    VITE_USE_MOCK=true

Las variables utilizadas por Vite en el navegador
no deben contener contraseñas, credenciales de base
de datos ni otros secretos.

### 10.5. Comunicación en desarrollo

    Navegador
        |
        v
    Frontend React
        |
        v
    Cliente HTTP
        |
        v
    Proxy de Vite (/api)
        |
        v
    Backend Express
        |
        v
    Sequelize
        |
        v
    SQL Server

El proxy de Vite permite dirigir las solicitudes
realizadas a /api hacia el backend configurado.

Este flujo representa la arquitectura prevista para
las operaciones que disponen de servicios reales.

### 10.6. Estado de integración

La integración real del módulo de compras depende
de la disponibilidad de los endpoints de proveedores
y compras.

Los contratos de comunicación y las diferencias
identificadas se documentan en
[integracion-backend-compras.md](integracion-backend-compras.md).

## 11. Modo de demostración

El frontend dispone de datos simulados que permiten
desarrollar y verificar funcionalidades sin depender
completamente del backend.

### 11.1. Archivos de datos simulados

| Archivo | Información |
|---|---|
| mocks/caja.js | Datos de caja. |
| mocks/compras.js | Facturas de compra. |
| mocks/empleados.js | Empleados. |
| mocks/insumos.js | Insumos y existencias. |
| mocks/productos.js | Productos. |
| mocks/proveedores.js | Proveedores. |
| mocks/recetas.js | Recetas. |

### 11.2. Funcionamiento

Cuando el servicio correspondiente utiliza el modo
de demostración, las operaciones se realizan mediante
datos simulados.

    Componente React
        |
        v
    Servicio de src/api
        |
        +-- Modo demostración
        |       |
        |       v
        |   Datos simulados
        |
        +-- Modo real
                |
                v
            Cliente HTTP
                |
                v
            Backend Express

La implementación del modo real depende de cada
servicio y de los endpoints disponibles.

### 11.3. Simulación de operaciones

En el módulo de compras se simulan operaciones
asíncronas mediante promesas y tiempos de espera.

Esto permite verificar estados de carga, registro
de información, actualización de componentes
y mensajes de confirmación.

Los datos modificados se mantienen en memoria
durante la ejecución de la aplicación.

### 11.4. Limitaciones del modo de demostración

- No proporciona persistencia permanente.
- Los datos pueden restablecerse al recargar la aplicación.
- No sustituye las validaciones del servidor.
- No garantiza autorización de usuarios.
- No representa transacciones reales de base de datos.
- No garantiza sincronización entre diferentes dispositivos.

## 12. Arquitectura del módulo de compras

El módulo de compras se encuentra en el directorio
src/pages/compras.

Su implementación separa la navegación interna,
la gestión de proveedores, el registro de compras
y la consulta de obligaciones pendientes.

### 12.1. Componentes del módulo

| Archivo | Responsabilidad |
|---|---|
| Compras.jsx | Administración de las pestañas del módulo. |
| Proveedores.jsx | Consulta, registro y edición de proveedores. |
| ProveedorForm.jsx | Formulario y validaciones de proveedores. |
| FacturaCompra.jsx | Registro de facturas y cálculo de importes. |
| ListadoCompras.jsx | Historial y filtros de compras. |
| CuentasPorPagar.jsx | Indicadores financieros y vencimientos. |

### 12.2. Organización funcional

    Compras.jsx
        |
        +-- Proveedores.jsx
        |       |
        |       +-- ProveedorForm.jsx
        |
        +-- FacturaCompra.jsx
        |
        +-- ListadoCompras.jsx
        |
        +-- CuentasPorPagar.jsx

El componente Compras.jsx utiliza un estado local
para identificar la pestaña seleccionada.

El contenido se presenta mediante renderizado
condicional según el valor de dicho estado.

### 12.3. Archivos de apoyo

| Archivo | Responsabilidad |
|---|---|
| api/compras.js | Operaciones relacionadas con compras y proveedores. |
| mocks/proveedores.js | Proveedores iniciales de demostración. |
| mocks/compras.js | Compras iniciales de demostración. |
| mocks/insumos.js | Catálogo simulado de insumos. |
| utils/alertasCompras.js | Reglas de alertas preventivas. |
| utils/format.js | Formato de importes y fechas. |
| utils/validaciones.js | Funciones auxiliares de validación. |

### 12.4. Flujo de registro de proveedores

1. El usuario abre el formulario.
2. El componente administra los datos ingresados.
3. Se ejecutan las validaciones correspondientes.
4. Se solicita el registro o actualización al servicio.
5. El servicio procesa la operación.
6. Se actualiza el listado de proveedores.
7. Se muestra el resultado de la operación.

### 12.5. Flujo de registro de compras

1. Se consultan los proveedores y los insumos disponibles.
2. El usuario completa los datos de la factura.
3. Se agregan los insumos adquiridos.
4. Se calculan los subtotales, IVA y total.
5. Se evalúan las alertas preventivas.
6. Se ejecutan las validaciones obligatorias.
7. Se construyen los datos de la solicitud.
8. Se solicita el registro mediante el servicio de compras.
9. Se presenta el resultado de la operación.
10. El formulario se restablece si el registro es exitoso.

### 12.6. Flujo de consulta financiera

Las compras registradas se consultan mediante
el servicio correspondiente.

El historial permite filtrar los registros por
proveedor y estado de pago.

El componente CuentasPorPagar identifica las facturas
no pagadas, calcula los saldos pendientes y determina
su estado de vencimiento.

### 12.7. Relación con otros módulos

| Módulo | Relación prevista |
|---|---|
| Inventario | Actualización de existencias mediante compras registradas. |
| Caja | Relación con los desembolsos asociados a compras y pagos. |
| Compras | Administración de proveedores y abastecimiento. |

La actualización real de inventario y la integración
financiera con caja requieren la implementación
de los servicios y reglas correspondientes en el backend.

Actualmente, el módulo permite demostrar su
funcionamiento mediante datos simulados.

## 13. Reglas de negocio y validaciones

Las reglas de negocio permiten establecer condiciones
que deben cumplirse durante las operaciones del sistema.

El frontend incorpora validaciones para detectar datos
incorrectos antes de solicitar una operación de registro.

### 13.1. Validaciones de proveedores

- Compañía y nombre del contacto obligatorios.
- Longitud máxima de 50 caracteres para compañía y contacto.
- Correo electrónico obligatorio y con formato válido.
- Longitud máxima de 50 caracteres para el correo.
- Teléfono opcional de ocho dígitos.
- Dirección con longitud máxima de 100 caracteres.
- Identificación de proveedores activos e inactivos.
- Verificación de correos duplicados en el servicio simulado.

### 13.2. Validaciones de compras

- Selección de un proveedor existente y activo.
- Número de factura obligatorio.
- Fecha de compra obligatoria.
- Condición de pago válida.
- Fecha límite obligatoria para compras al crédito.
- Fecha límite igual o posterior a la fecha de compra.
- Existencia de al menos un insumo en el detalle.
- Cantidades enteras positivas.
- Costos positivos con un máximo de dos decimales.
- Prevención de insumos duplicados.
- Total de compra finito y mayor que cero.
- Prevención de facturas duplicadas por proveedor
  en el servicio simulado.

### 13.3. Cálculos monetarios

El módulo de compras realiza los siguientes cálculos:

    Cantidad adquirida = Paquetes × Unidades por paquete

    Subtotal por insumo = Paquetes × Costo por paquete

    Subtotal de compra = Suma de subtotales

    IVA = Subtotal de compra × 0.13

    Total = Subtotal de compra + IVA

Los importes monetarios se redondean a dos decimales.

La condición de pago determina el estado inicial
de la factura y su saldo pendiente.

| Condición | Estado inicial | Saldo pendiente |
|---|---|---|
| Contado | Pagada | Cero |
| Crédito | Pendiente de pago | Total de la compra |

Los cálculos del frontend permiten presentar resultados
inmediatos al usuario.

En una integración real, el backend deberá validar
y recalcular los importes antes de almacenarlos.

### 13.4. Alertas preventivas

Las funciones correspondientes a las alertas se
encuentran en src/utils/alertasCompras.js.

| Función | Responsabilidad |
|---|---|
| calcularProyeccionStock | Calcular las existencias proyectadas. |
| generarAlertasStock | Identificar exceso o abastecimiento insuficiente. |
| calcularCantidadRecomendada | Calcular cantidades de abastecimiento. |
| generarSugerenciasCompra | Presentar recomendaciones de compra. |
| calcularCostoUnitario | Obtener el costo por unidad del insumo. |
| buscarUltimaCompra | Identificar una compra histórica comparable. |
| generarAlertasPrecio | Detectar incrementos de costos. |
| calcularDiasParaVencimiento | Calcular los días restantes de una factura. |
| obtenerProximosVencimientos | Identificar facturas próximas a vencer. |

La separación de estas funciones respecto a los
componentes visuales facilita su reutilización,
mantenimiento y verificación mediante pruebas automatizadas.

### 13.5. Parámetros preventivos

| Parámetro | Valor inicial |
|---|---:|
| Factor de exceso de inventario | 3 |
| Incremento porcentual de precio | 10 % |
| Anticipación de vencimientos | 7 días |

Los parámetros corresponden a valores iniciales
propuestos para el funcionamiento del módulo.

Su modificación deberá considerar las necesidades
operativas reales del restaurante.

Las alertas preventivas no bloquean el registro
de una compra que cumple las validaciones obligatorias.

Estas funcionalidades utilizan reglas deterministas
y no modelos de inteligencia artificial.

La descripción detallada de las reglas se encuentra en
[alertas-preventivas-compras.md](alertas-preventivas-compras.md).

## 14. Manejo de errores

El frontend incorpora mecanismos para identificar
y comunicar errores durante su funcionamiento.

### 14.1. Errores de validación

Los formularios verifican los datos ingresados
antes de ejecutar las operaciones correspondientes.

Cuando existen errores, se presentan mensajes
que permiten identificar y corregir los campos.

### 14.2. Errores de comunicación

El cliente HTTP centralizado permite identificar
errores relacionados con:

- Problemas de conexión.
- Respuestas HTTP no exitosas.
- Respuestas JSON que no pueden procesarse.
- Mensajes de error proporcionados por el servidor.

Los componentes utilizan estructuras try y catch
para presentar mensajes comprensibles al usuario.

### 14.3. Estados de procesamiento

Los estados de carga y guardado permiten informar
al usuario sobre operaciones en ejecución.

Durante determinadas operaciones de registro,
los botones correspondientes permanecen deshabilitados
para reducir el riesgo de solicitudes repetidas.

La estructura finally permite restablecer los estados
de procesamiento después de finalizar una operación,
independientemente de su resultado.

### 14.4. Errores de renderizado

El componente ErrorBoundary.jsx proporciona una
interfaz alternativa cuando se producen determinados
errores durante el renderizado de componentes descendientes.

Su finalidad es evitar que ciertos errores de
renderizado produzcan una interfaz completamente vacía.

Este mecanismo no sustituye el manejo de errores
de solicitudes HTTP, eventos ni operaciones asíncronas.

### 14.5. Rutas inexistentes

El componente NotFound.jsx presenta una pantalla
informativa cuando el usuario accede a una ruta
que no se encuentra definida.

La pantalla proporciona una opción para regresar
al punto de venta.

## 15. Seguridad

La seguridad del sistema requiere mecanismos
implementados tanto en el frontend como en el backend.

### 15.1. Variables de entorno

Las variables de entorno permiten configurar
la dirección de los servicios y el modo de ejecución.

Las variables con prefijo VITE_ pueden formar parte
del código distribuido al navegador.

Por este motivo, no deben utilizarse para almacenar:

- Contraseñas.
- Credenciales de SQL Server.
- Claves privadas.
- Secretos de autenticación.
- Información confidencial del servidor.

Los archivos de configuración local que contienen
información sensible no deben incorporarse al repositorio.

### 15.2. Validación de información

Las validaciones del frontend mejoran la experiencia
del usuario y permiten detectar errores tempranamente.

Sin embargo, estas validaciones pueden ser omitidas
mediante solicitudes realizadas directamente al servidor.

El backend debe verificar nuevamente los datos,
las reglas de negocio y los permisos correspondientes.

### 15.3. Autenticación y autorización

El acceso a una ruta del frontend no representa
por sí mismo una autorización para realizar operaciones.

La autenticación, autorización y verificación de roles
deben ser aplicadas mediante los mecanismos del backend.

El modo de demostración no sustituye estos controles.

### 15.4. Comunicación segura

Para un despliegue público se recomienda utilizar
HTTPS mediante una configuración adecuada de TLS.

La configuración de Nginx utilizada durante las
pruebas locales no representa una configuración
completa de seguridad para producción.

### 15.5. Dependencias

La administración de dependencias se realiza mediante npm.

Las verificaciones de dependencias y auditorías
permiten identificar determinados problemas conocidos.

Una auditoría sin vulnerabilidades reportadas
no garantiza que la aplicación sea completamente segura.

## 16. Compilación y despliegue

### 16.1. Entorno de desarrollo

Vite proporciona el servidor de desarrollo
y permite ejecutar el frontend localmente.

El proxy de desarrollo dirige las solicitudes
realizadas a /api hacia el backend configurado.

### 16.2. Compilación de producción

La compilación genera los archivos estáticos
necesarios para distribuir el frontend.

El resultado se almacena en el directorio
apps/frontend/dist.

### 16.3. Gateway Nginx

La configuración del gateway se encuentra
en apps/gateway/nginx.conf.

Nginx permite:

- Distribuir los archivos estáticos del frontend.
- Dirigir solicitudes de /api hacia el backend.
- Facilitar el acceso directo a rutas de la SPA.
- Separar la distribución del frontend del servidor Express.

### 16.4. Arquitectura prevista de despliegue

    Navegador
        |
        v
    Gateway Nginx
        |
        +-- Archivos estáticos del frontend
        |
        +-- Solicitudes /api
                |
                v
            Backend Express
                |
                v
            Sequelize
                |
                v
            SQL Server

### 16.5. Verificaciones multiplataforma

Se realizaron pruebas de instalación y compilación
en Windows y en un entorno Linux mediante Docker.

Durante estas pruebas se identificaron aspectos
relacionados con las dependencias opcionales de Rollup
y la compatibilidad entre versiones de React.

Las modificaciones experimentales de dependencias
se realizaron en una copia independiente del repositorio.

Su incorporación definitiva requiere revisión
y coordinación con el equipo.

También se verificó localmente la distribución
de archivos mediante Nginx y el comportamiento
de las rutas de la SPA.

Para comprobar el proxy se utilizó un servicio
temporal de prueba, no el backend definitivo.

Estas verificaciones no representan un despliegue
público ni una integración completa de producción.

Los procedimientos correspondientes se documentan en
[instalacion-despliegue.md](instalacion-despliegue.md).

## 17. Pruebas del frontend

Las verificaciones del frontend incluyen pruebas
funcionales manuales y pruebas automatizadas.

### 17.1. Pruebas funcionales

| Área | Aspectos evaluados |
|---|---|
| Proveedores | Registro, edición, estados y validaciones. |
| Compras | Facturas, cantidades, costos y cálculos. |
| Historial | Consulta de registros y filtros. |
| Cuentas por pagar | Saldos, estados y vencimientos. |
| Alertas preventivas | Inventario, recomendaciones y precios. |
| Navegación | Rutas, redirecciones y enlaces activos. |
| Diseño responsivo | Adaptación a diferentes tamaños de pantalla. |
| Comunicación HTTP | Procesamiento de respuestas y errores. |
| Despliegue local | Compilación, archivos estáticos y rutas. |

### 17.2. Pruebas automatizadas

El archivo tests/alertas-compras.test.js contiene
pruebas automatizadas de las funciones relacionadas
con las alertas preventivas.

Las pruebas verifican cálculos, condiciones límite
y resultados esperados de las reglas de negocio.

Durante las verificaciones realizadas se ejecutaron
22 pruebas automatizadas con resultados satisfactorios.

Estas pruebas se concentran en las funciones de alertas
y no representan una cobertura completa del frontend.

### 17.3. Evidencias

Las capturas correspondientes al módulo de compras
se encuentran en docs/evidencias/compras.

El manual de usuario incluye referencias a estas
imágenes para demostrar las funcionalidades disponibles.

### 17.4. Documentación de pruebas

Los procedimientos y verificaciones se encuentran en:

- [pruebas-compras.md](pruebas-compras.md).
- [pruebas-cuentas-por-pagar.md](pruebas-cuentas-por-pagar.md).
- [pruebas-generales.md](pruebas-generales.md).
- [alertas-preventivas-compras.md](alertas-preventivas-compras.md).

## 18. Limitaciones actuales

La implementación presenta las siguientes limitaciones:

1. El módulo de compras utiliza datos simulados.
2. No existe persistencia permanente en el modo de demostración.
3. La integración real de proveedores y compras continúa pendiente.
4. Las compras no actualizan las existencias reales del inventario.
5. La sucursal se identifica provisionalmente mediante el valor 1.
6. No se gestionan abonos parciales ni pagos reales a proveedores.
7. No se permite editar, eliminar ni anular compras desde el historial.
8. No se detectan órdenes de compra pendientes de recepción.
9. Las alertas preventivas utilizan parámetros iniciales.
10. Las recomendaciones no consideran predicciones de demanda.
11. Los vencimientos no generan notificaciones externas.
12. Los vencimientos requieren una nueva evaluación de la pantalla
    para reflejar un cambio de día.
13. La integración definitiva de las ramas del equipo está pendiente.
14. Las modificaciones experimentales de dependencias requieren revisión.
15. No se ha completado un despliegue público de producción.
16. Las pruebas automatizadas no cubren todos los componentes.
17. La autorización real depende de los mecanismos del backend.

Estas limitaciones permiten distinguir las funcionalidades
demostradas de las actividades pendientes de integración.

## 19. Documentación relacionada

| Documento | Contenido |
|---|---|
| [componentes.md](componentes.md) | Componentes reutilizables. |
| [api.md](api.md) | Documentación de servicios y contratos. |
| [integracion-frontend.md](integracion-frontend.md) | Estrategia de integración de módulos. |
| [integracion-backend-compras.md](integracion-backend-compras.md) | Estado de integración del módulo de compras. |
| [instalacion-despliegue.md](instalacion-despliegue.md) | Instalación, compilación y despliegue. |
| [alertas-preventivas-compras.md](alertas-preventivas-compras.md) | Reglas de alertas preventivas. |
| [pruebas-compras.md](pruebas-compras.md) | Pruebas funcionales de compras. |
| [pruebas-cuentas-por-pagar.md](pruebas-cuentas-por-pagar.md) | Pruebas de obligaciones financieras. |
| [pruebas-generales.md](pruebas-generales.md) | Verificaciones generales del frontend. |
| [manuales/compras.md](manuales/compras.md) | Manual de usuario de compras y proveedores. |

## 20. Conclusiones

La arquitectura del frontend del sistema Restaurante
Orígenes SV establece una estructura modular que
facilita la organización, reutilización y mantenimiento
del código.

La separación entre componentes visuales, servicios,
hooks, datos simulados y funciones auxiliares permite
desarrollar funcionalidades de manera organizada.

El módulo de compras incorpora mecanismos de gestión
de proveedores, registro de facturas, cálculos monetarios,
consulta de historial, obligaciones pendientes y
alertas preventivas.

Las pruebas realizadas permiten verificar las
funcionalidades implementadas dentro del alcance
del entorno de demostración.

La consolidación del sistema requiere completar
la integración con el backend, coordinar las ramas
del equipo y ejecutar pruebas conjuntas antes
de establecer una versión definitiva de producción.

---

Fin de la documentación de arquitectura técnica del frontend.