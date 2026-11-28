
import { Button } from 'reactstrap';

export default function Cart({
  carrito = [],
  subtotal = 0,
  iva = 0,
  total = 0,
  onAumentar,
  onDisminuir,
  onEliminar,
  onVaciar,
  onCobrar
}) {

  return (
    <aside className="pos-ticket">

      {/* encabezado del pedido */}
      <div className="pos-ticket-header">

        <h2>Pedido actual</h2>

        <Button
          type="button"
          className="pos-clear-cart"
          onClick={onVaciar}
          disabled={carrito.length === 0 || !onVaciar}
          aria-label="Vaciar pedido"
          title="Vaciar pedido"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M5 6l1 14h12l1-14" />
            <path d="M10 10v6M14 10v6" />
          </svg>
        </Button>

      </div>

      {/* mostrar los productos del pedido */}
      <div className="pos-cart-items">

        {carrito.length === 0 ? (
          <div className="pos-cart-empty">
            <h3>Tu pedido está vacío</h3>
            <p>Selecciona productos del menú.</p>
          </div>
        ) : (
          carrito.map((item) => (
            <div
              className="pos-cart-item"
              key={item.productoId}
            >

              {/* nombre e importe del producto */}
              <h3 className="pos-cart-name">
                {item.nombre}
              </h3>

              <strong className="pos-cart-price">
                ${(item.precio * item.cantidad).toFixed(2)}
              </strong>

              {/* controlar la cantidad */}
              <div className="pos-cart-quantity">

                <Button
                  type="button"
                  aria-label={`Disminuir ${item.nombre}`}
                  disabled={!onDisminuir}
                  onClick={() => onDisminuir(item.productoId)}
                >
                  −
                </Button>

                <span>{item.cantidad}</span>

                <Button
                  type="button"
                  aria-label={`Aumentar ${item.nombre}`}
                  disabled={!onAumentar}
                  onClick={() => onAumentar(item.productoId)}
                >
                  +
                </Button>

              </div>

              {/* eliminar el producto completo */}
              <button
                type="button"
                className="pos-remove-item"
                aria-label={`Eliminar ${item.nombre}`}
                title={`Eliminar ${item.nombre}`}
                disabled={!onEliminar}
                onClick={() => onEliminar(item.productoId)}
              >
                ×
              </button>

            </div>
          ))
        )}

      </div>

      {/* resumen de los importes */}
      <div className="pos-cart-summary">

        <div className="pos-summary-row">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        <div className="pos-summary-row">
          <span>IVA (13%)</span>
          <span>${iva.toFixed(2)}</span>
        </div>

        <div className="pos-summary-row pos-summary-total">
          <strong>Total</strong>
          <strong>${total.toFixed(2)}</strong>
        </div>

      </div>

      {/* continuar con el pago */}
      <Button
        type="button"
        className="pos-checkout-button"
        disabled={carrito.length === 0 || !onCobrar}
        onClick={onCobrar}
      >
        <span>Cobrar</span>

        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>

      </Button>

    </aside>
  );
}
