import { useEffect, useState } from 'react';
import { Badge, Row, Col, Card, CardBody } from 'reactstrap';
import DataTable from '../../components/ui/DataTable.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import AlertMessage from '../../components/ui/AlertMessage.jsx';
import { listarCompras } from '../../api/compras.js';
import {
  formatearFecha,
  formatearMoneda,
} from '../../utils/format.js';
const obtenerFechaActual = () => {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
};
export default function CuentasPorPagar() {
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

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

  const cuentasPendientes = compras.filter(
    (compra) => !compra.pagada
  );

  const calcularSaldoPendiente = (compra) => {
  return compra.pagada ? 0 : Number(compra.total);
};

const deudaTotal = Math.round(
  cuentasPendientes.reduce(
    (acumulado, compra) =>
      acumulado + calcularSaldoPendiente(compra),
    0
  ) * 100
) / 100;

const cantidadPendientes = cuentasPendientes.length;
const fechaActual = obtenerFechaActual();

const estaVencida = (compra) => {
  return (
    !compra.pagada &&
    Boolean(compra.fechaLimite) &&
    compra.fechaLimite < fechaActual
  );
};

const cantidadVencidas = cuentasPendientes.filter(
  estaVencida
).length;

  const columnas = [
    {
      key: 'proveedor',
      label: 'Proveedor',
    },
    {
      key: 'numeroFactura',
      label: 'Número de factura',
    },
    {
      key: 'fecha',
      label: 'Fecha de compra',
      render: (compra) => formatearFecha(compra.fecha),
    },
    {
      key: 'fechaLimite',
      label: 'Fecha límite de pago',
      render: (compra) => formatearFecha(compra.fechaLimite),
    },
    {
      key: 'total',
      label: 'Total de factura',
      render: (compra) => formatearMoneda(compra.total),
    },
    {
  key: 'saldoPendiente',
  label: 'Saldo pendiente',
  render: (compra) => (
    <strong>
      {formatearMoneda(calcularSaldoPendiente(compra))}
    </strong>
  ),
},
   {
  key: 'pagada',
  label: 'Estado',
  render: (compra) => (
    <Badge color={estaVencida(compra) ? 'danger' : 'warning'}>
      {estaVencida(compra)
        ? 'Vencida'
        : 'Pendiente de pago'}
    </Badge>
  ),
},
  ];

  if (cargando) {
    return <LoadingSpinner label="Cargando cuentas por pagar..." />;
  }

  if (error) {
    return <AlertMessage color="danger">{error}</AlertMessage>;
  }

  return (
    <section>
      <h2 className="h4 mb-3">Cuentas por pagar</h2>
  <Row className="mb-4">
  <Col xs={12} md={4} className="mb-3">
    <Card className="h-100">
      <CardBody>
        <h3 className="h6 text-muted">
          Deuda total con proveedores
        </h3>

        <p className="h3 text-danger mb-0">
          {formatearMoneda(deudaTotal)}
        </p>
      </CardBody>
    </Card>
  </Col>

  <Col xs={12} md={4} className="mb-3">
    <Card className="h-100">
      <CardBody>
        <h3 className="h6 text-muted">
          Facturas pendientes
        </h3>

        <p className="h3 mb-0">
          {cantidadPendientes}
        </p>
      </CardBody>
    </Card>
  </Col>

  <Col xs={12} md={4} className="mb-3">
    <Card className="h-100">
      <CardBody>
        <h3 className="h6 text-muted">
          Facturas vencidas
        </h3>

        <p className="h3 text-danger mb-0">
          {cantidadVencidas}
        </p>
      </CardBody>
    </Card>
  </Col>
</Row>

      <DataTable
        columns={columnas}
        rows={cuentasPendientes}
        emptyMessage="No hay cuentas pendientes de pago."
      />
    </section>
  );
}