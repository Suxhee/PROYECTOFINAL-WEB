import { Spinner } from 'reactstrap';
export default function LoadingSpinner({ label = 'Cargando...' }) {
  return <div className="d-flex align-items-center gap-2" role="status"><Spinner size="sm" />{label}</div>;
}
