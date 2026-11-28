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

// Servicios para consultar el catálogo y administrar las recetas.
import {
    listarInsumos,
    listarProductos,
    listarRecetas,
    crearReceta,
    actualizarReceta,
    eliminarReceta,
    EVENTO_INVENTARIO,
} from '../../api/inventario.js';

//Valores iniciales del formulario.
const FORMULARIO_INICIAL = {
    productoId: '',
    insumoId: '',
    cantidad: '',
};

export default function RecetaEditor() {
    //Estado de las recetas y del formulario.
    const [listaRecetas, setListaRecetas] = useState([]);
    const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
    const [recetaEditando, setRecetaEditando] = useState(null);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [guardando, setGuardando] = useState(false);
    // Almacena el catálogo actualizado de productos e insumos.
    const [productos, setProductos] = useState([]);
    const [insumos, setInsumos] = useState([]);
    
    // Controla la consulta inicial de los datos.
    const [loading, setLoading] = useState(true);
    const [errorCarga, setErrorCarga] = useState('');

    // Consulta los productos, insumos y recetas desde la API.
    useEffect(() => {
    let activo = true;

    async function cargarDatos() {
        setLoading(true);
        setErrorCarga('');

        try {
            // Realiza las tres consultas de forma simultánea.
            const [
                productosActuales,
                insumosActuales,
                recetasActuales,
            ] = await Promise.all([
                listarProductos(),
                listarInsumos(),
                listarRecetas(),
            ]);

            // Comprueba el formato de las respuestas.
            if (
                !Array.isArray(productosActuales) ||
                !Array.isArray(insumosActuales) ||
                !Array.isArray(recetasActuales)
            ) {
                throw new Error(
                    'Los datos recibidos no tienen un formato válido.'
                );
            }

            if (activo) {
                setProductos(productosActuales);
                setInsumos(insumosActuales);
                setListaRecetas(recetasActuales);
            }
        } catch (error) {
            if (activo) {
                setErrorCarga(
                    `No se pudieron cargar los datos: ${error.message}`
                );
            }
        } finally {
            if (activo) {
                setLoading(false);
            }
        }
    }

    cargarDatos();

    // Actualiza el catálogo cuando se modifican las existencias.
    window.addEventListener(
        EVENTO_INVENTARIO,
        cargarDatos
    );

    window.addEventListener('storage', cargarDatos);
    window.addEventListener('focus', cargarDatos);

    return () => {
        activo = false;

        window.removeEventListener(
            EVENTO_INVENTARIO,
            cargarDatos
        );

        window.removeEventListener('storage', cargarDatos);
        window.removeEventListener('focus', cargarDatos);
    };
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
   }, [listaRecetas, productos, insumos]);

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

    
// Registra o actualiza un ingrediente de una receta.
async function manejarSubmit(evento) {
    evento.preventDefault();

    setError('');
    setMensaje('');

    const productoId = Number(formulario.productoId);
    const insumoId = Number(formulario.insumoId);
    const cantidad = Number(formulario.cantidad);

    // Comprueba que el producto y el insumo existan.
    const productoSeleccionado = productos.find(
        (item) => Number(item.id) === productoId
    );

    const insumoSeleccionado = insumos.find(
        (item) => Number(item.id) === insumoId
    );

    if (!productoSeleccionado || !insumoSeleccionado) {
        setError('Selecciona un producto y un insumo válidos.');
        return;
    }

    // Valida la cantidad necesaria del ingrediente.
    if (!Number.isFinite(cantidad) || cantidad < 0.001) {
        setError('La cantidad mínima permitida es 0.001.');
        return;
    }

    // Evita registrar dos veces el mismo ingrediente
    // dentro de la receta de un producto.
    const duplicado = listaRecetas.some(
        (receta) =>
            Number(receta.productoId) === productoId &&
            Number(receta.insumoId) === insumoId &&
            Number(receta.id) !== Number(recetaEditando)
    );

    if (duplicado) {
        setError(
            'Este insumo ya está registrado en la receta del producto.'
        );
        return;
    }

    setGuardando(true);

    try {
        const datosReceta = {
            productoId,
            insumoId,
            cantidad,
            unidad: insumoSeleccionado.unit,
        };

        // Selecciona la operación según el estado del formulario.
        if (recetaEditando !== null) {
            await actualizarReceta(
                recetaEditando,
                datosReceta
            );
        } else {
            await crearReceta(datosReceta);
        }

        // Consulta nuevamente las recetas registradas.
        setListaRecetas(await listarRecetas());

        setFormulario(FORMULARIO_INICIAL);
        setRecetaEditando(null);

        setMensaje(
            'El ingrediente de la receta se guardó correctamente.'
        );
    } catch (error) {
        setError(
            `No se pudo guardar la receta: ${error.message}`
        );
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

    
    // Elimina un ingrediente después de solicitar confirmación.
    async function manejarEliminarReceta(id) {
    const confirmar = window.confirm(
        '¿Deseas eliminar este ingrediente de la receta?'
    );

    if (!confirmar) return;

    setGuardando(true);
    setError('');
    setMensaje('');

    try {
        await eliminarReceta(id);

        // Recupera las recetas actualizadas.
        setListaRecetas(await listarRecetas());

        if (recetaEditando === id) {
            cancelarEdicion();
        }

        setMensaje(
            'El ingrediente se eliminó correctamente.'
        );
    } catch (error) {
        setError(
            `No se pudo eliminar el ingrediente: ${error.message}`
        );
    } finally {
        setGuardando(false);
     }
    }


    // Limpia el formulario y cancela una edición.
    function cancelarEdicion() {
        setFormulario(FORMULARIO_INICIAL);
        setRecetaEditando(null);
        setError('');
        setMensaje('');
    }

    // Muestra un indicador mientras se consultan los datos.
    if (loading) {
        return (
        <div className="text-center my-4">
            <Spinner color="primary" />
            <p className="text-secondary mt-2">
                Cargando datos de recetas...
            </p>
        </div>
        );
    }
    
    // Informa los errores de consulta sin recurrir a mocks.
    if (errorCarga) {
        return (
        <Alert color="danger">
            {errorCarga}
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
                                                       onClick={() => manejarEliminarReceta(receta.id)}
                                                       disabled={guardando}
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

