
import { useCallback, useEffect, useState } from 'react';

import {
    listarInsumos,
    EVENTO_INVENTARIO,
} from '../api/inventario.js';

// Hook encargado de calcular y mantener actualizadas las alertas.
export default function useAlertasStock() {
    const [estado, setEstado] = useState({
        loading: true,
        alertas: [],
        totalInsumos: 0,
        error: null,
    });

    // Consulta las existencias y determina cuáles requieren reposición.
    const cargarAlertas = useCallback(async () => {
        setEstado((actual) => ({
            ...actual,
            loading: true,
            error: null,
        }));

        try {
            const insumos = await listarInsumos();

            if (!Array.isArray(insumos)) {
                throw new Error(
                    'La respuesta de inventario no tiene un formato válido.'
                );
            }

            // Identifica los insumos agotados o con stock bajo.
            const alertas = insumos
                .map((item) => {
                    const cantidad = Number(item.quantity);
                    const minimo = Number(item.minimumQuantity);

                    return {
                        ...item,
                        quantity: cantidad,
                        minimumQuantity: minimo,
                        estado: cantidad <= 0
                            ? 'agotado'
                            : 'bajo',
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
                totalInsumos: insumos.length,
                error: null,
            });
        } catch (error) {
            setEstado({
                loading: false,
                alertas: [],
                totalInsumos: 0,
                error:
                    error.message ||
                    'No se pudieron cargar las alertas de stock.',
            });
        }
    }, []);

    useEffect(() => {
        // Consulta las alertas al montar el componente.
        cargarAlertas();

        const actualizarAlertas = () => cargarAlertas();

        // Escucha las notificaciones de cambios en inventario.
        window.addEventListener(
            EVENTO_INVENTARIO,
            actualizarAlertas
        );

        // Detecta cambios realizados desde otras pestañas.
        window.addEventListener(
            'storage',
            actualizarAlertas
        );

        // Actualiza las alertas al regresar a la aplicación.
        window.addEventListener(
            'focus',
            actualizarAlertas
        );

        // Elimina los eventos al desmontar el componente.
        return () => {
            window.removeEventListener(
                EVENTO_INVENTARIO,
                actualizarAlertas
            );

            window.removeEventListener(
                'storage',
                actualizarAlertas
            );

            window.removeEventListener(
                'focus',
                actualizarAlertas
            );
        };
    }, [cargarAlertas]);

    // Conserva la interfaz pública del hook compartido.
    return {
        ...estado,
        recargar: cargarAlertas,
    };
}
