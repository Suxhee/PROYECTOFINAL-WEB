import { useEffect, useState } from "react";
import {
    Alert,
    Button,
    Form,
    FormGroup,
    Input,
    Label,
} from 'reactstrap';

//Valores iniciales del formulario de profuctos
const FORMULARIO_INICIAL = {
    nombre: '',
    precio: '0.00',
};

//Formulario reutilizable para registrar y editar productos.
export default function ProductoForm({
    producto,
    onSubmit,
    onCancel,
    loading = false,
}) {
    //Almacena los valores ingresados por el usuario.
    const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);

    //Almacena los errores de validacion.
    const [errores, setErrores] = useState({});

    //Almacena errores generales al guardar.
    const [error, setError] = useState('');

    //Cargar los datos cuando se selecciona un producto para editar.
    useEffect(() => {
    if (producto) {
      setFormulario({
        nombre: producto.nombre ?? '',
        precio: String(producto.precio ?? '0.00'),
      });
    } else {
      // Limpia el formulario al registrar un producto nuevo.
      setFormulario({ ...FORMULARIO_INICIAL });
    }

    setErrores({});
    setError('');
  }, [producto]);

  // Actualizar el campo que el usuario modifica.
  const cambiarCampo = (event) => {
    const { name, value } = event.target;

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }));

    // Limpia el error del campo modificado.
    setErrores((actual) => ({
      ...actual,
      [name]: '',
    }));
  };

  // Comprueba que el nombre y el precio sean validos.
  const validar = () => {
    const nuevosErrores = {};
    const precio = Number(formulario.precio);

    if (!formulario.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre del producto es obligatorio.';
    }

    if (
      formulario.precio.trim() === '' ||
      !Number.isFinite(precio) ||
      precio < 0
    ) {
      nuevosErrores.precio = 'Ingresa un precio válido.';
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  // Valida y envia los datos del producto.
  const enviarFormulario = async (event) => {
    event.preventDefault();
    setError('');

    if (!validar()) return;

    // Prepara los datos con los tipos adecuados.
    const datos = {
      nombre: formulario.nombre.trim(),
      precio: Number(formulario.precio),
    };

    try {
      await onSubmit(datos);
    } catch (err) {
      setError(err.message || 'No se pudo guardar el producto.');
    }
  };

  return (
    <Form onSubmit={enviarFormulario}>
      {/* Muestra los errores generales del formulario. */}
      {error && <Alert color="danger">{error}</Alert>}

      {/* Campo para el nombre del producto. */}
      <FormGroup>
        <Label for="product-name">Nombre del producto</Label>
        <Input
          id="product-name"
          name="nombre"
          value={formulario.nombre}
          onChange={cambiarCampo}
          invalid={Boolean(errores.nombre)}
          maxLength="150"
          disabled={loading}
        />
        {errores.nombre && (
          <div className="text-danger small">{errores.nombre}</div>
        )}
      </FormGroup>

      {/* Campo para el precio de venta. */}
      <FormGroup>
        <Label for="product-price">Precio de venta ($)</Label>
        <Input
          id="product-price"
          name="precio"
          type="number"
          min="0"
          step="0.01"
          value={formulario.precio}
          onChange={cambiarCampo}
          invalid={Boolean(errores.precio)}
          disabled={loading}
        />
        {errores.precio && (
          <div className="text-danger small">{errores.precio}</div>
        )}
      </FormGroup>

      {/* Botones para guardar o cancelar. */}
      <div className="d-flex gap-2">
        <Button color="primary" type="submit" disabled={loading}>
          {loading
            ? 'Guardando...'
            : producto
              ? 'Guardar cambios'
              : 'Registrar producto'}
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