
import { useMemo, useState } from 'react';

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

// Importa el formulario utilizado para registrar y editar insumos.
import InsumoForm from './InsumoForm.jsx';

// Importa el hook que administra los datos y operaciones del inventario.
import useInsumos from '../../hooks/useInsumos.js';

// Componente principal para la gestión de insumos.
export default function Insumos() {
  // Obtiene los datos y las funciones del hook.
  const {
    loading,
    data,
    error,
    guardando,
    agregar,
    actualizar,
    eliminar,
    recargar,
    usarMock,
  } = useInsumos();

  // Estado de búsqueda y visibilidad del formulario.
  const [busqueda, setBusqueda] = useState('');
  const [insumoSeleccionado, setInsumoSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Guarda los mensajes de confirmación o error.
  const [mensaje, setMensaje] = useState('');

  // Filtra los insumos según el nombre escrito en el buscador.
  const insumosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return data.filter((item) =>
      item.name?.toLowerCase().includes(texto)
    );
  }, [data, busqueda]);

  // Prepara el formulario para registrar un insumo nuevo.
  const abrirNuevo = () => {
    setInsumoSeleccionado(null);
    setMostrarFormulario(true);
    setMensaje('');
  };

  // Prepara el formulario con los datos del insumo seleccionado.
  const abrirEdicion = (insumo) => {
    setInsumoSeleccionado(insumo);
    setMostrarFormulario(true);
    setMensaje('');
  };

  // Cierra el formulario y limpia la selección actual.
  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setInsumoSeleccionado(null);
  };

  // Decide si debe registrar o actualizar un insumo.
  const guardar = async (datos) => {
    if (insumoSeleccionado) {
      await actualizar(insumoSeleccionado.id, datos);
      setMensaje('El insumo se actualizó correctamente.');
    } else {
      await agregar(datos);
      setMensaje('El insumo se registró correctamente.');
    }

    // Cierra el formulario después de guardar.
    cerrarFormulario();
  };

  // Solicita confirmación antes de eliminar un insumo.
  const eliminarRegistro = async (insumo) => {
    const confirmar = window.confirm(
      `¿Deseas eliminar el insumo "${insumo.name}"?`
    );

    if (!confirmar) return;

    setMensaje('');

    try {
      // Ejecuta la eliminación mediante el hook.
      await eliminar(insumo.id);
      setMensaje('El insumo se eliminó correctamente.');
    } catch (err) {
      // Muestra el error si no se pudo eliminar.
      setMensaje(`No se pudo eliminar el insumo: ${err.message}`);
    }
  };

  // Muestra un indicador mientras se consultan los insumos.
  if (loading) {
    return (
      <div className="text-center my-4">
        <Spinner color="primary" />
        <p className="text-secondary mt-2">Cargando insumos...</p>
      </div>
    );
  }

  // Muestra el error y permite volver a intentar la consulta.
  if (error) {
    return (
      <Alert color="danger">
        <p className="mb-2">{error}</p>
        <Button color="danger" outline size="sm" onClick={recargar}>
          Reintentar
        </Button>
      </Alert>
    );
  }

  return (
    <section>
      {/* Encabezado de la sección y modo de funcionamiento. */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h2 className="h5 mb-1">Gestión de insumos</h2>
          <p className="text-secondary mb-0">
            Consulta y administra las existencias de ingredientes.
          </p>
        </div>

        <Badge color={usarMock ? 'info' : 'success'}>
          {usarMock ? 'Modo demostración' : 'Modo API'}
        </Badge>
      </div>

      {/* Muestra los mensajes generados por las operaciones. */}
      {mensaje && (
        <Alert
          color={mensaje.startsWith('No se pudo') ? 'danger' : 'success'}
          toggle={() => setMensaje('')}
        >
          {mensaje}
        </Alert>
      )}

      {/* Tarjeta con el buscador y el botón para registrar insumos. */}
      <Card className="mb-3">
        <CardBody>
          <div className="d-flex flex-wrap justify-content-between align-items-end gap-3">
            <FormGroup className="mb-0 flex-grow-1">
              <Label for="buscar-insumo">Buscar insumo</Label>
              <Input
                id="buscar-insumo"
                type="search"
                placeholder="Escribe el nombre del insumo..."
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
              />
            </FormGroup>

            <Button color="primary" onClick={abrirNuevo}>
              Registrar insumo
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Formulario que se muestra al registrar o editar un insumo. */}
      {mostrarFormulario && (
        <Card className="mb-3">
          <CardBody>
            <h3 className="h5 mb-3">
              {insumoSeleccionado ? 'Editar insumo' : 'Nuevo insumo'}
            </h3>

            <InsumoForm
              insumo={insumoSeleccionado}
              onSubmit={guardar}
              onCancel={cerrarFormulario}
              loading={guardando}
            />
          </CardBody>
        </Card>
      )}

      {/* Tabla que presenta los insumos registrados. */}
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="h5 mb-0">Insumos registrados</h3>

            <span className="text-secondary small">
              {insumosFiltrados.length} registro(s)
            </span>
          </div>

          {/* Mensaje cuando no existen registros o no hay coincidencias. */}
          {insumosFiltrados.length === 0 ? (
            <Alert color="info" className="mb-0">
              {busqueda
                ? 'No se encontraron insumos con ese nombre.'
                : 'Todavía no hay insumos registrados.'}
            </Alert>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Insumo</th>
                  <th>Existencia</th>
                  <th>Unidad</th>
                  <th>Mínimo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {insumosFiltrados.map((insumo) => {
                  // Recupera el mínimo con el nombre correcto o el antiguo.
                  const cantidad = Number(insumo.quantity ?? 0);

                  const minimo = Number(
                    insumo.minimumQuantity ??
                    insumo.minimunQuantity ??
                    0
                  );

                  // Evita mostrar NaN si algún registro contiene datos inválidos.
                  const cantidadSegura = Number.isFinite(cantidad)
                    ? cantidad
                    : 0;

                  const minimoSeguro = Number.isFinite(minimo)
                    ? minimo
                    : 0;

                  // Comprueba si la existencia está en el mínimo o por debajo.
                  const bajoStock = cantidadSegura <= minimoSeguro;

                  return (
                    <tr key={insumo.id}>
                      <td>{insumo.name}</td>
                      <td>{cantidadSegura}</td>
                      <td>{insumo.unit}</td>
                      <td>{minimoSeguro}</td>

                      {/* Identifica visualmente el estado de las existencias. */}
                      <td>
                        <Badge color={bajoStock ? 'danger' : 'success'}>
                          {bajoStock ? 'Stock bajo' : 'Disponible'}
                        </Badge>
                      </td>

                      {/* Acciones disponibles para cada insumo. */}
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            color="warning"
                            size="sm"
                            onClick={() => abrirEdicion(insumo)}
                          >
                            Editar
                          </Button>

                          <Button
                            color="danger"
                            size="sm"
                            outline
                            onClick={() => eliminarRegistro(insumo)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </section>
  );
}
