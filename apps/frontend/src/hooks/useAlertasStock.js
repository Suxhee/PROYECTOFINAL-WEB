import { useEffect, useState } from 'react';
import { listarInsumos } from '../api/inventario.js';
import { insumos as mockInsumos } from '../mocks/insumos.js';

export default function useAlertasStock() {
  const [estado, setEstado] = useState({ alertas: [], error: null });
  useEffect(() => {
    let active = true;
    const insumos = import.meta.env.VITE_USE_MOCK === 'true'
      ? Promise.resolve(mockInsumos)
      : listarInsumos();
    insumos.then((items) => {
      if (active) setEstado({
        alertas: items.filter((item) => Number(item.stock) <= Number(item.stockMinimo)),
        error: null,
      });
    }).catch((error) => {
      if (active) setEstado({ alertas: [], error: error.message });
    });
    return () => { active = false; };
  }, []);
  return estado;
}
