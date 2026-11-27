import { useCallback, useEffect, useState } from 'react';
import { obtenerEstadoCaja } from '../api/caja.js';
import { caja as mockCaja } from '../mocks/caja.js';

export default function useCajaEstado() {
  const [estado, setEstado] = useState({
    loading: true,
    data: null,
    error: null,
  });

  const [version, setVersion] = useState(0);

  const actualizar = useCallback(() => {
    setVersion((anterior) => anterior + 1);
  }, []);

  useEffect(() => {
    let active = true;

    const cargarEstado = async () => {
      setEstado((anterior) => ({
        ...anterior,
        loading: true,
        error: null,
      }));

      try {
        const data = import.meta.env.VITE_USE_MOCK === 'true'
          ? mockCaja
          : await obtenerEstadoCaja();

        if (active) {
          setEstado({
            loading: false,
            data,
            error: null,
          });
        }
      } catch (error) {
        if (active) {
          setEstado({
            loading: false,
            data: null,
            error: error.message,
          });
        }
      }
    };

    cargarEstado();

    return () => {
      active = false;
    };
  }, [version]);

  return { ...estado, actualizar };
}