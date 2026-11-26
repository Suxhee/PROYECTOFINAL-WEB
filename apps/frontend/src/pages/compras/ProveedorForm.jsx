import { useState } from 'react';
import {
  Button,
  Row,
  Col,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';

import FormField from '../../components/ui/FormField.jsx';

import {
  esCampoRequerido,
  esCorreoValido,
  esTelefonoValido,
} from '../../utils/validaciones.js';

const valoresIniciales = {
  compania: '',
  nombreContacto: '',
  correo: '',
  telefono: '',
  direccion: '',
  activo: true,
};

export default function ProveedorForm({
  proveedor = null,
  onSubmit,
  onCancel,
  guardando = false,
}) {
  const [formulario, setFormulario] = useState({
    ...valoresIniciales,
    ...proveedor,
  });

  const [errores, setErrores] = useState({});

  const manejarCambio = (event) => {
    const { name, value, type, checked } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setErrores((anterior) => ({
      ...anterior,
      [name]: '',
    }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!esCampoRequerido(formulario.compania)) {
      nuevosErrores.compania = 'La compañía es obligatoria.';
    } else if (formulario.compania.trim().length > 50) {
      nuevosErrores.compania = 'Máximo 50 caracteres.';
    }

    if (!esCampoRequerido(formulario.nombreContacto)) {
      nuevosErrores.nombreContacto = 'El contacto es obligatorio.';
    } else if (formulario.nombreContacto.trim().length > 50) {
      nuevosErrores.nombreContacto = 'Máximo 50 caracteres.';
    }

    if (!esCorreoValido(formulario.correo.trim())) {
      nuevosErrores.correo = 'Ingresa un correo válido.';
    } else if (formulario.correo.trim().length > 50) {
      nuevosErrores.correo = 'Máximo 50 caracteres.';
    }

    if (
      formulario.telefono.trim() !== '' &&
      !esTelefonoValido(formulario.telefono)
    ) {
      nuevosErrores.telefono = 'Ingresa un teléfono de 8 dígitos.';
    }

    if (formulario.direccion.trim().length > 100) {
      nuevosErrores.direccion = 'Máximo 100 caracteres.';
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarEnvio = (event) => {
    event.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    onSubmit({
      compania: formulario.compania.trim(),
      nombreContacto: formulario.nombreContacto.trim(),
      correo: formulario.correo.trim().toLowerCase(),
      telefono: formulario.telefono.trim(),
      direccion: formulario.direccion.trim(),
      activo: formulario.activo,
    });
  };

  return (
    <form onSubmit={manejarEnvio} noValidate>
      <Row>
        <Col md={6}>
          <FormField
            id="proveedor-compania"
            name="compania"
            label="Compañía *"
            value={formulario.compania}
            onChange={manejarCambio}
            error={errores.compania}
            maxLength={50}
            required
          />
        </Col>

        <Col md={6}>
          <FormField
            id="proveedor-contacto"
            name="nombreContacto"
            label="Nombre del contacto *"
            value={formulario.nombreContacto}
            onChange={manejarCambio}
            error={errores.nombreContacto}
            maxLength={50}
            required
          />
        </Col>

        <Col md={6}>
          <FormField
            id="proveedor-correo"
            name="correo"
            label="Correo electrónico *"
            type="email"
            value={formulario.correo}
            onChange={manejarCambio}
            error={errores.correo}
            maxLength={50}
            required
          />
        </Col>

        <Col md={6}>
          <FormField
            id="proveedor-telefono"
            name="telefono"
            label="Teléfono"
            type="tel"
            value={formulario.telefono}
            onChange={manejarCambio}
            error={errores.telefono}
            maxLength={20}
          />
        </Col>

        <Col md={12}>
          <FormField
            id="proveedor-direccion"
            name="direccion"
            label="Dirección"
            type="textarea"
            value={formulario.direccion}
            onChange={manejarCambio}
            error={errores.direccion}
            maxLength={100}
          />
        </Col>
      </Row>

      <FormGroup check className="mb-3">
        <Input
          id="proveedor-activo"
          name="activo"
          type="checkbox"
          checked={formulario.activo}
          onChange={manejarCambio}
        />

        <Label check for="proveedor-activo">
          Proveedor activo
        </Label>
      </FormGroup>

      <div className="d-flex justify-content-end gap-2">
        <Button
          type="button"
          color="secondary"
          onClick={onCancel}
          disabled={guardando}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          color="primary"
          disabled={guardando}
        >
          {guardando
            ? 'Guardando...'
            : proveedor
              ? 'Actualizar proveedor'
              : 'Registrar proveedor'}
        </Button>
      </div>
    </form>
  );
}