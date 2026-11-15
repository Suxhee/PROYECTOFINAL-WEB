import { productos } from '../../../mocks/productos.js';
import ProductCard from './ProductCard.jsx';
export default function ProductGrid() {
  const visibleProducts = import.meta.env.VITE_USE_MOCK === 'true' ? productos : [];
  return <div className="row g-3">{visibleProducts.map((product) => <div className="col-sm-6 col-lg-3" key={product.id}><ProductCard product={product} /></div>)}</div>;
}
