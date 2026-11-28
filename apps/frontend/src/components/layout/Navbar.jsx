import { NavLink } from 'react-router-dom';
import { Nav, Navbar as BsNavbar, NavbarBrand, NavItem } from 'reactstrap';
import useCajaEstado from '../../hooks/useCajaEstado.js';
import useAlertasStock from '../../hooks/useAlertasStock.js';

const links = [
  ['/pos', 'POS'], ['/inventario', 'Inventario'], ['/compras', 'Compras'],
  ['/caja', 'Caja'], ['/rrhh', 'RRHH'],
];

export default function Navbar() {
  // Consulta el mismo estado compartido que usa la página de Caja.
  const caja = useCajaEstado();
  const { alertas, error: alertasError } = useAlertasStock();
  return (
    <BsNavbar color="dark" dark expand="md" className="px-3">
      <NavbarBrand className="fw-semibold">Orígenes SV</NavbarBrand>
      <Nav navbar className="gap-md-2">
        {links.map(([to, label]) => (
          <NavItem key={to}>
            <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to={to}>
              {label}
            </NavLink>
          </NavItem>
        ))}
      </Nav>
      <div className="ms-auto d-flex flex-wrap gap-3 text-white small">
        <span>
          Caja: {caja.cargando ? 'cargando' : caja.error ? 'no disponible' : caja.abierta === true ? 'abierta' : caja.abierta === false ? 'cerrada' : 'sin datos'}
        </span>
        <span>
          Alertas de stock: {alertasError ? 'no disponibles' : alertas.length}
        </span>
      </div>
    </BsNavbar>
  );
}
