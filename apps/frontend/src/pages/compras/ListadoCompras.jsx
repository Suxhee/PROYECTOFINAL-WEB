import { compras } from '../../mocks/compras.js';
import DataTable from '../../components/ui/DataTable.jsx';
export default function ListadoCompras() { return <DataTable columns={[{ key: 'fecha', label: 'Fecha' }, { key: 'proveedor', label: 'Proveedor' }, { key: 'total', label: 'Total' }]} rows={import.meta.env.VITE_USE_MOCK === 'true' ? compras : []} />; }
