# Pruebas generales del frontend

## 1. Información general

- Proyecto: ERP/POS Orígenes SV.
- Rama: feature/compras-proveedores.
- Tipo de pruebas: manuales y funcionales.
- Entorno: desarrollo local con Vite.
- Fuente de datos: mocks y respuestas HTTP simuladas.

## 2. Mejoras implementadas

### Barra de navegación

- Menú desplegable para dispositivos móviles.
- Cierre del menú al seleccionar un módulo.
- Actualización de indicadores al cambiar de ruta.
- Actualización periódica cada 30 segundos.

### Hooks personalizados

- Incorporación de funciones de actualización.
- Manejo de estados de carga.
- Manejo de errores.
- Limpieza de efectos.
- Filtrado de insumos con stock bajo.

### Cliente HTTP

- Manejo centralizado de errores de conexión.
- Manejo de respuestas JSON incorrectas.
- Conservación de errores de cancelación.
- Manejo de códigos de estado HTTP.

## 3. Resultados de las pruebas

| Grupo de pruebas | Cantidad | Resultado |
|---|---:|---|
| Navegación responsiva | 7 | Aprobadas |
| Hook de caja | 5 | Aprobadas |
| Hook de alertas de stock | 6 | Aprobadas |
| Actualización de indicadores | 7 | Aprobadas |
| Compatibilidad del cliente HTTP | 5 | Aprobadas |
| Respuestas HTTP simuladas | 6 | Aprobadas |
| Navegación general | 13 | Aprobadas |
| Diseño responsivo | 13 | Aprobadas |
| Total | 62 | Aprobadas |

Los resultados corresponden a las verificaciones
manuales realizadas durante el desarrollo.

## 4. Pruebas del cliente HTTP

- Respuesta exitosa HTTP 200.
- Error HTTP 404.
- Error HTTP 500.
- Error de conexión.
- Respuesta JSON incorrecta.
- Restauración de la función fetch original.

## 5. Resoluciones verificadas

- 1366 x 768 píxeles.
- 768 x 1024 píxeles.
- 390 x 844 píxeles.
- 320 x 568 píxeles.

## 6. Archivos modificados

- src/components/layout/Navbar.jsx
- src/hooks/useCajaEstado.js
- src/hooks/useAlertasStock.js
- src/api/client.js

## 7. Verificación técnica

- Compilación de producción exitosa.
- Verificación de cambios mediante Git.
- Sin errores de espacios detectados.
- Sin nuevas dependencias requeridas.

## 8. Limitaciones y pruebas pendientes

- Integración con el backend real.
- Actualización de existencias después de una compra.
- Verificación de consultas periódicas al servidor.
- Actualización inmediata de indicadores después
  de operaciones realizadas en otros módulos.
- Pruebas funcionales con todos los módulos integrados.

Las pruebas realizadas con datos simulados no
garantizan el funcionamiento de la integración
definitiva con SQL Server.