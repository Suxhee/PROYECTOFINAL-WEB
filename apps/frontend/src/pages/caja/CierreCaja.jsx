// Formulario de cierre: compara los montos esperados y contados por medio de pago.

import { useEffect, useMemo, useState } from "react";
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
import { obtenerResumenCaja } from "../../api/caja";

const moneda = (valor) =>
  new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(valor || 0));

// Normaliza la respuesta de la API y verifica que los montos sean válidos.
function normalizarResumen(respuesta) {
  const datos = respuesta?.data ?? respuesta;
  const resumen = {
    efectivo: Number(datos?.efectivoEsperado ?? datos?.efectivo ?? NaN),
    tarjeta: Number(datos?.tarjetaEsperada ?? datos?.tarjeta ?? NaN),
    digital: Number(
      datos?.digitalEsperado ?? datos?.digital ?? datos?.bitcoin ?? NaN
    ),
  };
  if (Object.values(resumen).some(n => !Number.isFinite(n) || n < 0)) throw new Error("Resumen de caja incompleto.");
  return resumen;
}

export default function CierreCaja({ caja, onCerrar, guardando }) {
  const [esperado, setEsperado] = useState({
    efectivo: 0,
    tarjeta: 0,
    digital: 0,
  });
  const [contado, setContado] = useState({
    efectivo: "",
    tarjeta: "",
    digital: "",
  });
  const [observacion, setObservacion] = useState("");
  const [cargando, setCargando] = useState(true);
  const [resumenValido, setResumenValido] = useState(false);
  const [intento, setIntento] = useState(0);
  const [error, setError] = useState("");

  // Consulta el resumen al abrir el formulario o al reintentar la carga.
  useEffect(() => {
    async function cargarResumen() {
      setCargando(true);
      setResumenValido(false);
      setError("");
      try {
        const respuesta = await obtenerResumenCaja();
        setEsperado(normalizarResumen(respuesta));
        setResumenValido(true);
      } catch (err) {
        setError(err.message || "No se pudo cargar el resumen de caja.");
      } finally {
        setCargando(false);
      }
    }

    cargarResumen();
  }, [caja?.id, intento]);

  // Calcula el sobrante o faltante por método cuando cambian los conteos.
  const diferencias = useMemo(
    () => ({
      efectivo: Math.round(Number(contado.efectivo || 0)*100 - Math.round(esperado.efectivo*100))/100,
      tarjeta: Math.round(Number(contado.tarjeta || 0)*100 - Math.round(esperado.tarjeta*100))/100,
      digital: Math.round(Number(contado.digital || 0)*100 - Math.round(esperado.digital*100))/100,
    }),
    [contado, esperado]
  );

  const diferenciaTotal = Object.values(diferencias).reduce(
    (total, diferencia) => total + diferencia,
    0
  );

  // Solo considera diferencias cuando se han ingresado todos los conteos.
  const completo = Object.values(contado).every(v => v !== "");
  const hayDiferencias = completo && Object.values(diferencias).some(
    (diferencia) => Math.abs(diferencia) >= 0.01
  );

  function cambiarConteo(metodo, valor) {
    setContado((actual) => ({ ...actual, [metodo]: valor }));
  }

  // Valida los montos, exige una explicación si hay diferencias y confirma el cierre.
  function manejarSubmit(evento) {
    evento.preventDefault();
    if (!resumenValido || guardando) return;
    setError("");

    const camposIncompletos = Object.values(contado).some(
      (valor) => valor === "" || !Number.isFinite(Number(valor)) || Number(valor) < 0
    );

    if (camposIncompletos) {
      setError("Ingresa el monto contado de los tres métodos de pago.");
      return;
    }

    if (hayDiferencias && !observacion.trim()) {
      setError("Explica la diferencia en el campo de observaciones.");
      return;
    }

    const confirmado = window.confirm(
      "¿Confirmas el cierre del turno de caja?"
    );

    if (!confirmado) return;

    onCerrar({
      turnoId: caja.id,
      efectivoContado: Number(contado.efectivo),
      tarjetaContada: Number(contado.tarjeta),
      digitalContado: Number(contado.digital),
      observacion: observacion.trim(),
    });
  }

  if (cargando) return <Spinner />;
  if (!resumenValido) return <Alert color="danger">{error} <Button size="sm" onClick={() => setIntento(i => i + 1)}>Reintentar</Button></Alert>;

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white">
        <h5 className="mb-0">Cierre y cuadre de caja</h5>
      </div>
      <div className="card-body">
        <p className="text-muted mb-3">
          Compara los montos registrados por el sistema con el dinero contado.
        </p>

        {caja?.cajeroNombre && (
          <p>
            <strong>Cajero:</strong> {caja.cajeroNombre}
          </p>
        )}
        {error && <Alert color="danger">{error}</Alert>}

        <Form onSubmit={manejarSubmit}>
          <Table responsive bordered>
            <thead>
              <tr>
                <th>Método de pago</th>
                <th>Esperado</th>
                <th>Contado</th>
                <th>Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["efectivo", "Efectivo"],
                ["tarjeta", "Tarjeta"],
                ["digital", "Digital (Bitcoin/Chivo Wallet)"],
              ].map(([key, label]) => (
                <tr key={key}>
                  <td>{label}</td>
                  <td>{moneda(esperado[key])}</td>
                  <td style={{ minWidth: "145px" }}>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={contado[key]}
                      onChange={(e) => cambiarConteo(key, e.target.value)}
                      required
                    />
                  </td>
                  <td
                    className={
                      Math.abs(diferencias[key]) >= 0.01
                        ? "text-danger fw-bold"
                        : "text-success"
                    }
                  >
                    {contado[key] === "" ? "—" : moneda(diferencias[key])}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan="3">Diferencia total</th>
                <th className={hayDiferencias ? "text-danger" : "text-success"}>
                  {completo ? moneda(diferenciaTotal) : "—"}
                </th>
              </tr>
            </tfoot>
          </Table>

          {hayDiferencias && (
            <Alert color="warning">
              Se detectaron diferencias. Debes registrar una observación antes
              de cerrar la caja.
            </Alert>
          )}

          <FormGroup>
            <Label for="observacion">Observaciones</Label>
            <Input
              id="observacion"
              type="textarea"
              rows="3"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Explica las diferencias, si existen."
            />
          </FormGroup>

          <Button color="danger" type="submit" disabled={guardando || !completo}>
            {guardando ? <Spinner size="sm" /> : "Confirmar cierre"}
          </Button>
        </Form>
      </div>
    </div>
  );
}
