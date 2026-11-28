// Formulario de apertura: selecciona un cajero activo e indica el fondo inicial.

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  Spinner,
} from "reactstrap";
import { obtenerEmpleados } from "../../api/rrhh";

// Admite la lista directa o una respuesta envuelta en data/empleados.
function extraerLista(respuesta, propiedad) {
  const datos = respuesta?.data ?? respuesta;
  if (Array.isArray(datos)) return datos;
  if (Array.isArray(datos?.[propiedad])) return datos[propiedad];
  throw new Error("Respuesta de empleados inválida.");
}

export default function AperturaCaja({ onAbrir, guardando }) {
  const [cajeros, setCajeros] = useState([]);
  const [cajeroId, setCajeroId] = useState("");
  const [montoInicial, setMontoInicial] = useState("50");
  const [cargandoCajeros, setCargandoCajeros] = useState(true);
  const [error, setError] = useState("");

  // Carga los empleados al montar el formulario y filtra los cajeros activos.
  useEffect(() => {
    async function cargarCajeros() {
      try {
        const respuesta = await obtenerEmpleados();
        const empleados = extraerLista(respuesta, "empleados");
        if (!Array.isArray(empleados)) throw new Error("Respuesta de empleados inválida.");
        const disponibles = empleados.filter(
          (empleado) =>
            empleado.activo !== false &&
            String(empleado.cargo).toLowerCase() === "cajero"
        );
        setCajeros(disponibles);
      } catch (err) {
        setError(err.message || "No se pudieron cargar los cajeros.");
      } finally {
        setCargandoCajeros(false);
      }
    }

    cargarCajeros();
  }, []);

  // Valida los campos antes de pasar los datos al componente Caja.
  function manejarSubmit(evento) {
    evento.preventDefault();
    if (guardando) return;
    setError("");

    if (!cajeroId) {
      setError("Selecciona al cajero responsable.");
      return;
    }

    if (montoInicial.trim() === "" || !Number.isFinite(Number(montoInicial)) || Number(montoInicial) < 0) {
      setError("El monto inicial debe ser mayor o igual a cero.");
      return;
    }

    onAbrir({
      cajeroId: Number(cajeroId),
      montoInicial: Number(montoInicial),
    });
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white">
        <h5 className="mb-0">Apertura de caja</h5>
      </div>
      <div className="card-body">
        <p className="text-muted">
          Registra quién inicia el turno y cuánto efectivo recibe.
        </p>

        {error && <Alert color="danger">{error}</Alert>}

        {cargandoCajeros ? (
          <Spinner size="sm" /> 
        ) : (
          <Form onSubmit={manejarSubmit}>
            <FormGroup>
              <Label for="cajeroId">Cajero responsable</Label>
              <Input
                id="cajeroId"
                type="select"
                value={cajeroId}
                onChange={(e) => setCajeroId(e.target.value)}
                required
              >
                <option value="">Selecciona un cajero</option>
                {cajeros.map((cajero) => (
                  <option key={cajero.id} value={cajero.id}>
                    {cajero.nombre}
                  </option>
                ))}
              </Input>
              {cajeros.length === 0 && (
                <small className="text-danger">
                  No hay empleados activos con cargo de cajero.
                </small>
              )}
            </FormGroup>

            <FormGroup>
              <Label for="montoInicial">Monto inicial en efectivo ($)</Label>
              <Input
                id="montoInicial"
                type="number"
                min="0"
                step="0.01"
                value={montoInicial}
                onChange={(e) => setMontoInicial(e.target.value)}
                required
              />
            </FormGroup>

            <Button
              color="success"
              type="submit"
              disabled={guardando || cargandoCajeros || cajeros.length === 0}
            >
              {guardando ? <Spinner size="sm" /> : "Abrir turno"}
            </Button>
          </Form>
        )}
      </div>
    </div>
  );
}
