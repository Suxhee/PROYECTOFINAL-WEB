import { Link } from 'react-router-dom';
export default function NotFound() {
  return <section className="text-center py-5"><h1 className="h3">Página no encontrada</h1><Link to="/pos">Ir al POS</Link></section>;
}
