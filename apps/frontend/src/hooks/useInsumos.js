

import { useCallback, useEffect, useState } from 'react';

import {
    listarInsumos,
    crearInsumo,
    actualizarInsumo,
    eliminarInsumo,
    modoInventarioMock,
    EVENTO_INVENTARIO,
} from '../api/inventario.js';

// Hook encargado de administrar el estado de los insumos.
export default function useInsumos() {
    const [estado, setEstado] = useState({
        loading: true,
        data: [],
        error: null,
    });

    // Controla las operaciones de escritura.
    const [guardando, setGuardando] = useState(false);

    // Consulta los datos mediante la API del módulo.
    const cargarInsumos = useCallback(async () => {
        setEstado((actual) => ({
            ...actual,
            loading: true,
            error: null,
        }));

        try {
            const resultado = await listarInsumos();

            if (!Array.isArray(resultado)) {
                throw new Error(
                    'La respuesta de inventario no tiene un formato válido.'
                );
            }

            setEstado({
                loading: false,
                data: resultado,
                error: null,
            });
        } catch (error) {
            setEstado((actual) => ({
                ...actual,
                loading: false,
                error:
                    error.message ||
                    'No se pudieron cargar los insumos.',
            }));
        }
    }, []);

    useEffect(() => {
        // Consulta los datos al montar el componente.
        cargarInsumos();

        // Permite actualizar los datos cuando cambia el inventario.
        const actualizarDatos = () => cargarInsumos();

        window.addEventListener(
            EVENTO_INVENTARIO,
            actualizarDatos
        );

        window.addEventListener(
            'storage',
            actualizarDatos
        );

        // Vuelve a consultar al regresar a la ventana de la aplicación.
        window.addEventListener(
            'focus',
            actualizarDatos
        );

        // Elimina los eventos cuando el componente se desmonta.
        return () => {
            window.removeEventListener(
                EVENTO_INVENTARIO,
                actualizarDatos
            );

            window.removeEventListener(
                'storage',
                actualizarDatos
            );

            window.removeEventListener(
                'focus',
                actualizarDatos
            );
        };
    }, [cargarInsumos]);

    // Registra un insumo mediante la API del módulo.
    const agregar = async (insumo) => {
        setGuardando(true);

        try {
            await crearInsumo(insumo);
        } finally {
            setGuardando(false);
        }
    };

    // Actualiza un insumo existente.
    const actualizar = async (id, insumo) => {
        setGuardando(true);

        try {
            await actualizarInsumo(id, insumo);
        } finally {
            setGuardando(false);
        }
    };

    // Elimina un insumo existente.
    const eliminar = async (id) => {
        setGuardando(true);

        try {
            await eliminarInsumo(id);
        } finally {
            setGuardando(false);
        }
    };

    // Conserva las propiedades utilizadas por la interfaz existente.
    return {
        ...estado,
        guardando,
        agregar,
        actualizar,
        eliminar,
        recargar: cargarInsumos,
        usarMock: modoInventarioMock,
    };
}

