import { useEffect, useState } from 'react';
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

      <DataTable
        columns={columnas}
        rows={compras}
        emptyMessage="No hay compras registradas."
      />
    </section>
  );
}