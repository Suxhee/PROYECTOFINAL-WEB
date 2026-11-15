import DataTable from '../../components/ui/DataTable.jsx';
import { productos } from '../../mocks/productos.js';
export default function Productos() { return <DataTable columns={[{ key: 'nombre', label: 'Producto' }, { key: 'precio', label: 'Precio' }]} rows={import.meta.env.VITE_USE_MOCK === 'true' ? productos : []} />; }
