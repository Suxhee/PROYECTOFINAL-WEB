import { useEffect, useMemo, useState } from "react";

import {
    Alert,
    Badge,
    Button,
    Card,
    CardBody,
    FormGroup,
    Input,
    Label,
    Spinner,
    Table,
} from 'reactstrap';

//Importa el formulario de registro y ediccion.
import ProductoForm from "./ProductoForm";

// Servicios para administrar productos desde la API del módulo.
import {
    listarProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    modoInventarioMock,
} from '../../api/inventario.js';

// Componente principal de administración de productos.
export default function Productos() {
  // Almacena la lista de productos.
  const [data, setData] = useState([]);

  // Controla la carga inicial de los datos.
  const [loading, setLoading] = useState(true);

  // Controla el estado de guardado.
  const [guardando, setGuardando] = useState(false);

  // Controla la búsqueda y el formulario.
  const [busqueda, setBusqueda] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Almacena mensajes de confirmación y errores.
  const [mensaje, setMensaje] = useState('');

  // Consulta los productos mediante la API del módulo.
useEffect(() => {
    async function cargarProductos() {
        setLoading(true);

        try {
            const resultado = await listarProductos();

            if (!Array.isArray(resultado)) {
                throw new Error(
                    'La respuesta de productos no tiene un formato válido.'
                );
            }

            setData(resultado);
        } catch (error) {
            setMensaje(
                `No se pudieron cargar los productos: ${error.message}`
            );
        } finally {
            setLoading(false);
        }
    }

    cargarProductos();
}, []);

  // Filtra los productos por su nombre.
  const productosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return data.filter((producto) =>
      producto.nombre?.toLowerCase().includes(texto)
    );
  }, [data, busqueda]);

  // Abre el formulario para registrar un producto.
  const abrirNuevo = () => {
    setProductoSeleccionado(null);
    setMostrarFormulario(true);
    setMensaje('');
  };

  // Abre el formulario con los datos del producto seleccionado.
  const abrirEdicion = (producto) => {
    setProductoSeleccionado(producto);
    setMostrarFormulario(true);
    setMensaje('');
  };

  // Cierra el formulario y limpia la selección.
  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setProductoSeleccionado(null);
  };

  // Registra o actualiza un producto mediante la API del módulo.
  const guardar = async (datos) => {
    setGuardando(true);
    setMensaje('');

    try {
        if (productoSeleccionado) {
            await actualizarProducto(
                productoSeleccionado.id,
                datos
            );
        } else {
            await crearProducto(datos);
        }

        // Consulta nuevamente el catálogo actualizado.
        const productosActualizados = await listarProductos();

        setData(productosActualizados);

        setMensaje(
            productoSeleccionado
                ? 'El producto se actualizó correctamente.'
                : 'El producto se registró correctamente.'
        );

        cerrarFormulario();
    } catch (error) {
        setMensaje(
            `No se pudo guardar el producto: ${error.message}`
        );

        throw error;
    } finally {
        setGuardando(false);
    }
  };

  // Solicita confirmación antes de eliminar un producto.
const manejarEliminarProducto = async (producto) => {
    const confirmar = window.confirm(
        `¿Deseas eliminar el producto "${producto.nombre}"?`
    );

    if (!confirmar) return;

    setGuardando(true);
    setMensaje('');

    try {
        // Solicita la eliminación mediante la API del módulo.
        await eliminarProducto(producto.id);

        // Recupera el catálogo actualizado.
        const productosActualizados = await listarProductos();

        setData(productosActualizados);
        setMensaje('El producto se eliminó correctamente.');
    } catch (error) {
        setMensaje(
            `No se pudo eliminar el producto: ${error.message}`
        );
    } finally {
        setGuardando(false);
    }
};

  // Muestra un indicador mientras se cargan los datos.
  if (loading) {
    return (
      <div className="text-center my-4">
        <Spinner color="primary" />
        <p className="text-secondary mt-2">Cargando productos...</p>
      </div>
    );
  }

  return (
    <section>
      {/* Encabezado de la gestión de productos. */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h2 className="h5 mb-1">Gestión de productos</h2>
          <p className="text-secondary mb-0">
            Administra los productos preparados y de reventa.
          </p>
        </div>

        {/* Identifica el origen de los datos utilizados. */}
        <Badge color={modoInventarioMock ? 'info' : 'primary'}>
          {modoInventarioMock
          ? 'Modo demostración'
          : 'Modo API real'}
        </Badge>
      </div>

      {/* Muestra los mensajes de las operaciones. */}
      {mensaje && (
        <Alert
          color={mensaje.startsWith('No se pudo') ? 'danger' : 'success'}
          toggle={() => setMensaje('')}
        >
          {mensaje}
        </Alert>
      )}

      {/* Buscador y botón de registro. */}
      <Card className="mb-3">
        <CardBody>
          <div className="d-flex flex-wrap justify-content-between align-items-end gap-3">
            <FormGroup className="mb-0 flex-grow-1">
              <Label for="buscar-producto">Buscar producto</Label>
              <Input
                id="buscar-producto"
                type="search"
                placeholder="Escribe el nombre del producto..."
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
              />
            </FormGroup>

            <Button color="primary" onClick={abrirNuevo}>
              Registrar producto
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Formulario para registrar o editar productos. */}
      {mostrarFormulario && (
        <Card className="mb-3">
          <CardBody>
            <h3 className="h5 mb-3">
              {productoSeleccionado ? 'Editar producto' : 'Nuevo producto'}
            </h3>

            <ProductoForm
              producto={productoSeleccionado}
              onSubmit={guardar}
              onCancel={cerrarFormulario}
              loading={guardando}
            />
          </CardBody>
        </Card>
      )}

      {/* Tabla de productos registrados. */}
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="h5 mb-0">Productos registrados</h3>

            <span className="text-secondary small">
              {productosFiltrados.length} registro(s)
            </span>
          </div>

          {productosFiltrados.length === 0 ? (
            <Alert color="info" className="mb-0">
              {busqueda
                ? 'No se encontraron productos con ese nombre.'
                : 'Todavía no hay productos registrados.'}
            </Alert>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio de venta</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {productosFiltrados.map((producto) => (
                  <tr key={producto.id}>
                    <td>{producto.nombre}</td>

                    <td>
                      ${Number(producto.precio).toFixed(2)}
                    </td>

                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          color="warning"
                          size="sm"
                          onClick={() => abrirEdicion(producto)}
                        >
                          Editar
                        </Button>

                        <Button
                          color="danger"
                          size="sm"
                          outline
                          onClick={() => manejarEliminarProducto(producto)}
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
          )}
        </CardBody>
      </Card>
    </section>
  );
}