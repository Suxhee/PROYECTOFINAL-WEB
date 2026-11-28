import { useCallback, useEffect, useState } from 'react';
import { listarInsumos } from '../api/inventario.js';
import { insumos as datosIniciales } from '../mocks/insumos.js';

// Utiliza la misma clave de almacenamiento que el hook de insumos.
const MOCK_KEY = 'origenes_inventario_insumos';

// Identifica si la aplicacion utiliza datos de demostracion.
const usarMock = import.meta.env.VITE_USE_MOCK === 'true';

// Recupera los insumos guardados en el navegador
function obtenerInsumosMock() {
  try {
        const guardados = localStorage.getItem(MOCK_KEY);

        if (guardados !== null) {
            const datos = JSON.parse(guardados);

            if (Array.isArray(datos)) {
                return datos;
            }
        }
    } catch {
        console.error('No se pudieron recuperar los insumos para las alertas.');
    }

    return datosIniciales;
}

// Hook que calcula y mantiene actualizadas las alertas e stock.
export default function useAlertasStock() {
    const [estado, setEstado] = useState({
        loading: true,
        alertas: [],
        totalInsumos: 0,
        error: null,
    });

    // Consulta los insumos y determina cuáles necesitan reposición.
    const cargarAlertas = useCallback(async () => {
        setEstado((actual) => ({
            ...actual,
            loading: true,
            error: null,
        }));

        try {
            const insumosActuales = usarMock
                ? obtenerInsumosMock()
                : await listarInsumos();

            if (!Array.isArray(insumosActuales)) {
                throw new Error('La respuesta de inventario no tiene un formato válido.');
            }

            // Identifica los insumos cuyo stock está en el mínimo o por debajo.
            const alertas = insumosActuales
                .map((item) => {
                    const cantidad = Number(item.quantity);
                    const minimo = Number(item.minimumQuantity);

                    return {
                        ...item,
                        quantity: cantidad,
                        minimumQuantity: minimo,
                        estado: cantidad <= 0 ? 'agotado' : 'bajo',
                    };
                })
                .filter((item) =>
                    Number.isFinite(item.quantity) &&
                    Number.isFinite(item.minimumQuantity) &&
                    item.quantity <= item.minimumQuantity
                );

            setEstado({
                loading: false,
                alertas,
                totalInsumos: insumosActuales.length,
                error: null,
            });
        } catch (error) {
            setEstado({
                loading: false,
                alertas: [],
                totalInsumos: 0,
                error: error.message || 'No se pudieron cargar las alertas de stock.',
            });
        }
    }, []);

    useEffect(() => {
        // Carga las alertas al abrir el módulo.
        cargarAlertas();

        // Escucha cambios de insumos realizados desde otra sección.
        const actualizarAlertas = () => cargarAlertas();

        // Detecta cambios realizados en otras pestañas del navegador.
        window.addEventListener('storage', actualizarAlertas);

        // Detecta cambios realizados en la misma pestaña.
        window.addEventListener('origenes:insumos-actualizados', actualizarAlertas);

        return () => {
            window.removeEventListener('storage', actualizarAlertas);
            window.removeEventListener('origenes:insumos-actualizados', actualizarAlertas);
        };
    }, [cargarAlertas]);

    return {
        ...estado,
        recargar: cargarAlertas,
    };
}
