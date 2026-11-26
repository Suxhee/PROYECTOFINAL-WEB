import { useState } from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';

import PageHeader from '../../components/ui/PageHeader.jsx';
import Proveedores from './Proveedores.jsx';
import FacturaCompra from './FacturaCompra.jsx';
import ListadoCompras from './ListadoCompras.jsx';
import CuentasPorPagar from './CuentasPorPagar.jsx';

const pestanas = [
  { id: 'proveedores', label: 'Proveedores' },
  { id: 'nueva-compra', label: 'Nueva compra' },
  { id: 'historial', label: 'Historial de compras' },
  { id: 'cuentas', label: 'Cuentas por pagar' },
];

export default function Compras() {
  const [pestanaActiva, setPestanaActiva] = useState('proveedores');

  return (
    <>
      <PageHeader
        title="Compras y proveedores"
        description="Gestión de proveedores, abastecimiento y cuentas por pagar."
      />

      <Nav tabs className="mb-4">
        {pestanas.map((pestana) => (
          <NavItem key={pestana.id}>
            <NavLink
              tag="button"
              type="button"
              active={pestanaActiva === pestana.id}
              onClick={() => setPestanaActiva(pestana.id)}
            >
              {pestana.label}
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      {pestanaActiva === 'proveedores' && <Proveedores />}

      {pestanaActiva === 'nueva-compra' && <FacturaCompra />}

      {pestanaActiva === 'historial' && <ListadoCompras />}

      {pestanaActiva === 'cuentas' && <CuentasPorPagar />}
    </>
  );
}