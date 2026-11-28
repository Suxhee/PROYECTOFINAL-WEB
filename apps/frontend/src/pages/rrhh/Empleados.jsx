// Listado de empleados: permite buscar, filtrar, registrar, editar y dar de baja.

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Input,
  Spinner,
  Table,
} from "reactstrap";
import {
  actualizarEmpleado,
  crearEmpleado,
  darBajaEmpleado,
  obtenerEmpleados,
} from "../../api/rrhh";
import EmpleadoForm from "./EmpleadoForm";

// Normaliza el formato de respuesta de empleados.
function extraerEmpleados(respuesta) {
  const datos = respuesta?.data ?? respuesta;
  if (Array.isArray(datos)) return datos;
  if (Array.isArray(datos?.empleados)) return datos.empleados;
  throw new Error("Respuesta de empleados inválida.");
}

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroCargo, setFiltroCargo] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("activos");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [empleadoEditar, setEmpleadoEditar] = useState(null);

  // Consulta el servicio de RRHH y actualiza el listado.
  const cargarEmpleados = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const respuesta = await obtenerEmpleados();
      setEmpleados(extraerEmpleados(respuesta));
    } catch (err) {
      setError(err.message || "No se pudieron cargar los empleados.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarEmpleados();
  }, [cargarEmpleados]);

  // Aplica los filtros de nombre, cargo y estado sobre los datos cargados.
  const empleadosFiltrados = empleados.filter((empleado) => {
    const coincideNombre = empleado.nombre
      ?.toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideCargo =
      filtroCargo === "todos" ||
      String(empleado.cargo).toLowerCase() === filtroCargo;

    const coincideEstado =
      filtroEstado === "todos" ||
      (filtroEstado === "activos" && empleado.activo !== false) ||
      (filtroEstado === "inactivos" && empleado.activo === false);

    return coincideNombre && coincideCargo && coincideEstado;
  });

  // Abre el formulario sin un empleado seleccionado para crear un registro.
  function abrirNuevo() {
    setError("");
    setEmpleadoEditar(null);
    setModalAbierto(true);
  }

  // Reutiliza el mismo formulario con los datos del empleado seleccionado.
  function abrirEdicion(empleado) {
    setError("");
    setEmpleadoEditar(empleado);
    setModalAbierto(true);
  }

  // Decide entre crear o actualizar y vuelve a cargar el listado tras guardar.
  async function guardarEmpleado(datos) {
    if (guardando) return;
    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      if (empleadoEditar) {
        await actualizarEmpleado(empleadoEditar.id, datos);
        setMensaje("Empleado actualizado.");
      } else {
        await crearEmpleado(datos);
        setMensaje("Empleado registrado.");
      }

      setModalAbierto(false);
      setEmpleadoEditar(null);
      await cargarEmpleados();
    } catch (err) {
      setError(err.message || "No se pudo guardar el empleado.");
    } finally {
      setGuardando(false);
    }
  }

  // Pide confirmación y desactiva al empleado sin eliminarlo.
  async function darDeBaja(empleado) {
    if (
      !window.confirm(
        `¿Dar de baja a ${empleado.nombre}? Su historial se conservará.`
      )
    ) {
      return;
    }

    if (guardando) return;
    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      await darBajaEmpleado(empleado.id);
      setMensaje("Empleado dado de baja.");
      await cargarEmpleados();
    } catch (err) {
      setError(err.message || "No se pudo dar de baja al empleado.");
    } finally { setGuardando(false); }
  }

  if (cargando) return <Spinner />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Empleados</h4>
        <Button color="primary" onClick={abrirNuevo} disabled={guardando}>
          + Nuevo empleado
        </Button>
      </div>

      {error && !modalAbierto && <Alert color="danger">{error} <Button size="sm" onClick={cargarEmpleados}>Recargar lista</Button></Alert>}
      {mensaje && <Alert color="success">{mensaje}</Alert>}

      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <Input
            placeholder="Buscar por nombre"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <Input
            type="select"
            value={filtroCargo}
            onChange={(e) => setFiltroCargo(e.target.value)}
          >
            <option value="todos">Todos los cargos</option>
            <option value="barista">Barista</option>
            <option value="cajero">Cajero</option>
            <option value="gerente">Gerente</option>
          </Input>
        </div>
        <div className="col-md-4">
          <Input
            type="select"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
            <option value="todos">Todos los estados</option>
          </Input>
        </div>
      </div>

      <Table responsive bordered hover>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>DUI</th>
            <th>Cargo</th>
            <th>Salario mensual</th>
            <th>Ingreso</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleadosFiltrados.map((empleado) => (
            <tr key={empleado.id}>
              <td>{empleado.nombre}</td>
              <td>{empleado.dui}</td>
              <td className="text-capitalize">{empleado.cargo}</td>
              <td>${Number(empleado.salarioMensual || 0).toFixed(2)}</td>
              <td>{empleado.fechaIngreso?.slice(0, 10)}</td>
              <td>
                {empleado.activo === false ? "Inactivo" : "Activo"}
              </td>
              <td className="d-flex gap-2">
                <Button
                  size="sm"
                  color="warning"
                  disabled={guardando}
                  onClick={() => abrirEdicion(empleado)}
                >
                  Editar
                </Button>
                {empleado.activo !== false && (
                  <Button
                    size="sm"
                    color="danger"
                    disabled={guardando}
                    onClick={() => darDeBaja(empleado)}
                  >
                    Dar de baja
                  </Button>
                )}
              </td>
            </tr>
          ))}
          {empleadosFiltrados.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center text-muted">
                No hay empleados que coincidan con los filtros.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <EmpleadoForm
        abierto={modalAbierto}
        empleado={empleadoEditar}
        onGuardar={guardarEmpleado}
        onCancelar={() => { if (!guardando) { setModalAbierto(false); setError(""); } }}
        errorServidor={error}
        guardando={guardando}
      />
    </div>
  );
}
