import { Card, CardBody, CardTitle } from 'reactstrap';
import { formatearMoneda } from '../../../utils/format.js';
export default function ProductCard({ product }) {
  return <Card className="h-100"><CardBody><CardTitle tag="h2" className="h6">{product.nombre}</CardTitle><span>{formatearMoneda(product.precio)}</span></CardBody></Card>;
}
