

import { Card, CardBody, Button } from 'reactstrap';

export default function ProductCard({ producto, onAgregar }) {

  // verificar si el producto esta agotado
  const agotado = producto.disponibilidad === 0;

  return (
    <Card className={`pos-product-card ${agotado ? 'agotado' : ''}`}>

      {/* mostrar la imagen o la categoria si no tiene foto */}
      <div className="pos-product-image">
        {producto.imagen ? (
          <img
            src={producto.imagen}
            alt={producto.nombre}
          />
        ) : (
          <span>{producto.categoria}</span>
        )}
      </div>

      <CardBody className="pos-product-body">

        {/* informacion del producto */}
        <span className="pos-product-category">
          {producto.categoria}
        </span>

        <h3 className="pos-product-name">
          {producto.nombre}
        </h3>

        <div className="pos-product-footer">

          {/* mostrar el precio o avisar que esta agotado */}
          {agotado ? (
            <span className="pos-product-status">
              Agotado
            </span>
          ) : (
            <strong>
              ${producto.precio.toFixed(2)}
            </strong>
          )}

          {/* agregar al carrito solo si se puede vender */}
          <Button
            type="button"
            className="pos-add-button"
            disabled={agotado || !onAgregar}
            aria-label={`Agregar ${producto.nombre}`}
            onClick={() => onAgregar(producto)}
          >
            +
          </Button>

        </div>

      </CardBody>

    </Card>
  );
}