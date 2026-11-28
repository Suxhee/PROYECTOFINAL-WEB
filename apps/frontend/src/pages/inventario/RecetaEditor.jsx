import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Button,
    Form,
    FormGroup,
    Input,
    Label,
    Spinner,
    Table,
} from 'reactstrap';

import { insumos } from '../../mocks/insumos.js';
import { productos } from '../../mocks/productos.js';
import { recetas as recetasIniciales } from '../../mocks/recetas.js';

//Clave utilizada para conservar las recetas en el navegador
const MOCK_KEY = 'origenes_inventario_recetas';

//Comprueba si el proyecto esta trabajando con datos de demostracion
const usarMock = import.meta.env.VITE_USE_MOCK === 'true';

//Valores iniciales del formulario.
const FORMULARIO_INICIAL = {
    productoId: '',
    insumoId: '',
    cantidad: '',
};

// Recupera las recetas guardadas o utiliza los datos iniciales
function obtenerRecetas() {
    try {
        const guardadas = localStorage.getItem(MOCK_KEY);

        if (guardadas !== null) {
            const datos = JSON.parse(guardadas);

            if (Array.isArray(datos)) {
                return datos;
            }
        }
    } catch {
        console.error('No se pudo recuperar las recetas guardadas.');
    }

    return recetasIniciales;
}

//Guarda las recetas actualizadas en el almacenamiento local.
function guardarRecetas(datos) {
    localStorage.setItem(MOCK_KEY, JSON.stringify(datos));
}

export default function RecetaEditor() {
    //Estado de las recetas y del formulario.
    const [listaRecetas, setListaRecetas] = useState([]);
    const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
    const [recetaEditando, setRecetaEditando] = useState(null);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [guardando, setGuardando] = useState(false);

    // Carga las ecetas cuando se abre el editor.
    useEffect(() => {
        if (usarMock) {
            setListaRecetas(obtenerRecetas());
        }
    }, []);

    // Busca el producto correspondiente a cada ingrediente.
    const recetasConDatos = useMemo(() => {
        return listaRecetas.map((receta) => {
            const producto = productos.find(
                (item) => Number(item.id) === Number(receta.productoId)
            );

            const insumo = insumos.find(
                (item) => Number(item.id) === Number(receta.insumoId)
            );

            return {
                ...receta,
                nombreProducto: producto?.nombre || 'Producto no encontrado',
                nombreInsumo: insumo?.name || 'Insumo no encontrado',
                unidad: insumo?.unit || receta.unidad || '',
            };
        });
    }, [listaRecetas]);

    // Actualiza los campos del formulario.
    function manejarCambio(evento) {
        const { name, value } = evento.target;

        setFormulario((actual) => ({
            ...actual,
            [name]: value,
        }));

        setError('');
        setMensaje('');
    }

    // Guarda una nueva relación entre producto e insumo.
    function manejarSubmit(evento) {
        evento.preventDefault();

        setError('');
        setMensaje('');

        // El editor requiere el modo de demostración hasta que exista
        // un endpoint de creación y actualización de recetas.
        if (!usarMock) {
            setError('El backend todavía no tiene implementada la gestión de recetas.');
            return;
        }

        const productoId = Number(formulario.productoId);
        const insumoId = Number(formulario.insumoId);
        const cantidad = Number(formulario.cantidad);

        // Validaciones para evitar relaciones o cantidades incorrectas.
        if (!productoId || !insumoId) {
            setError('Selecciona un producto y un insumo.');
            return;
        }

        if (!Number.isFinite(cantidad) || cantidad <= 0) {
            setError('La cantidad debe ser un número mayor que cero.');
            return;
        }

        const insumoSeleccionado = insumos.find(
            (item) => Number(item.id) === insumoId
        );

        if (!insumoSeleccionado) {
            setError('El insumo seleccionado no existe.');
            return;
        }

        setGuardando(true);

        try {
            const nuevaReceta = {
                id: recetaEditando ?? Date.now(),
                productoId,
                insumoId,
                cantidad,
                unidad: insumoSeleccionado.unit,
            };

            // Si estamos editando, reemplazamos el ingrediente seleccionado.
            // Si es nuevo, lo agregamos a la lista.
            const nuevasRecetas = recetaEditando !== null
                ? listaRecetas.map((receta) =>
                    receta.id === recetaEditando ? nuevaReceta : receta
                )
                : [...listaRecetas, nuevaReceta];

            guardarRecetas(nuevasRecetas);
            setListaRecetas(nuevasRecetas);
            setFormulario(FORMULARIO_INICIAL);
            setRecetaEditando(null);
            setMensaje('El ingrediente de la receta se guardó correctamente.');
        } catch {
            setError('No se pudo guardar la receta en el navegador.');
        } finally {
            setGuardando(false);
        }
    }

    // Carga un ingrediente existente para modificarlo.
    function editarReceta(receta) {
        setFormulario({
            productoId: String(receta.productoId),
            insumoId: String(receta.insumoId),
            cantidad: String(receta.cantidad),
        });

        setRecetaEditando(receta.id);
        setError('');
        setMensaje('');
    }

    // Elimina un ingrediente de una receta.
    function eliminarReceta(id) {
        const confirmar = window.confirm(
            '¿Deseas eliminar este ingrediente de la receta?'
        );

        if (!confirmar) return;

        try {
            const nuevasRecetas = listaRecetas.filter(
                (receta) => receta.id !== id
            );

            guardarRecetas(nuevasRecetas);
            setListaRecetas(nuevasRecetas);

            if (recetaEditando === id) {
                cancelarEdicion();
            }

            setMensaje('El ingrediente se eliminó correctamente.');
            setError('');
        } catch {
            setError('No se pudo eliminar el ingrediente.');
        }
    }

    // Limpia el formulario y cancela una edición.
    function cancelarEdicion() {
        setFormulario(FORMULARIO_INICIAL);
        setRecetaEditando(null);
        setError('');
        setMensaje('');
    }

    // Si el modo mock está desactivado, mostramos el estado real
    // de integración pendiente, sin simular una conexión al backend.
    if (!usarMock) {
        return (
            <Alert color="warning">
                La gestión de recetas está disponible en modo de demostración.
                El backend todavía no cuenta con las operaciones necesarias
                para crear, editar y eliminar recetas.
            </Alert>
        );
    }

    return (
        <div>
            {/* Encabezado de la sección. */}
            <div className="mb-4">
                <h4>Editor de recetas</h4>
                <p className="text-muted">
                    Asocia los insumos necesarios para preparar cada producto.
                </p>
            </div>

            {/* Formulario para registrar o editar ingredientes. */}
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">
                        {recetaEditando !== null
                            ? 'Editar ingrediente'
                            : 'Agregar ingrediente a una receta'}
                    </h5>

                    <Form onSubmit={manejarSubmit}>
                        <FormGroup>
                            <Label for="productoId">Producto</Label>
                            <Input
                                id="productoId"
                                name="productoId"
                                type="select"
                                value={formulario.productoId}
                                onChange={manejarCambio}
                                required
                            >
                                <option value="">Selecciona un producto</option>

                                {productos.map((producto) => (
                                    <option key={producto.id} value={producto.id}>
                                        {producto.nombre}
                                    </option>
                                ))}
                            </Input>
                        </FormGroup>

                        <FormGroup>
                            <Label for="insumoId">Insumo</Label>
                            <Input
                                id="insumoId"
                                name="insumoId"
                                type="select"
                                value={formulario.insumoId}
                                onChange={manejarCambio}
                                required
                            >
                                <option value="">Selecciona un insumo</option>

                                {insumos.map((insumo) => (
                                    <option key={insumo.id} value={insumo.id}>
                                        {insumo.name} ({insumo.unit})
                                    </option>
                                ))}
                            </Input>
                        </FormGroup>

                        <FormGroup>
                            <Label for="cantidad">Cantidad necesaria</Label>
                            <Input
                                id="cantidad"
                                name="cantidad"
                                type="number"
                                min="0.001"
                                step="0.001"
                                placeholder="Ej. 0.250"
                                value={formulario.cantidad}
                                onChange={manejarCambio}
                                required
                            />
                            <small className="text-muted">
                                La unidad se obtiene automáticamente del insumo seleccionado.
                            </small>
                        </FormGroup>

                        {error && <Alert color="danger">{error}</Alert>}
                        {mensaje && <Alert color="success">{mensaje}</Alert>}

                        <div className="d-flex gap-2 flex-wrap">
                            <Button
                                color="primary"
                                type="submit"
                                disabled={guardando}
                            >
                                {guardando ? (
                                    <Spinner size="sm" />
                                ) : (
                                    recetaEditando !== null
                                        ? 'Guardar cambios'
                                        : 'Agregar ingrediente'
                                )}
                            </Button>

                            {recetaEditando !== null && (
                                <Button
                                    color="secondary"
                                    type="button"
                                    onClick={cancelarEdicion}
                                >
                                    Cancelar
                                </Button>
                            )}
                        </div>
                    </Form>
                </div>
            </div>

            {/* Tabla que muestra todos los ingredientes registrados. */}
            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">Ingredientes registrados</h5>

                    {recetasConDatos.length === 0 ? (
                        <Alert color="info">
                            Todavía no hay ingredientes registrados en las recetas.
                        </Alert>
                    ) : (
                        <div className="table-responsive">
                            <Table striped hover responsive>
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Insumo</th>
                                        <th>Cantidad</th>
                                        <th>Unidad</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {recetasConDatos.map((receta) => (
                                        <tr key={receta.id}>
                                            <td>{receta.nombreProducto}</td>
                                            <td>{receta.nombreInsumo}</td>
                                            <td>{receta.cantidad}</td>
                                            <td>{receta.unidad}</td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <Button
                                                        color="warning"
                                                        size="sm"
                                                        onClick={() => editarReceta(receta)}
                                                    >
                                                        Editar
                                                    </Button>

                                                    <Button
                                                        color="danger"
                                                        size="sm"
                                                        onClick={() => eliminarReceta(receta.id)}
                                                    >
                                                        Eliminar
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

