// Generación de planilla quincenal: solicita el cálculo a la capa API y presenta su resultado.

import { useState } from "react";
import {
  Alert,
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  Spinner,
  Table,
} from "reactstrap";
import { generarPlanilla } from "../../api/rrhh";
import BoletaPago from "./BoletaPago";

const moneda = (valor) =>
  new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(valor || 0));

// Admite nombres alternativos de campos en el detalle devuelto por la API.
function obtenerValor(empleado, posibles) {
  for (const campo of posibles) {
    if (empleado?.[campo] !== undefined && empleado?.[campo] !== null) {
      return Number(empleado[campo]);
    }
  }
  return 0;
}

export default function Planilla() {
  // Inicializa el período con el año, mes y quincena actuales.
  const hoy = new Date();
  const [anio, setAnio] = useState(String(hoy.getFullYear()));
  const [mes, setMes] = useState(String(hoy.getMonth() + 1));
  const [quincena, setQuincena] = useState(hoy.getDate() <= 15 ? "1" : "2");
  const [planilla, setPlanilla] = useState(null);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // Valida el período, confirma la acción y solicita generar la planilla.
  async function manejarGeneracion(evento) {
    evento.preventDefault();
    if (cargando) return;
    if (!Number.isInteger(Number(anio)) || Number(anio) < 2020 || Number(anio) > 2100) { setError("Año inválido."); return; }
    if (!window.confirm("¿Generar y registrar la planilla de este período?")) return;
    setCargando(true);
    setError("");
    setPlanilla(null);
    setEmpleadoSeleccionado(null);

    try {
      const respuesta = await generarPlanilla({
        anio: Number(anio),
        mes: Number(mes),
        quincena: Number(quincena),
      });

      // Extrae y comprueba el resultado antes de mostrarlo.
      const datos = respuesta?.data ?? respuesta;
      const resultado = datos?.planilla ?? datos;
      if (!resultado?.periodo || !Array.isArray(resultado.empleados ?? resultado.detalle)) throw new Error("Respuesta de planilla incompleta.");
      setPlanilla(resultado);
    } catch (err) {
      setError(err.message || "No se pudo generar la planilla.");
    } finally {
      setCargando(false);
    }
  }

  const empleados = planilla?.empleados ?? planilla?.detalle ?? [];
  // Suma los importes devueltos; no recalcula las deducciones individuales.
  const totales = empleados.reduce(
    (acumulado, empleado) => ({
      salario:
        acumulado.salario +
        obtenerValor(empleado, ["salarioQuincenal", "salario"]),
      isss: acumulado.isss + obtenerValor(empleado, ["isss"]),
      afp: acumulado.afp + obtenerValor(empleado, ["afp"]),
      renta: acumulado.renta + obtenerValor(empleado, ["renta"]),
      liquido:
        acumulado.liquido +
        obtenerValor(empleado, ["liquidoPagar", "liquido"]),
    }),
    { salario: 0, isss: 0, afp: 0, renta: 0, liquido: 0 }
  );

  return (
    <div>
      <h4>Generación de planilla quincenal</h4>
      <p className="text-muted">
        ISSS (3%), AFP (7.25%) y renta sobre la base gravada. En modo real, el backend devuelve los resultados definitivos.
      </p>

      {error && <Alert color="danger">{error}</Alert>}

      <Form onSubmit={manejarGeneracion} className="row g-2 align-items-end mb-4">
        <div className="col-md-3">
          <FormGroup>
            <Label for="anio">Año</Label>
            <Input
              id="anio"
              type="number"
              min="2020"
              max="2100"
              required
              disabled={cargando}
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
            />
          </FormGroup>
        </div>
        <div className="col-md-3">
          <FormGroup>
            <Label for="mes">Mes</Label>
            <Input
              id="mes"
              disabled={cargando}
              type="select"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
            >
              {[
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre",
                "Diciembre",
              ].map((nombre, indice) => (
                <option key={nombre} value={indice + 1}>
                  {nombre}
                </option>
              ))}
            </Input>
          </FormGroup>
        </div>
        <div className="col-md-3">
          <FormGroup>
            <Label for="quincena">Quincena</Label>
            <Input
              id="quincena"
              disabled={cargando}
              type="select"
              value={quincena}
              onChange={(e) => setQuincena(e.target.value)}
            >
              <option value="1">Del 1 al 15</option>
              <option value="2">Del 16 al final del mes</option>
            </Input>
          </FormGroup>
        </div>
        <div className="col-md-3 mb-3">
          <Button color="primary" type="submit" disabled={cargando}>
            {cargando ? <Spinner size="sm" /> : "Generar planilla"}
          </Button>
        </div>
      </Form>

      {planilla && (
        <>
          {planilla.simulada && <Alert color="warning">Planilla simulada: cálculo académico, no válido para pagos reales.</Alert>}
          <div className="d-flex justify-content-between flex-wrap mb-2">
            <div>
              <h5>Resultado de planilla</h5>
              <span className="text-muted">
                {planilla.periodo ||
                  `${mes}/${anio} - quincena ${quincena}`}
              </span>
            </div>
            <strong>
              Total líquido: {moneda(totales.liquido)}
            </strong>
          </div>

          <Table responsive bordered hover>
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Salario</th>
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
                  <td>
                    {moneda(
                      obtenerValor(empleado, ["salarioQuincenal", "salario"])
                    )}
                  </td>
                  <td>{moneda(obtenerValor(empleado, ["isss"]))}</td>
                  <td>{moneda(obtenerValor(empleado, ["afp"]))}</td>
                  <td>{moneda(obtenerValor(empleado, ["renta"]))}</td>
                  <td>
                    {moneda(
                      obtenerValor(empleado, ["liquidoPagar", "liquido"])
                    )}
                  </td>
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
              {empleados.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center">
                    El backend no devolvió empleados para este período.
                  </td>
                </tr>
              )}
            </tbody>
            {empleados.length > 0 && (
              <tfoot>
                <tr>
                  <th>Totales</th>
                  <th>{moneda(totales.salario)}</th>
                  <th>{moneda(totales.isss)}</th>
                  <th>{moneda(totales.afp)}</th>
                  <th>{moneda(totales.renta)}</th>
                  <th>{moneda(totales.liquido)}</th>
                  <th />
                </tr>
              </tfoot>
            )}
          </Table>
        </>
      )}

      {empleadoSeleccionado && (
        <BoletaPago
          empleado={empleadoSeleccionado}
          periodo={planilla?.periodo}
          fechaGeneracion={planilla?.fechaGeneracion}
          simulada={planilla?.simulada}
          onCerrar={() => setEmpleadoSeleccionado(null)}
        />
      )}
    </div>
  );
}
