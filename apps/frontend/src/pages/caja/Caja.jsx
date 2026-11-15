import PageHeader from '../../components/ui/PageHeader.jsx';
import { caja } from '../../mocks/caja.js';
import AlertMessage from '../../components/ui/AlertMessage.jsx';
export default function Caja() { return <><PageHeader title="Caja" description="Estado de caja de la sucursal." /><AlertMessage color="secondary">Estado: {import.meta.env.VITE_USE_MOCK === 'true' ? caja.estado : 'sin datos cargados'}.</AlertMessage></>; }
