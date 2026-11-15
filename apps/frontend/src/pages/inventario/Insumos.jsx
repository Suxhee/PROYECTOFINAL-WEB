import { insumos } from '../../mocks/insumos.js';
import DataTable from '../../components/ui/DataTable.jsx';
export default function Insumos() { return <DataTable columns={[{ key: 'nombre', label: 'Insumo' }, { key: 'stock', label: 'Existencia' }, { key: 'unidad', label: 'Unidad' }]} rows={import.meta.env.VITE_USE_MOCK === 'true' ? insumos : []} />; }
