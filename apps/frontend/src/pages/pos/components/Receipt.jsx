
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from 'reactstrap';

export default function Receipt({
  isOpen,
  toggle,
  venta
}) {

  // comprobar que existe una venta
  if (!venta) {
    return null;
  }

  // obtener los datos de la venta
  const {
    correlativo,
    fecha,
    productos,
    subtotal,
    iva,
    total,
    pago
  } = venta;

  // identificar el tipo de comprobante
  const esCreditoFiscal = pago.tipoComprobante === 'CCF';

  const tipoComprobante = esCreditoFiscal
    ? 'Comprobante de crédito fiscal'
    : 'Consumidor final';

  // obtener los datos del cliente
  const cliente = pago.cliente;

  // nombres de los metodos de pago
  const metodosPago = {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    digital: 'Pago digital'
  };

  // obtener el nombre del metodo de pago
  const metodoPago = metodosPago[pago.metodoPago];

  // mostrar la fecha de la venta
  const fechaVenta = new Date(fecha).toLocaleString('es-SV', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/El_Salvador'
  });

  // imprimir el comprobante
  const imprimirRecibo = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      centered
      scrollable
      className="pos-receipt-modal"
    >

      <ModalHeader toggle={toggle}>

        <div className="pos-receipt-success">

          <div className="pos-receipt-success-icon">

            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12l4 4L19 6" />
            </svg>

          </div>

          <div>

            <h2>Venta completada</h2>

            <p>Pago registrado en modo de prueba.</p>

          </div>

        </div>

      </ModalHeader>

      <ModalBody>

        <div className="pos-receipt-preview">

          {/* documento que se mostrara al imprimir */}
          <article
            id="pos-receipt-print"
            className="pos-receipt-paper"
          >

            {/* identidad de la cafeteria */}
            <header className="pos-receipt-brand">

              <svg
                width="76"
                height="32"
                viewBox="0 0 100 35"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M50 31 Q48 15 50 4" />
                <path d="M50 24 Q32 22 30 12 Q44 10 50 24" />
                <path d="M50 15 Q67 13 70 2 Q54 1 50 15" />
                <path d="M50 30 Q66 29 75 20 Q60 16 50 30" />
              </svg>

              <h2>orígenes.</h2>

              <span className="pos-receipt-country">
                Café de El Salvador
              </span>

              <p>De nuestra tierra, a tu mesa.</p>

            </header>

            {/* informacion del comprobante */}
            <section className="pos-receipt-info">

              <span className="pos-receipt-type">
                {tipoComprobante}
              </span>

              <strong>
                N.º {correlativo}
              </strong>

              <span className="pos-receipt-date">
                {fechaVenta}
              </span>

            </section>

            {/* datos del cliente para credito fiscal */}
            {esCreditoFiscal && cliente && (

              <section className="pos-receipt-customer">

                <h3>Datos del contribuyente</h3>

                <p>
                  {cliente.razonSocial}
                </p>

                <p>
                  NIT: {cliente.nit}
                </p>

                <p>
                  NRC: {cliente.nrc}
                </p>

                <p>
                  Giro: {cliente.giro}
                </p>

                <p>
                  Dirección: {cliente.direccion}
                </p>

              </section>

            )}

            {/* nombre opcional del consumidor final */}
            {!esCreditoFiscal && cliente?.razonSocial && (

              <section className="pos-receipt-customer">

                <h3>Datos del cliente</h3>

                <p>
                  {cliente.razonSocial}
                </p>

              </section>

            )}

            <div className="pos-receipt-divider" />

            {/* detalle de los productos vendidos */}
            <section className="pos-receipt-products">

              <div className="pos-receipt-products-header">

                <span>Cant.</span>

                <span>Descripción</span>

                <span>Importe</span>

              </div>

              {productos.map((item) => (

                <div
                  className="pos-receipt-product"
                  key={item.productoId}
                >

                  <span>
                    {item.cantidad}
                  </span>

                  <div className="pos-receipt-product-description">

                    <span>
                      {item.nombre}
                    </span>

                    <small>
                      ${item.precio.toFixed(2)} c/u
                    </small>

                  </div>

                  <span>
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </span>

                </div>

              ))}

            </section>

            <div className="pos-receipt-divider" />

            {/* importes de la venta */}
            <section className="pos-receipt-totals">

              <div className="pos-receipt-row">

                <span>Subtotal sin IVA</span>

                <span>${subtotal.toFixed(2)}</span>

              </div>

              <div className="pos-receipt-row">

                <span>IVA (13%)</span>

                <span>${iva.toFixed(2)}</span>

              </div>

              <div className="pos-receipt-total">

                <span>Total</span>

                <strong>
                  ${total.toFixed(2)}
                </strong>

              </div>

            </section>

            {/* informacion del pago */}
            <section className="pos-receipt-payment">

              <div className="pos-receipt-row">

                <span>Forma de pago</span>

                <span>{metodoPago}</span>

              </div>

              {/* mostrar el efectivo y el cambio */}
              {pago.metodoPago === 'efectivo' ? (

                <>

                  <div className="pos-receipt-row">

                    <span>Recibido</span>

                    <span>
                      ${pago.montoRecibido.toFixed(2)}
                    </span>

                  </div>

                  <div className="pos-receipt-row">

                    <span>Cambio</span>

                    <span>
                      ${pago.cambio.toFixed(2)}
                    </span>

                  </div>

                </>

              ) : (

                /* mostrar la referencia del pago */
                <div className="pos-receipt-row">

                  <span>Referencia</span>

                  <span>{pago.referencia}</span>

                </div>

              )}

            </section>

            <div className="pos-receipt-divider" />

            {/* mensaje de despedida */}
            <footer className="pos-receipt-thanks">

              <p>
                Gracias por compartir un café con nosotros.
              </p>

              <span>¡Te esperamos pronto!</span>

              <small className="pos-receipt-disclaimer">
                Documento de prueba sin validez fiscal.
              </small>

            </footer>

          </article>

        </div>

      </ModalBody>

      <ModalFooter>

        {/* imprimir el comprobante */}
        <Button
          type="button"
          outline
          color="secondary"
          className="pos-receipt-print-button"
          onClick={imprimirRecibo}
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
            <path d="M6 9V3h12v6" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-4a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v4a2 2 0 0 1-2 2h-2" />
            <path d="M6 14h12v7H6z" />
            <path d="M18 12h.01" />
          </svg>

          Imprimir

        </Button>

        {/* cerrar el recibo y continuar vendiendo */}
        <Button
          type="button"
          className="pos-receipt-new-sale"
          onClick={toggle}
        >

          Nueva venta

        </Button>

      </ModalFooter>

    </Modal>
  );

}
