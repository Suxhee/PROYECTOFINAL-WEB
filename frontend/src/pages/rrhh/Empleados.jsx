import { empleados } from '../../mocks/empleados.js';
import DataTable from '../../components/ui/DataTable.jsx';
export default function Empleados() { return <DataTable columns={[{ key: 'nombre', label: 'Empleado' }, { key: 'puesto', label: 'Puesto' }, { key: 'sucursal', label: 'Sucursal' }]} rows={import.meta.env.VITE_USE_MOCK === 'true' ? empleados : []} />; }
