import { useEffect, useState } from 'react';
import { obtenerEstadoCaja } from '../api/caja.js';
import { caja as mockCaja } from '../mocks/caja.js';

export default function useCajaEstado() {
  const [estado, setEstado] = useState({ loading: true, data: null, error: null });
  useEffect(() => {
    let active = true;
    const caja = import.meta.env.VITE_USE_MOCK === 'true'
      ? Promise.resolve(mockCaja)
      : obtenerEstadoCaja();
    caja.then((data) => active && setEstado({ loading: false, data, error: null }))
      .catch((error) => active && setEstado({ loading: false, data: null, error: error.message }));
    return () => { active = false; };
  }, []);
  return estado;
}
