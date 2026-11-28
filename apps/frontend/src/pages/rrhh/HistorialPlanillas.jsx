// Historial de planillas: consulta períodos registrados y permite abrir su detalle y boletas.

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Spinner,
  Table,
} from "reactstrap";
import { obtenerPlanilla, obtenerPlanillas } from "../../api/rrhh";
import BoletaPago from "./BoletaPago";

// Normaliza la respuesta del listado de planillas.
function extraerLista(respuesta) {
  const datos = respuesta?.data ?? respuesta;
  if (Array.isArray(datos)) return datos;
  if (Array.isArray(datos?.planillas)) return datos.planillas;
  throw new Error("Respuesta de historial inválida.");
}

const moneda = (valor) =>
  new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(valor || 0));

export default function HistorialPlanillas() {
  const [planillas, setPlanillas] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [intento, setIntento] = useState(0);

  // Consulta el historial al montar el componente y cuando se reintenta.
  useEffect(() => {
    async function cargar() {
      setCargando(true);
      setError("");
      try {
        const respuesta = await obtenerPlanillas();
        setPlanillas(extraerLista(respuesta));
      } catch (err) {
        setError(err.message || "No se pudo cargar el historial.");
      } finally {
        setCargando(false);
      }
    }

    cargar();
  }, [intento]);

  // Solicita una planilla por ID; valida el detalle antes de mostrarlo.
  async function verDetalle(id) {
    if (cargandoDetalle) return;
    setCargandoDetalle(true);
    setError("");
    setDetalle(null);
    setEmpleadoSeleccionado(null);

    try {
      const respuesta = await obtenerPlanilla(id);
      const datos = respuesta?.data ?? respuesta;
      const resultado = datos?.planilla ?? datos;
      if (!resultado?.periodo || !Array.isArray(resultado.empleados ?? resultado.detalle)) throw new Error("Detalle de planilla inválido.");
      setDetalle(resultado);
    } catch (err) {
      setError(err.message || "No se pudo consultar la planilla.");
    } finally { setCargandoDetalle(false); }
  }

  if (cargando) return <Spinner />;

  // Obtiene los empleados de la planilla seleccionada, no del listado actual.
  const empleados = detalle?.empleados ?? detalle?.detalle ?? [];

  return (
    <div>
      <h4>Historial de planillas</h4>
      {error && <Alert color="danger">{error} <Button size="sm" onClick={() => setIntento(i => i+1)}>Recargar historial</Button></Alert>}
      {cargandoDetalle && <Spinner size="sm" />}

      <Table responsive bordered hover>
        <thead>
          <tr>
            <th>Período</th>
            <th>Fecha de generación</th>
            <th>Total</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {planillas.map((planilla) => (
            <tr key={planilla.id}>
              <td>{planilla.periodo}</td>
              <td>
                {planilla.fechaGeneracion
                  ? new Date(planilla.fechaGeneracion).toLocaleDateString("es-SV")
                  : "—"}
              </td>
              <td>{moneda(planilla.total ?? planilla.totalLiquido)}</td>
              <td>
                <Button
                  size="sm"
                  color="primary"
                  disabled={cargandoDetalle}
                  onClick={() => verDetalle(planilla.id)}
                >
                  Ver detalle
                </Button>
              </td>
            </tr>
          ))}
          {planillas.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                Todavía no hay planillas registradas.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {detalle && (
        <div className="card mt-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <strong>Detalle: {detalle.periodo}</strong>
            <Button
              size="sm"
              color="secondary"
              onClick={() => { setDetalle(null); setEmpleadoSeleccionado(null); }}
            >
              Cerrar detalle
            </Button>
          </div>
          <div className="card-body">
            <Table responsive bordered>
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Salario quincenal</th>
                  <th>ISSS</th>
                  <th>AFP</th>
                  <th>Renta</th>
                  <th>Líquido</th>
                  <th>Boleta</th>
                </tr>
              </thead>
              <tbody>
                {empleados.map((empleado) => (
                  <tr key={empleado.id}>
                    <td>{empleado.nombre}</td>
                    <td>{moneda(empleado.salarioQuincenal ?? empleado.salario)}</td>
                    <td>{moneda(empleado.isss)}</td>
                    <td>{moneda(empleado.afp)}</td>
                    <td>{moneda(empleado.renta)}</td>
                    <td>{moneda(empleado.liquidoPagar ?? empleado.liquido)}</td>
                    <td>
                      <Button
                        size="sm"
                        color="secondary"
                        onClick={() => setEmpleadoSeleccionado(empleado)}
                      >
                        Ver boleta
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      )}

      {empleadoSeleccionado && (
        <BoletaPago
          empleado={empleadoSeleccionado}
          periodo={detalle?.periodo}
          fechaGeneracion={detalle?.fechaGeneracion}
          simulada={detalle?.simulada}
          onCerrar={() => setEmpleadoSeleccionado(null)}
        />
      )}
    </div>
  );
}
