import { useEffect, useState } from 'react';
import { Badge, Row, Col } from 'reactstrap';
import FormField from '../../components/ui/FormField.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import AlertMessage from '../../components/ui/AlertMessage.jsx';
import { listarCompras } from '../../api/compras.js';
import {
  formatearFecha,
  formatearMoneda,
} from '../../utils/format.js';

export default function ListadoCompras() {
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtroProveedor, setFiltroProveedor] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    let activo = true;

    const cargarCompras = async () => {
      try {
        const datos = await listarCompras();

        if (activo) {
          setCompras(datos);
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

    cargarCompras();

    return () => {
      activo = false;
    };
  }, []);

  const proveedoresDisponibles = [
    ...new Map(
      compras.map((compra) => [
        compra.proveedorId,
        {
          id: compra.proveedorId,
          nombre: compra.proveedor,
        },
      ])
    ).values(),
  ];

  const comprasFiltradas = compras.filter((compra) => {
    const coincideProveedor =
      filtroProveedor === '' ||
      String(compra.proveedorId) === filtroProveedor;

    const coincideEstado =
      filtroEstado === '' ||
      (filtroEstado === 'PAGADA' && compra.pagada) ||
      (filtroEstado === 'PENDIENTE' && !compra.pagada);

    return coincideProveedor && coincideEstado;
  });

  const columnas = [
    {
      key: 'fecha',
      label: 'Fecha',
      render: (compra) => formatearFecha(compra.fecha),
    },
    {
      key: 'proveedor',
      label: 'Proveedor',
    },
    {
      key: 'numeroFactura',
      label: 'Número de factura',
    },
    {
      key: 'total',
      label: 'Total',
      render: (compra) => formatearMoneda(compra.total),
    },
    {
      key: 'condicionPago',
      label: 'Condición de pago',
      render: (compra) => (
        <Badge
          color={
            compra.condicionPago === 'CONTADO'
              ? 'primary'
              : 'info'
          }
        >
          {compra.condicionPago === 'CONTADO'
            ? 'Contado'
            : 'Crédito'}
        </Badge>
      ),
    },
    {
      key: 'pagada',
      label: 'Estado de pago',
      render: (compra) => (
        <Badge color={compra.pagada ? 'success' : 'warning'}>
          {compra.pagada ? 'Pagada' : 'Pendiente de pago'}
        </Badge>
      ),
    },
  ];

  if (cargando) {
    return <LoadingSpinner label="Cargando compras..." />;
  }

  if (error) {
    return <AlertMessage color="danger">{error}</AlertMessage>;
  }

  return (
    <section>
      <h2 className="h4 mb-3">Historial de compras</h2>

      <Row className="mb-3">
        <Col md={6} lg={4}>
          <FormField
            id="filtro-proveedor"
            label="Filtrar por proveedor"
            type="select"
            value={filtroProveedor}
            onChange={(event) =>
              setFiltroProveedor(event.target.value)
            }
          >
            <option value="">Todos los proveedores</option>

            {proveedoresDisponibles.map((proveedor) => (
              <option
                key={proveedor.id}
                value={proveedor.id}
              >
                {proveedor.nombre}
              </option>
            ))}
          </FormField>
        </Col>

        <Col md={6} lg={4}>
          <FormField
            id="filtro-estado"
            label="Filtrar por estado de pago"
            type="select"
            value={filtroEstado}
            onChange={(event) =>
              setFiltroEstado(event.target.value)
            }
          >
            <option value="">Todos los estados</option>
            <option value="PAGADA">Pagadas</option>
            <option value="PENDIENTE">
              Pendientes de pago
            </option>
          </FormField>
        </Col>
      </Row>

      <DataTable
        columns={columnas}
        rows={comprasFiltradas}
        emptyMessage="No se encontraron compras."
      />
    </section>
  );
}