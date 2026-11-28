// Estado compartido de Caja para que la página y el Navbar muestren la misma información.

import { useEffect, useSyncExternalStore } from 'react';
import { obtenerEstadoCaja } from '../api/caja.js';

// Almacén a nivel de módulo; todos los componentes suscritos comparten estos datos.
let estado = { caja: null, abierta: null, ultimoCierre: null, cargando: true, error: '' };
const suscriptores = new Set();
let pendiente;
// Actualiza el estado y notifica a los componentes suscritos.
function publicar(cambios) {
  estado = { ...estado, ...cambios };
  suscriptores.forEach(fn => fn());
}
// Registra la suscripción y devuelve la función para cancelarla.
function suscribir(fn) { suscriptores.add(fn); return () => suscriptores.delete(fn); }
function snapshot() { return estado; }
// Consulta el estado; reutiliza la petición si ya hay una en curso.
export function refrescarCaja() {
  if (pendiente) return pendiente;
  publicar({ cargando: true, error: '' });
  pendiente = Promise.resolve().then(obtenerEstadoCaja).then(respuesta => {
    // Acepta respuestas directas o envueltas en data y normaliza su estructura.
    const datos = respuesta?.data ?? respuesta;
    const caja = datos?.caja ?? datos?.turno ?? null;
    const texto = String(caja?.estado ?? datos?.estado ?? '').toLowerCase();
    const abierta = datos?.abierta ?? datos?.isOpen ?? (['abierta','cerrada'].includes(texto) ? texto === 'abierta' : null);
    // No acepta un estado de apertura desconocido ni un turno abierto sin ID.
    if (typeof abierta !== 'boolean' || (abierta && caja?.id == null)) throw new Error('Respuesta de estado de caja incompleta.');
    publicar({ caja, abierta, ultimoCierre: datos?.ultimoCierre ?? null, error: '' });
    return true;
  // Si falla la consulta, se marca el estado como desconocido, no como caja cerrada.
  }).catch(err => {
    publicar({ caja: null, abierta: null, ultimoCierre: null, error: err.message || 'No se pudo consultar la caja.' });
    return false;
  }).finally(() => { pendiente = null; publicar({ cargando: false }); });
  return pendiente;
}
// Conecta React con el almacén externo y consulta el estado al montar.
export default function useCajaEstado() {
  const actual = useSyncExternalStore(suscribir, snapshot);
  useEffect(() => { refrescarCaja(); }, []);
  return { ...actual, refrescar: refrescarCaja };
}
