// Página principal de Caja: muestra el estado y coordina los formularios de apertura y cierre.

import { modoDemostracion } from "../../api/mode";
import { useState } from "react";
import { Alert, Badge, Button, Spinner } from "reactstrap";
import { abrirCaja, cerrarCaja } from "../../api/caja";
import useCajaEstado from "../../hooks/useCajaEstado";
import AperturaCaja from "./AperturaCaja";
import CierreCaja from "./CierreCaja";
import { formatearMoneda } from "../../utils/format";

export default function Caja() {
  // Obtiene el estado compartido con el Navbar.
  const { caja, abierta, ultimoCierre, cargando, error, refrescar } = useCajaEstado();
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [errorAccion, setErrorAccion] = useState("");

  // Registra la apertura mediante la API y refresca el estado compartido.
  async function manejarApertura(datos) {
    if (guardando) return;
    setGuardando(true);
    setErrorAccion("");
    setMensaje("");

    try {
      await abrirCaja(datos);
      const actualizado = await refrescar();
      setMensaje(actualizado ? "La caja se abrió correctamente." : "Apertura registrada; no se pudo actualizar el estado.");
    } catch (err) {
      setErrorAccion(err.message || "No se pudo abrir la caja.");
    } finally {
      setGuardando(false);
    }
  }

  // Registra el cierre y vuelve a consultar el estado para actualizar la interfaz.
  async function manejarCierre(datos) {
    if (guardando) return;
    setGuardando(true);
    setErrorAccion("");
    setMensaje("");

    try {
      await cerrarCaja(datos);
      const actualizado = await refrescar();
      setMensaje(actualizado ? "El turno se cerró correctamente." : "Cierre registrado; no se pudo actualizar el estado.");
    } catch (err) {
      setErrorAccion(err.message || "No se pudo cerrar la caja.");
    } finally {
      setGuardando(false);
    }
  }

  // No muestra un formulario hasta conocer el estado real o simulado de caja.
  if (cargando) return <Spinner />;
  if (error || abierta === null) return <Alert color="danger">{error || "Estado de caja desconocido."} <Button size="sm" onClick={refrescar}>Reintentar</Button></Alert>;

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1">Caja y Flujos</h2>
          <p className="text-muted mb-0">
            Apertura, control y cierre de los turnos.
          </p>
        </div>
        <Badge color={abierta ? "success" : "secondary"} pill>
          {abierta ? "Caja abierta" : "Caja cerrada"}
        </Badge>
      </div>

      {modoDemostracion && <div className="alert alert-warning">Modo demostración: datos ficticios en memoria. No uses datos personales reales; al recargar se reinicia la sesión.</div>}
      {errorAccion && <Alert color="danger">{errorAccion}</Alert>}
      {mensaje && <Alert color="success">{mensaje}</Alert>}

      {abierta ? (
        <CierreCaja
          caja={caja}
          onCerrar={manejarCierre}
          guardando={guardando}
        />
      ) : (
        <>
          <AperturaCaja onAbrir={manejarApertura} guardando={guardando} />
          {ultimoCierre && <div className="card mt-3"><div className="card-body"><h5>Último cierre</h5><p>Cajero: {ultimoCierre.cajeroNombre}</p><p>Diferencia total: {formatearMoneda(ultimoCierre.diferenciaTotal)}</p><p>Observaciones: {ultimoCierre.observacion || "Sin observaciones"}</p></div></div>}
        </>
      )}
    </div>
  );
}
