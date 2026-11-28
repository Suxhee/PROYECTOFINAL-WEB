// Formulario reutilizable para registrar y editar empleados.

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import { esDuiValido, esNumeroPositivo } from "../../utils/validaciones";

function hoyLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

// Valores iniciales para un empleado nuevo.
const formularioVacio = {
  nombre: "",
  dui: "",
  cargo: "barista",
  salarioMensual: "",
  fechaIngreso: "",
};

export default function EmpleadoForm({
  abierto,
  empleado,
  onGuardar,
  onCancelar,
  guardando,
  errorServidor,
}) {
  const [formulario, setFormulario] = useState(formularioVacio);
  const [error, setError] = useState("");

  // Rellena los campos al editar o los reinicia al registrar un empleado nuevo.
  useEffect(() => {
    if (empleado) {
      setFormulario({
        nombre: empleado.nombre ?? "",
        dui: empleado.dui ?? "",
        cargo: empleado.cargo ?? "barista",
        salarioMensual: empleado.salarioMensual ?? "",
        fechaIngreso: empleado.fechaIngreso?.slice(0, 10) ?? "",
      });
    } else {
      setFormulario(formularioVacio);
    }
    setError("");
  }, [empleado, abierto]);

  // Actualiza un campo del formulario sin modificar los demás.
  function cambiar(campo, valor) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  // Valida los datos localmente antes de enviarlos al componente padre.
  function manejarSubmit(evento) {
    evento.preventDefault();
    setError("");

    if (!formulario.nombre.trim()) {
      setError("El nombre del empleado es obligatorio.");
      return;
    }

    if (!esDuiValido(formulario.dui.trim())) {
      setError("El DUI debe tener el formato 00000000-0.");
      return;
    }

    if (!formulario.cargo) {
      setError("Selecciona un cargo.");
      return;
    }

    if (
      !esNumeroPositivo(formulario.salarioMensual)
    ) {
      setError("El salario mensual debe ser mayor que cero.");
      return;
    }

    if (!formulario.fechaIngreso) {
      setError("La fecha de ingreso es obligatoria.");
      return;
    }

    const hoy = hoyLocal();
    if (formulario.fechaIngreso > hoy) {
      setError("La fecha de ingreso no puede ser futura.");
      return;
    }

    onGuardar({
      nombre: formulario.nombre.trim(),
      dui: formulario.dui.trim(),
      cargo: formulario.cargo,
      salarioMensual: Number(formulario.salarioMensual),
      fechaIngreso: formulario.fechaIngreso,
      activo: empleado?.activo ?? true,
    });
  }

  return (
    <Modal isOpen={abierto} toggle={guardando ? undefined : onCancelar}>
      <ModalHeader toggle={guardando ? undefined : onCancelar}>
        {empleado ? "Editar empleado" : "Registrar empleado"}
      </ModalHeader>
      <Form onSubmit={manejarSubmit}>
        <ModalBody>
          {(error || errorServidor) && <Alert color="danger">{error || errorServidor}</Alert>}

          <FormGroup>
            <Label for="nombreEmpleado">Nombre completo</Label>
            <Input
              id="nombreEmpleado"
              value={formulario.nombre}
              onChange={(e) => cambiar("nombre", e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label for="duiEmpleado">DUI</Label>
            <Input
              id="duiEmpleado"
              value={formulario.dui}
              onChange={(e) => cambiar("dui", e.target.value)}
              placeholder="00000000-0"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label for="cargoEmpleado">Cargo</Label>
            <Input
              id="cargoEmpleado"
              type="select"
              value={formulario.cargo}
              onChange={(e) => cambiar("cargo", e.target.value)}
            >
              <option value="barista">Barista</option>
              <option value="cajero">Cajero</option>
              <option value="gerente">Gerente</option>
            </Input>
          </FormGroup>

          <FormGroup>
            <Label for="salarioEmpleado">Salario mensual ($)</Label>
            <Input
              id="salarioEmpleado"
              type="number"
              min="0.01"
              step="0.01"
              value={formulario.salarioMensual}
              onChange={(e) => cambiar("salarioMensual", e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label for="fechaIngreso">Fecha de ingreso</Label>
            <Input
              id="fechaIngreso"
              type="date"
              max={hoyLocal()}
              value={formulario.fechaIngreso}
              onChange={(e) => cambiar("fechaIngreso", e.target.value)}
              required
            />
          </FormGroup>
        </ModalBody>

        <ModalFooter>
          <Button color="secondary" type="button" onClick={onCancelar} disabled={guardando}>
            Cancelar
          </Button>
          <Button color="primary" type="submit" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar empleado"}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}
