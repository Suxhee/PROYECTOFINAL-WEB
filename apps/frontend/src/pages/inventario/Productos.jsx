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

//Importa los datos iniciales
import { productos as productosIniciales } from '../../mocks/productos.js';

//Clave independiente para guardar los productos de demostracion.
const MOCK_KEY = 'origenes_inventario_productos';

//Recupera los productos guardados en el navegador
function obtenerProductos() {
  try {
    const guardados = localStorage.getItem(MOCK_KEY);

    if (guardados !== null) {
      const datos = JSON.parse(guardados);

      if (Array.isArray(datos)) {
        return datos;
      }
    }
  } catch {
    console.error('No se pudieron recuperar los productos guardados.');
  }

  // Utiliza los datos iniciales cuando no existen los datos guardados
   return productosIniciales;
}

// Guarda los productos actualizados en el navegador
function guardarProductos(datos) {
  localStorage.setItem(MOCK_KEY, JSON.stringify(datos));
}

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

  // Carga los productos al entrar en la pantalla.
  useEffect(() => {
    try {
      setData(obtenerProductos());
    } catch {
      setMensaje('No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
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

  // Registra un producto nuevo o actualiza uno existente.
  const guardar = async (datos) => {
    setGuardando(true);

    try {
      let nuevos;

      if (productoSeleccionado) {
        // Reemplaza los datos del producto seleccionado.
        nuevos = data.map((producto) =>
          producto.id === productoSeleccionado.id
            ? { ...datos, id: producto.id }
            : producto
        );

        setMensaje('El producto se actualizó correctamente.');
      } else {
        // Genera un identificador para el producto nuevo.
        const nuevoProducto = {
          ...datos,
          id: Date.now(),
        };

        nuevos = [...data, nuevoProducto];

        setMensaje('El producto se registró correctamente.');
      }

      // Persiste los cambios y actualiza la pantalla.
      guardarProductos(nuevos);
      setData(nuevos);

      // Cierra el formulario después de guardar.
      cerrarFormulario();
    } catch (err) {
      setMensaje(`No se pudo guardar el producto: ${err.message}`);
      throw err;
    } finally {
      setGuardando(false);
    }
  };

  // Elimina un producto después de solicitar confirmación.
  const eliminarProducto = (producto) => {
    const confirmar = window.confirm(
      `¿Deseas eliminar el producto "${producto.nombre}"?`
    );

    if (!confirmar) return;

    try {
      // Genera una lista sin el producto seleccionado.
      const nuevos = data.filter(
        (item) => item.id !== producto.id
      );

      // Guarda la lista y actualiza la interfaz.
      guardarProductos(nuevos);
      setData(nuevos);

      setMensaje('El producto se eliminó correctamente.');
    } catch (err) {
      setMensaje(`No se pudo eliminar el producto: ${err.message}`);
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

        <Badge color="info">Modo demostración</Badge>
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
                          onClick={() => eliminarProducto(producto)}
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