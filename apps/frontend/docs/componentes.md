# Componentes reutilizables del frontend

Los componentes compartidos se encuentran en `src/components/ui`.
Su objetivo es evitar la duplicación de código y mantener una
interfaz consistente entre los módulos del sistema.

## DataTable

Permite mostrar registros mediante columnas dinámicas.

Propiedades:
- columns: definición de las columnas.
- rows: registros que se mostrarán.
- emptyMessage: mensaje cuando no existen registros.
- render: función opcional para personalizar una columna.

Ejemplo:

```jsx
<DataTable
  columns={[
    { key: 'nombre', label: 'Nombre' },
    {
      key: 'total',
      label: 'Total',
      render: (row) => formatearMoneda(row.total)
    }
  ]}
  rows={registros}
  emptyMessage="No hay registros."
/>
```

## FormField

Permite crear campos de formularios reutilizables
con mensajes de validación.

```jsx
<FormField
  id="correo"
  label="Correo electrónico"
  type="email"
  error={errores.correo}
/>
```

## AlertMessage

Muestra mensajes de éxito, error, advertencia e información.

```jsx
<AlertMessage color="success">
  Registro guardado correctamente.
</AlertMessage>
```

## LoadingSpinner

Muestra un indicador durante operaciones asíncronas.

```jsx
<LoadingSpinner label="Cargando registros..." />
```

## PageHeader

Muestra el título y la descripción de una página.

```jsx
<PageHeader
  title="Proveedores"
  description="Administración de proveedores"
/>
```

## ConfirmModal

Permite solicitar confirmación antes de realizar una operación.

```jsx
<ConfirmModal
  isOpen={mostrarModal}
  title="Confirmar operación"
  onCancel={cerrarModal}
  onConfirm={confirmarOperacion}
>
  ¿Desea continuar?
</ConfirmModal>
```

## Utilidades de formato

Ubicación: `src/utils/format.js`.

- formatearMoneda: presenta cantidades en dólares.
- formatearFecha: presenta fechas en formato regional.

## Utilidades de validación

Ubicación: `src/utils/validaciones.js`.

- esCorreoValido
- esDuiValido
- esNitValido
- esNumeroValido
- esCampoRequerido
- esTelefonoValido
- esNumeroPositivo