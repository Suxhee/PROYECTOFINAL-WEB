// Página principal de RRHH: organiza empleados, generación de planillas e historial en pestañas.

import { modoDemostracion } from "../../api/mode";
import { useState } from "react";
import { Nav, NavItem, NavLink } from "reactstrap";
import Empleados from "./Empleados";
import Planilla from "./Planilla";
import HistorialPlanillas from "./HistorialPlanillas";

export default function RRHH() {
  // Controla qué sección se muestra sin cambiar de ruta.
  const [seccion, setSeccion] = useState("empleados");

  return (
    <div className="container-fluid py-3">
      <h2 className="mb-1">Recursos Humanos y Nómina</h2>
      {modoDemostracion && <div className="alert alert-warning">Modo demostración: datos ficticios en memoria. No uses datos personales reales; al recargar se reinicia la sesión.</div>}
      <p className="text-muted">
        Administración de empleados, planillas y comprobantes de pago.
      </p>

      <Nav tabs className="mb-4">
        <NavItem>
          <NavLink
            href="#"
            active={seccion === "empleados"}
            onClick={(e) => {
              e.preventDefault();
              setSeccion("empleados");
            }}
          >
            Empleados
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            href="#"
            active={seccion === "planilla"}
            onClick={(e) => {
              e.preventDefault();
              setSeccion("planilla");
            }}
          >
            Generar planilla
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            href="#"
            active={seccion === "historial"}
            onClick={(e) => {
              e.preventDefault();
              setSeccion("historial");
            }}
          >
            Historial
          </NavLink>
        </NavItem>
      </Nav>

      {seccion === "empleados" && <Empleados />}
      {seccion === "planilla" && <Planilla />}
      {seccion === "historial" && <HistorialPlanillas />}
    </div>
  );
}
