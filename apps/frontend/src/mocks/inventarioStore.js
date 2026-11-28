
import { insumos } from './insumos.js';
import { productos } from './productos.js';
import { recetas } from './recetas.js';

// Define las colecciones utilizadas por el módulo de inventario.
// Conserva las claves anteriores para mantener los datos registrados.
const COLECCIONES = {
    insumos: {
        clave: 'origenes_inventario_insumos',
        iniciales: insumos,
    },
    productos: {
        clave: 'origenes_inventario_productos',
        iniciales: productos,
    },
    recetas: {
        clave: 'origenes_inventario_recetas',
        iniciales: recetas,
    },
};

// Recupera los registros guardados en el navegador.
export function obtenerColeccion(nombre) {
    const coleccion = COLECCIONES[nombre];

    if (!coleccion) {
        throw new Error('La colección solicitada no existe.');
    }

    const guardados = localStorage.getItem(coleccion.clave);

    // Utiliza los datos iniciales si todavía no existen registros guardados.
    if (guardados === null) {
        return structuredClone(coleccion.iniciales);
    }

    const datos = JSON.parse(guardados);

    if (!Array.isArray(datos)) {
        throw new Error(
            `Los datos almacenados de ${nombre} no son válidos.`
        );
    }

    return datos;
}

// Guarda los registros actualizados de una colección.
export function guardarColeccion(nombre, datos) {
    const coleccion = COLECCIONES[nombre];

    if (!coleccion || !Array.isArray(datos)) {
        throw new Error('No se puede guardar la colección.');
    }

    localStorage.setItem(
        coleccion.clave,
        JSON.stringify(datos)
    );
}

// Registra un elemento nuevo con un identificador único.
export function crearRegistro(nombre, datos) {
    const registros = obtenerColeccion(nombre);

    let id = Date.now();

    while (registros.some((item) => Number(item.id) === id)) {
        id++;
    }

    const nuevo = {
        ...datos,
        id,
    };

    guardarColeccion(nombre, [...registros, nuevo]);

    return nuevo;
}

// Actualiza un registro conservando sus propiedades existentes.
export function actualizarRegistro(nombre, id, datos) {
    const registros = obtenerColeccion(nombre);

    const existente = registros.find(
        (item) => Number(item.id) === Number(id)
    );

    if (!existente) {
        throw new Error('El registro que deseas actualizar no existe.');
    }

    const actualizado = {
        ...existente,
        ...datos,
        id: existente.id,
    };

    const nuevos = registros.map((item) =>
        Number(item.id) === Number(id)
            ? actualizado
            : item
    );

    guardarColeccion(nombre, nuevos);

    return actualizado;
}


// Elimina un registro sin dejar referencias inválidas en las recetas.
export function eliminarRegistro(nombre, id) {
    const registros = obtenerColeccion(nombre);

    // Comprueba que el registro exista antes de eliminarlo.
    const existe = registros.some(
        (item) => Number(item.id) === Number(id)
    );

    if (!existe) {
        throw new Error(
            'El registro que deseas eliminar no existe.'
        );
    }

    // Protege los insumos utilizados en alguna receta.
    if (nombre === 'insumos') {
        const recetas = obtenerColeccion('recetas');

        const tieneRecetas = recetas.some(
            (receta) =>
                Number(receta.insumoId) === Number(id)
        );

        if (tieneRecetas) {
            throw new Error(
                'No puedes eliminar este insumo porque está asociado a una receta.'
            );
        }
    }

    // Protege los productos que tienen ingredientes registrados.
    if (nombre === 'productos') {
        const recetas = obtenerColeccion('recetas');

        const tieneRecetas = recetas.some(
            (receta) =>
                Number(receta.productoId) === Number(id)
        );

        if (tieneRecetas) {
            throw new Error(
                'No puedes eliminar este producto porque tiene una receta asociada.'
            );
        }
    }

    // Elimina el registro únicamente si no existen dependencias.
    const nuevos = registros.filter(
        (item) => Number(item.id) !== Number(id)
    );

    guardarColeccion(nombre, nuevos);
}

