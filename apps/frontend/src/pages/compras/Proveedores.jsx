import DataTable from '../../components/ui/DataTable.jsx';
import { proveedores } from '../../mocks/proveedores.js';
export default function Proveedores() { return <DataTable columns={[{ key: 'nombre', label: 'Proveedor' }, { key: 'activo', label: 'Activo' }]} rows={import.meta.env.VITE_USE_MOCK === 'true' ? proveedores : []} />; }
