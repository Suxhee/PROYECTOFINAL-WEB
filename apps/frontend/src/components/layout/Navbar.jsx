import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Nav,
  Navbar as BsNavbar,
  NavbarBrand,
  NavItem,
  NavbarToggler,
  Collapse,
} from 'reactstrap';
import useCajaEstado from '../../hooks/useCajaEstado.js';
import useAlertasStock from '../../hooks/useAlertasStock.js';

const links = [
  ['/pos', 'POS'],
  ['/inventario', 'Inventario'],
  ['/compras', 'Compras'],
  ['/caja', 'Caja'],
  ['/rrhh', 'RRHH'],
];

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const location = useLocation();

  const caja = useCajaEstado();
  const stock = useAlertasStock();

  const actualizarCaja = caja.actualizar;
  const actualizarStock = stock.actualizar;

  useEffect(() => {
    actualizarCaja();
    actualizarStock();
  }, [location.pathname, actualizarCaja, actualizarStock]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      actualizarCaja();
      actualizarStock();
    }, 30000);

    return () => clearInterval(intervalo);
  }, [actualizarCaja, actualizarStock]);

  return (
    <BsNavbar color="dark" dark expand="md" className="px-3">
      <NavbarBrand className="fw-semibold">
        Orígenes SV
      </NavbarBrand>

      <NavbarToggler
        onClick={() => setMenuAbierto((anterior) => !anterior)}
        aria-label="Abrir o cerrar menú"
        aria-expanded={menuAbierto}
        aria-controls="menu-principal"
      />

      <Collapse id="menu-principal" isOpen={menuAbierto} navbar>
        <Nav navbar className="gap-md-2">
          {links.map(([to, label]) => (
            <NavItem key={to}>
              <NavLink
                className={({ isActive }) =>
                  `nav-link${isActive ? ' active' : ''}`
                }
                to={to}
                onClick={() => setMenuAbierto(false)}
              >
                {label}
              </NavLink>
            </NavItem>
          ))}
        </Nav>

        <div className="ms-md-auto d-flex flex-wrap gap-3 text-white small py-2">
          <span>
            Caja: {caja.loading
              ? 'cargando'
              : caja.error
                ? 'sin conexión'
                : caja.data?.estado ?? 'sin datos'}
          </span>

          <span>
            Alertas de stock: {stock.loading
              ? 'cargando'
              : stock.error
                ? 'no disponibles'
                : stock.alertas.length}
          </span>
        </div>
      </Collapse>
    </BsNavbar>
  );
}