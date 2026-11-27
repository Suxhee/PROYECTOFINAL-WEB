import { useCallback, useEffect, useState } from 'react';
import { listarInsumos } from '../api/inventario.js';
import { insumos as mockInsumos } from '../mocks/insumos.js';

export default function useAlertasStock() {
  const [estado, setEstado] = useState({
    loading: true,
    alertas: [],
    error: null,
  });

  const [version, setVersion] = useState(0);

  const actualizar = useCallback(() => {
    setVersion((anterior) => anterior + 1);
  }, []);

  useEffect(() => {
    let active = true;

    const cargarAlertas = async () => {
      setEstado((anterior) => ({
        ...anterior,
        loading: true,
        error: null,
      }));

      try {
        const items = import.meta.env.VITE_USE_MOCK === 'true'
          ? mockInsumos
          : await listarInsumos();

        const alertas = items.filter(
          (item) => Number(item.stock) <= Number(item.stockMinimo)
        );

        if (active) {
          setEstado({
            loading: false,
            alertas,
            error: null,
          });
        }
      } catch (error) {
        if (active) {
          setEstado({
            loading: false,
            alertas: [],
            error: error.message,
          });
        }
      }
    };

    cargarAlertas();

    return () => {
      active = false;
    };
  }, [version]);

  return { ...estado, actualizar };
}