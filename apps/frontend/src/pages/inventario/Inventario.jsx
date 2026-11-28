import { useState } from "react";
import { Button, ButtonGroup } from "reactstrap";

import PageHeader from '../../components/ui/PageHeader.jsx';
import Insumos from './Insumos.jsx'
import Productos from "./Productos.jsx";
import RecetaEditor from "./RecetaEditor.jsx";
import AlertasStock from './AlertasStock.jsx'

export default function Inventario() {
    //Controla cual de las secciones del inventario esta visible.
    const [seccionActiva, setSeccionActiva] = useState('insumos');

    return (
         <>
            {/* Encabezado general del módulo. */}
            <PageHeader
                title="Inventario"
                description="Administra insumos, productos y sus recetas."
            />

            {/* Botones para navegar entre las secciones. */}
            <div className="mb-4">
                <ButtonGroup className="flex-wrap">
                    <Button
                        color={seccionActiva === 'insumos' ? 'primary' : 'secondary'}
                        outline={seccionActiva !== 'insumos'}
                        onClick={() => setSeccionActiva('insumos')}
                    >
                        Insumos
                    </Button>

                    <Button
                        color={seccionActiva === 'productos' ? 'primary' : 'secondary'}
                        outline={seccionActiva !== 'productos'}
                        onClick={() => setSeccionActiva('productos')}
                    >
                        Productos
                    </Button>

                    <Button
                        color={seccionActiva === 'recetas' ? 'primary' : 'secondary'}
                        outline={seccionActiva !== 'recetas'}
                        onClick={() => setSeccionActiva('recetas')}
                    >
                        Recetas
                    </Button>

                    <Button 
                        color={seccionActiva === 'alertas' ? 'primary' : 'secondary'}
                        outline={seccionActiva !== 'alertas'}
                        onClick={() => setSeccionActiva('alertas')}
                    >
                        Alertas de stock
                    </Button>
                </ButtonGroup>
            </div>

            {/* Renderiza únicamente la sección seleccionada. */}
            {seccionActiva === 'insumos' && <Insumos />}
            {seccionActiva === 'productos' && <Productos />}
            {seccionActiva === 'recetas' && <RecetaEditor />}
            {seccionActiva === 'alertas' && <AlertasStock />}
        </>
    );
}