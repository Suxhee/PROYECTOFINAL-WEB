
import { get, post, put, del } from './client.js';

// Utiliza el mecanismo común de selección del proyecto.
import {
    seleccionarApi,
    modoDemostracion,
} from './mode.js';

// Operaciones de almacenamiento para el modo de demostración.
import {
    obtenerColeccion,
    crearRegistro,
    actualizarRegistro,
    eliminarRegistro,
} from '../mocks/inventarioStore.js';

// Expone el modo actual sin consultar las variables de entorno
// directamente desde los componentes o hooks.
export const modoInventarioMock = modoDemostracion;

// Evento utilizado para notificar cambios en las existencias.
export const EVENTO_INVENTARIO = 'origenes:insumos-actualizados';

// Notifica que los datos de inventario deben consultarse nuevamente.
export function notificarCambioInventario() {
    window.dispatchEvent(new Event(EVENTO_INVENTARIO));
}

// ========================================
// SERVICIOS DE INSUMOS
// ========================================

// Consulta los insumos desde el backend o los datos simulados.
export const listarInsumos = seleccionarApi(
    () => get('/inventory'),
    () => obtenerColeccion('insumos')
);

// Selecciona el servicio encargado de registrar insumos.
const registrarInsumo = seleccionarApi(
    (insumo) => post('/inventory', insumo),
    (insumo) => crearRegistro('insumos', insumo)
);

// Registra un insumo y notifica el cambio de inventario.
export async function crearInsumo(insumo) {
    const resultado = await registrarInsumo(insumo);

    notificarCambioInventario();

    return resultado;
}

// Selecciona el servicio encargado de actualizar insumos.
const modificarInsumo = seleccionarApi(
    (id, insumo) => put(`/inventory/${id}`, insumo),
    (id, insumo) => actualizarRegistro('insumos', id, insumo)
);

// Actualiza un insumo y notifica el cambio.
export async function actualizarInsumo(id, insumo) {
    const resultado = await modificarInsumo(id, insumo);

    notificarCambioInventario();

    return resultado;
}

// Selecciona el servicio encargado de eliminar insumos.
const borrarInsumo = seleccionarApi(
    (id) => del(`/inventory/${id}`),
    (id) => eliminarRegistro('insumos', id)
);

// Elimina un insumo y notifica el cambio.
export async function eliminarInsumo(id) {
    const resultado = await borrarInsumo(id);

    notificarCambioInventario();

    return resultado;
}

// ========================================
// SERVICIOS DE PRODUCTOS Y RECETAS
// ========================================

// Informa que una operación todavía no tiene un contrato HTTP confirmado.
// Evita utilizar datos simulados cuando el modo real está activado.
function operacionPendiente(operacion) {
    return async () => {
        throw new Error(
            `La operación "${operacion}" todavía no está disponible en la API real.`
        );
    };
}

// Consulta los productos disponibles.
export const listarProductos = seleccionarApi(
    operacionPendiente('Consultar productos'),
    () => obtenerColeccion('productos')
);

// Registra un producto.
export const crearProducto = seleccionarApi(
    operacionPendiente('Registrar producto'),
    (producto) => crearRegistro('productos', producto)
);

// Actualiza un producto existente.
export const actualizarProducto = seleccionarApi(
    operacionPendiente('Actualizar producto'),
    (id, producto) => actualizarRegistro('productos', id, producto)
);

// Elimina un producto.
export const eliminarProducto = seleccionarApi(
    operacionPendiente('Eliminar producto'),
    (id) => eliminarRegistro('productos', id)
);

// Consulta las recetas registradas.
export const listarRecetas = seleccionarApi(
    () => get('/recipes'),
    () => obtenerColeccion('recetas')
);

// Registra un ingrediente de una receta.
export const crearReceta = seleccionarApi(
    operacionPendiente('Registrar receta'),
    (receta) => crearRegistro('recetas', receta)
);

// Actualiza un ingrediente de una receta.
export const actualizarReceta = seleccionarApi(
    operacionPendiente('Actualizar receta'),
    (id, receta) => actualizarRegistro('recetas', id, receta)
);

// Elimina un ingrediente de una receta.
export const eliminarReceta = seleccionarApi(
    operacionPendiente('Eliminar receta'),
    (id) => eliminarRegistro('recetas', id)
);
