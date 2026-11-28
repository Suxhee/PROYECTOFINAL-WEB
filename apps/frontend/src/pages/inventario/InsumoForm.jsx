
import { useEffect, useState } from 'react';

import {
  Alert,
  Button,
  Form,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';

// Valores iniciales del formulario.
// Todos los campos numéricos comienzan como cadenas.
const FORMULARIO_INICIAL = {
  name: '',
  quantity: '0',
  minimumQuantity: '0',
  unit: '',
  branchId: '1',
};

// Formulario reutilizable para registrar y editar insumos.
export default function InsumoForm({
  insumo,
  onSubmit,
  onCancel,
  loading = false,
}) {
  // Guarda los valores introducidos en el formulario.
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);

  // Almacena los errores individuales de cada campo.
  const [errores, setErrores] = useState({});

  // Almacena los errores generales al guardar.
  const [error, setError] = useState('');

  // Carga los datos del insumo cuando se selecciona para editar.
  useEffect(() => {
    if (insumo) {
      setFormulario({
        name: insumo.name ?? '',
        quantity: String(insumo.quantity ?? 0),

        // También reconoce el nombre antiguo incorrecto para recuperar
        // registros que pudieran haberse guardado con esa propiedad.
        minimumQuantity: String(
          insumo.minimumQuantity ?? insumo.minimunQuantity ?? 0
        ),

        unit: insumo.unit ?? '',
        branchId: String(insumo.branchId ?? 1),
      });
    } else {
      // Inicializa un formulario vacío para un registro nuevo.
      setFormulario({ ...FORMULARIO_INICIAL });
    }

    // Limpia los errores al cambiar de insumo.
    setErrores({});
    setError('');
  }, [insumo]);

  // Actualiza el estado cuando el usuario modifica un campo.
  const cambiarCampo = (event) => {
    const { name, value } = event.target;

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }));

    // Limpia el error del campo que se está modificando.
    setErrores((actual) => ({
      ...actual,
      [name]: '',
    }));
  };

  // Comprueba que los datos ingresados sean válidos.
  const validar = () => {
    const nuevosErrores = {};

    // Comprueba que el nombre no esté vacío.
    if (!formulario.name.trim()) {
      nuevosErrores.name = 'El nombre es obligatorio.';
    }

    // Comprueba que se haya indicado una unidad de medida.
    if (!formulario.unit.trim()) {
      nuevosErrores.unit = 'La unidad de medida es obligatoria.';
    }

    // Convierte los valores numéricos para poder validarlos.
    const cantidad = Number(formulario.quantity);
    const cantidadMinima = Number(formulario.minimumQuantity);
    const sucursal = Number(formulario.branchId);

    // Valida las existencias actuales.
    if (
      formulario.quantity.trim() === '' ||
      !Number.isFinite(cantidad) ||
      cantidad < 0
    ) {
      nuevosErrores.quantity = 'Ingresa una existencia válida.';
    }

    // Valida la cantidad mínima.
    if (
      formulario.minimumQuantity.trim() === '' ||
      !Number.isFinite(cantidadMinima) ||
      cantidadMinima < 0
    ) {
      nuevosErrores.minimumQuantity = 'Ingresa un mínimo válido.';
    }

    // Comprueba que la sucursal sea un número entero positivo.
    if (
      formulario.branchId.trim() === '' ||
      !Number.isInteger(sucursal) ||
      sucursal <= 0
    ) {
      nuevosErrores.branchId =
        'La sucursal debe ser un número positivo.';
    }

    // Guarda los errores encontrados.
    setErrores(nuevosErrores);

    // Devuelve true únicamente si no hay errores.
    return Object.keys(nuevosErrores).length === 0;
  };

  // Procesa el envío del formulario.
  const enviarFormulario = async (event) => {
    event.preventDefault();
    setError('');

    // Detiene el envío si algún campo no es válido.
    if (!validar()) {
      return;
    }

    // Prepara los datos y convierte las cantidades a números.
    const datos = {
      name: formulario.name.trim(),
      quantity: Number(formulario.quantity),
      minimumQuantity: Number(formulario.minimumQuantity),
      unit: formulario.unit.trim(),
      branchId: Number(formulario.branchId),
    };

    try {
      // Envía los datos al componente que administra los insumos.
      await onSubmit(datos);
    } catch (err) {
      // Muestra cualquier error producido durante el guardado.
      setError(err.message || 'No se pudo guardar el insumo.');
    }
  };

  return (
    <Form onSubmit={enviarFormulario}>
      {/* Muestra los errores generales del formulario. */}
      {error && <Alert color="danger">{error}</Alert>}

      {/* Campo para el nombre del insumo. */}
      <FormGroup>
        <Label for="insumo-name">Nombre del insumo</Label>
        <Input
          id="insumo-name"
          name="name"
          value={formulario.name}
          onChange={cambiarCampo}
          invalid={Boolean(errores.name)}
          maxLength="150"
          disabled={loading}
        />
        {errores.name && (
          <div className="text-danger small">{errores.name}</div>
        )}
      </FormGroup>

      {/* Campo para las existencias actuales. */}
      <FormGroup>
        <Label for="insumo-quantity">Existencia actual</Label>
        <Input
          id="insumo-quantity"
          name="quantity"
          type="number"
          min="0"
          step="0.001"
          value={formulario.quantity}
          onChange={cambiarCampo}
          invalid={Boolean(errores.quantity)}
          disabled={loading}
        />
        {errores.quantity && (
          <div className="text-danger small">{errores.quantity}</div>
        )}
      </FormGroup>

      {/* Campo para establecer el mínimo de existencias. */}
      <FormGroup>
        <Label for="insumo-minimum">Existencia mínima</Label>
        <Input
          id="insumo-minimum"
          name="minimumQuantity"
          type="number"
          min="0"
          step="0.001"
          value={formulario.minimumQuantity}
          onChange={cambiarCampo}
          invalid={Boolean(errores.minimumQuantity)}
          disabled={loading}
        />
        {errores.minimumQuantity && (
          <div className="text-danger small">
            {errores.minimumQuantity}
          </div>
        )}
      </FormGroup>

      {/* Campo para la unidad de medida del insumo. */}
      <FormGroup>
        <Label for="insumo-unit">Unidad de medida</Label>
        <Input
          id="insumo-unit"
          name="unit"
          value={formulario.unit}
          onChange={cambiarCampo}
          invalid={Boolean(errores.unit)}
          placeholder="Ej. lb, kg, litros, unidades"
          maxLength="30"
          disabled={loading}
        />
        {errores.unit && (
          <div className="text-danger small">{errores.unit}</div>
        )}
      </FormGroup>

      {/* Campo para identificar la sucursal del insumo. */}
      <FormGroup>
        <Label for="insumo-branch">Identificador de sucursal</Label>
        <Input
          id="insumo-branch"
          name="branchId"
          type="number"
          min="1"
          step="1"
          value={formulario.branchId}
          onChange={cambiarCampo}
          invalid={Boolean(errores.branchId)}
          disabled={loading}
        />
        {errores.branchId && (
          <div className="text-danger small">{errores.branchId}</div>
        )}
      </FormGroup>

      {/* Botones para guardar o cancelar la operación. */}
      <div className="d-flex gap-2">
        <Button color="primary" type="submit" disabled={loading}>
          {loading
            ? 'Guardando...'
            : insumo
              ? 'Guardar cambios'
              : 'Registrar insumo'}
        </Button>

        <Button
          color="secondary"
          outline
          type="button"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </Form>
  );
}

