
import { useCallback, useEffect, useState } from 'react';

// Funciones para comunicarse con el backend.
import {
  listarInsumos,
  crearInsumo,
  actualizarInsumo,
  eliminarInsumo,
} from '../api/inventario.js';

// Datos iniciales para el modo de demostración.
import { insumos as datosIniciales } from '../mocks/insumos.js';

// Clave utilizada para guardar los insumos en el navegador.
const MOCK_KEY = 'origenes_inventario_insumos';

// Determina si se utilizarán datos locales o el backend.
const usarMock = import.meta.env.VITE_USE_MOCK === 'true';

// Recupera los insumos guardados anteriormente en el navegador.
function obtenerMocks() {
  try {
    const guardados = localStorage.getItem(MOCK_KEY);

    // Comprueba que existan datos y que tengan formato de arreglo.
    if (guardados !== null) {
      const datos = JSON.parse(guardados);

      if (Array.isArray(datos)) {
        return datos;
      }
    }
  } catch {
    // Informa si los datos almacenados no se pueden recuperar.
    console.error('No se pudieron recuperar los insumos guardados.');
  }

  // Si no existen datos guardados, utiliza los datos iniciales.
  return datosIniciales;
}

// Guarda la lista actualizada de insumos en el navegador.
function guardarMocks(datos) {
  localStorage.setItem(MOCK_KEY, JSON.stringify(datos));
}

// Hook que administra todas las operaciones de los insumos.
export default function useInsumos() {
  // Estado general de la consulta de insumos.
  const [estado, setEstado] = useState({
    loading: true,
    data: [],
    error: null,
  });

  // Indica si se está realizando una operación de escritura.
  const [guardando, setGuardando] = useState(false);

  // Consulta los insumos desde el mock o desde el backend.
  const cargarInsumos = useCallback(async () => {
    setEstado((actual) => ({
      ...actual,
      loading: true,
      error: null,
    }));

    try {
      // Selecciona el origen de datos según la configuración.
      const resultado = usarMock
        ? obtenerMocks()
        : await listarInsumos();

      // Comprueba que la respuesta sea una lista válida.
      if (!Array.isArray(resultado)) {
        throw new Error(
          'La respuesta de inventario no tiene un formato válido.'
        );
      }

      // Actualiza la información cuando la consulta termina correctamente.
      setEstado({
        loading: false,
        data: resultado,
        error: null,
      });
    } catch (error) {
      // Conserva el mensaje de error para mostrarlo en la interfaz.
      setEstado({
        loading: false,
        data: [],
        error: error.message || 'No se pudieron cargar los insumos.',
      });
    }
  }, []);

  // Carga los insumos automáticamente al utilizar el hook.
  useEffect(() => {
    cargarInsumos();
  }, [cargarInsumos]);

  // Registra un insumo nuevo.
  const agregar = async (insumo) => {
    setGuardando(true);

    try {
      if (usarMock) {
        // Genera un identificador para el nuevo registro.
        const nuevos = [
          ...estado.data,
          { ...insumo, id: Date.now() },
        ];

        // Guarda los datos y actualiza la interfaz.
        guardarMocks(nuevos);
        setEstado((actual) => ({
          ...actual,
          data: nuevos,
        }));
      } else {
        // Envía el nuevo insumo al backend.
        await crearInsumo(insumo);

        // Vuelve a consultar los datos para mostrar el resultado real.
        await cargarInsumos();
      }
    } finally {
      // Finaliza el indicador de guardado incluso si ocurre un error.
      setGuardando(false);
    }
  };

  // Actualiza un insumo existente.
  const actualizar = async (id, insumo) => {
    setGuardando(true);

    try {
      if (usarMock) {
        // Reemplaza únicamente el insumo que coincide con el identificador.
        const nuevos = estado.data.map((item) =>
          item.id === id
            ? { ...insumo, id }
            : item
        );

        // Guarda y actualiza la lista.
        guardarMocks(nuevos);
        setEstado((actual) => ({
          ...actual,
          data: nuevos,
        }));
      } else {
        // Envía los cambios al backend.
        await actualizarInsumo(id, insumo);

        // Consulta nuevamente la información actualizada.
        await cargarInsumos();
      }
    } finally {
      setGuardando(false);
    }
  };

  // Elimina un insumo existente.
  const eliminar = async (id) => {
    setGuardando(true);

    try {
      if (usarMock) {
        // Crea una lista sin el insumo seleccionado.
        const nuevos = estado.data.filter(
          (item) => item.id !== id
        );

        // Guarda y actualiza los datos.
        guardarMocks(nuevos);
        setEstado((actual) => ({
          ...actual,
          data: nuevos,
        }));
      } else {
        // Solicita al backend que elimine el registro.
        await eliminarInsumo(id);

        // Actualiza la lista consultando nuevamente el backend.
        await cargarInsumos();
      }
    } finally {
      setGuardando(false);
    }
  };

  // Expone los datos y las operaciones que necesita la interfaz.
  return {
    ...estado,
    guardando,
    agregar,
    actualizar,
    eliminar,
    recargar: cargarInsumos,
    usarMock,
  };
}
