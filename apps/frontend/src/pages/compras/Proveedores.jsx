import { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
} from 'reactstrap';

import DataTable from '../../components/ui/DataTable.jsx';
import AlertMessage from '../../components/ui/AlertMessage.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';

import ProveedorForm from './ProveedorForm.jsx';

import {
  listarProveedores,
  crearProveedor,
  actualizarProveedor,
} from '../../api/compras.js';

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [errorFormulario, setErrorFormulario] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] =
    useState(null);

  useEffect(() => {
    let activo = true;

    const cargarProveedores = async () => {
      try {
        const datos = await listarProveedores();

        if (activo) {
          setProveedores(datos);
        }
      } catch (error) {
        if (activo) {
          setError(error.message);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    cargarProveedores();

    return () => {
      activo = false;
    };
  }, []);

  const abrirRegistro = () => {
    setProveedorSeleccionado(null);
    setErrorFormulario('');
    setExito('');
    setModalAbierto(true);
  };

  const abrirEdicion = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setErrorFormulario('');
    setExito('');
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    if (guardando) {
      return;
    }

    setModalAbierto(false);
    setProveedorSeleccionado(null);
    setErrorFormulario('');
  };

  const guardarProveedor = async (datos) => {
    setGuardando(true);
    setErrorFormulario('');

    try {
      if (proveedorSeleccionado) {
        const actualizado = await actualizarProveedor(
          proveedorSeleccionado.id,
          datos
        );

        setProveedores((anteriores) =>
          anteriores.map((item) =>
            item.id === actualizado.id ? actualizado : item
          )
        );

        setExito('Proveedor actualizado correctamente.');
      } else {
        const nuevo = await crearProveedor(datos);

        setProveedores((anteriores) => [
          ...anteriores,
          nuevo,
        ]);

        setExito('Proveedor registrado correctamente.');
      }

      setModalAbierto(false);
      setProveedorSeleccionado(null);
    } catch (error) {
      setErrorFormulario(error.message);
    } finally {
      setGuardando(false);
    }
  };

  const columnas = [
    {
      key: 'compania',
      label: 'Compañía',
    },
    {
      key: 'nombreContacto',
      label: 'Contacto',
    },
    {
      key: 'correo',
      label: 'Correo electrónico',
    },
    {
      key: 'telefono',
      label: 'Teléfono',
      render: (proveedor) => proveedor.telefono || '—',
    },
    {
      key: 'direccion',
      label: 'Dirección',
      render: (proveedor) => proveedor.direccion || '—',
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (proveedor) => (
        <Badge color={proveedor.activo ? 'success' : 'secondary'}>
          {proveedor.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (proveedor) => (
        <Button
          color="primary"
          outline
          size="sm"
          onClick={() => abrirEdicion(proveedor)}
        >
          Editar
        </Button>
      ),
    },
  ];

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4 mb-0">Listado de proveedores</h2>

        <Button
          color="primary"
          onClick={abrirRegistro}
          disabled={cargando || Boolean(error)}
        >
          + Nuevo proveedor
        </Button>
      </div>

      {error && (
        <AlertMessage color="danger">
          {error}
        </AlertMessage>
      )}

      {exito && (
        <AlertMessage color="success">
          {exito}
        </AlertMessage>
      )}

      {cargando ? (
        <LoadingSpinner label="Cargando proveedores..." />
      ) : !error ? (
        <DataTable
          columns={columnas}
          rows={proveedores}
          emptyMessage="No hay proveedores registrados."
        />
      ) : null}

      <Modal
        isOpen={modalAbierto}
        toggle={cerrarModal}
        size="lg"
        centered
        backdrop={guardando ? 'static' : true}
        keyboard={!guardando}
      >
        <ModalHeader toggle={guardando ? undefined : cerrarModal}>
          {proveedorSeleccionado
            ? 'Editar proveedor'
            : 'Registrar proveedor'}
        </ModalHeader>

        <ModalBody>
          {errorFormulario && (
            <AlertMessage color="danger">
              {errorFormulario}
            </AlertMessage>
          )}

          {modalAbierto && (
            <ProveedorForm
              proveedor={proveedorSeleccionado}
              onSubmit={guardarProveedor}
              onCancel={cerrarModal}
              guardando={guardando}
            />
          )}
        </ModalBody>
      </Modal>
    </section>
  );
}