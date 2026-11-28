
import { useState } from 'react';
import { Alert } from 'reactstrap';

import ProductGrid from './components/ProductGrid.jsx';
import Cart from './components/Cart.jsx';
import PaymentModal from './components/PaymentModal.jsx';
import Receipt from './components/Receipt.jsx';

import { productos } from '../../mocks/productos.js';

import {
  insumosPOS,
  recetasPOS,
  empacadosPOS,
  cajaPOS
} from '../../mocks/pos.js';

import { calcularTotales } from '../../utils/impuestos.js';

import {
  calcularDisponibilidad,
  validarCarrito,
  obtenerAlternativas,
  descontarExistencias,
  validarCaja
} from '../../utils/validaciones.js';

import './pos.css';

import { useState, useRef } from 'react';


export default function POS() {

  // guardar los productos del pedido
  const [carrito, setCarrito] = useState([]);

  // guardar las existencias actuales
  const [insumos, setInsumos] = useState(
    () => insumosPOS.map(item => ({ ...item }))
  );

  const [empacados, setEmpacados] = useState(
    () => empacadosPOS.map(item => ({ ...item }))
  );

  // controlar el modal de pago y los mensajes
  const [modalPago, setModalPago] = useState(false);
  const [mensaje, setMensaje] = useState('');

  // controlar la alerta de existencias
  const [alertaStock, setAlertaStock] = useState(null);
  const [mostrarAlternativas, setMostrarAlternativas] = useState(false);

  // guardar la venta confirmada
  const [ventaConfirmada, setVentaConfirmada] = useState(null);

  // controlar el modal del recibo
  const [modalRecibo, setModalRecibo] = useState(false);

  // controlar el numero de venta de prueba
  const [correlativo, setCorrelativo] = useState(1);

  // obtener los importes del pedido
  const { subtotal, iva, total } = calcularTotales(carrito);

  // calcular la disponibilidad con las existencias actuales
  const catalogo =
    import.meta.env.VITE_USE_MOCK === 'true'

      ? productos.map(producto => ({

          ...producto,

          disponibilidad: calcularDisponibilidad(
            producto.id,
            insumos,
            recetasPOS,
            empacados
          )

        }))

      : [];

  // obtener alternativas segun las existencias del pedido
  const alternativas = alertaStock

    ? obtenerAlternativas(
        alertaStock.producto,
        catalogo,
        carrito,
        insumos,
        recetasPOS,
        empacados
      )

    : [];

  // cerrar la alerta de existencias
  const cerrarAlertaStock = () => {
    setAlertaStock(null);
    setMostrarAlternativas(false);
  };

  // agregar un producto validando las existencias
  const agregarProducto = (producto) => {

    setMensaje('');

    // comprobar si el producto ya esta en el carrito
    const existe = carrito.find(
      item => item.productoId === producto.id
    );

    // preparar el nuevo pedido
    const nuevoCarrito = existe

      ? carrito.map(item =>
          item.productoId === producto.id

            ? {
                ...item,
                cantidad: item.cantidad + 1
              }

            : item
        )

      : [
          ...carrito,
          {
            productoId: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: 1
          }
        ];

    // validar las existencias actuales
    const resultado = validarCarrito(
      nuevoCarrito,
      insumos,
      recetasPOS,
      empacados
    );

    // mostrar la alerta si no hay suficientes existencias
    if (!resultado.valido) {

      setAlertaStock({
        producto,
        errores: resultado.errores,
        cantidad: existe ? existe.cantidad : 0
      });

      setMostrarAlternativas(false);

      return;

    }

    // actualizar el carrito
    setCarrito(nuevoCarrito);

    cerrarAlertaStock();

  };

  // aumentar la cantidad de un producto
  const aumentarCantidad = (productoId) => {

    const producto = catalogo.find(
      item => item.id === productoId
    );

    if (producto) {
      agregarProducto(producto);
    }

  };

  // disminuir la cantidad de un producto
  const disminuirCantidad = (productoId) => {

    setCarrito(carritoActual =>
      carritoActual

        .map(item =>
          item.productoId === productoId

            ? {
                ...item,
                cantidad: item.cantidad - 1
              }

            : item
        )

        .filter(item => item.cantidad > 0)
    );

    cerrarAlertaStock();
    setMensaje('');

  };

  // eliminar un producto del pedido
  const eliminarProducto = (productoId) => {

    setCarrito(carritoActual =>
      carritoActual.filter(
        item => item.productoId !== productoId
      )
    );

    cerrarAlertaStock();
    setMensaje('');

  };

  // eliminar todos los productos del pedido
  const vaciarCarrito = () => {

    setCarrito([]);

    cerrarAlertaStock();
    setMensaje('');

  };

  // abrir o cerrar el modal de pago
  const toggleModalPago = () => {
    setModalPago(estadoActual => !estadoActual);
  };

  // cerrar el recibo
  const cerrarRecibo = () => {
    setModalRecibo(false);
  };

  // validar el pedido antes de iniciar el cobro
  const iniciarCobro = () => {

    if (carrito.length === 0 || total <= 0) {
      return;
    }

    // comprobar que la caja este abierta
    const resultadoCaja = validarCaja(cajaPOS);

    if (!resultadoCaja.valido) {

      cerrarAlertaStock();
      setMensaje(resultadoCaja.mensaje);

      return;

    }

    // comprobar las existencias del pedido
    const resultado = validarCarrito(
      carrito,
      insumos,
      recetasPOS,
      empacados
    );

    if (!resultado.valido) {

      cerrarAlertaStock();
      setMensaje(resultado.errores.join(' '));

      return;

    }

    setMensaje('');
    setVentaConfirmada(null);
    cerrarAlertaStock();

    setModalPago(true);

  };

  // recibir los datos del pago
  const confirmarVenta = (datosPago) => {

    if (carrito.length === 0 || total <= 0) {
      return;
    }

    // comprobar que estamos usando datos simulados
    if (import.meta.env.VITE_USE_MOCK !== 'true') {

      setModalPago(false);

      setMensaje(
        'El registro de ventas todavía no está conectado.'
      );

      return;

    }

    // comprobar nuevamente que la caja este abierta
    const resultadoCaja = validarCaja(cajaPOS);

    if (!resultadoCaja.valido) {

      setModalPago(false);
      setMensaje(resultadoCaja.mensaje);

      return;

    }

    // validar y calcular el descuento de existencias
    const resultado = descontarExistencias(
      carrito,
      insumos,
      recetasPOS,
      empacados
    );

    // detener la venta si no hay suficientes existencias
    if (!resultado.valido) {

      setModalPago(false);
      setMensaje(resultado.errores.join(' '));

      return;

    }

    // preparar la informacion de la venta
    const venta = {

      correlativo: String(correlativo).padStart(6, '0'),

      cajaId: cajaPOS.id,

      fecha: new Date().toISOString(),

      productos: carrito.map(item => ({ ...item })),

      subtotal,

      iva,

      total,

      pago: datosPago

    };

    // actualizar las existencias despues de vender
    setInsumos(resultado.insumos);
    setEmpacados(resultado.empacados);

    // mostrar la informacion de la venta de prueba
    console.log('Venta simulada:', {

      correlativo: venta.correlativo,

      cajaId: venta.cajaId,

      subtotal: venta.subtotal,

      iva: venta.iva,

      total: venta.total,

      metodoPago: venta.pago.metodoPago

    });

    // mostrar las existencias actualizadas
    console.table(resultado.insumos);
    console.table(resultado.empacados);

    // guardar la venta confirmada
    setVentaConfirmada(venta);

    // aumentar el numero de la siguiente venta
    setCorrelativo(numeroActual => numeroActual + 1);

    // cerrar el formulario de pago
    setModalPago(false);

    // limpiar el pedido
    setCarrito([]);

    cerrarAlertaStock();
    setMensaje('');

  };

  // abrir el recibo al cerrar el formulario de pago
  const mostrarRecibo = () => {

    if (ventaConfirmada) {
      setModalRecibo(true);
    }

  };

  return (

    <div className="pos-page">

      {/* encabezado del punto de venta */}
      <header className="pos-header">

        <div>

          <span className="pos-eyebrow">
            ORÍGENES SV · CAFÉ DE EL SALVADOR
          </span>

          <h1>Punto de venta</h1>

          <p>Registro de ventas por sucursal.</p>

        </div>

        <div className="pos-brand">

          <span>orígenes.</span>

          <small>De nuestra tierra, a tu mesa.</small>

        </div>

      </header>

      {/* mostrar los mensajes generales */}
      {mensaje && (

        <Alert
          color="warning"
          toggle={() => setMensaje('')}
        >

          {mensaje}

        </Alert>

      )}

      <div className="pos-layout">

        {/* catalogo de productos */}
        <ProductGrid
          productos={catalogo}
          onAgregar={agregarProducto}
        />

        {/* pedido actual */}
        <Cart
          carrito={carrito}
          subtotal={subtotal}
          iva={iva}
          total={total}
          onAumentar={aumentarCantidad}
          onDisminuir={disminuirCantidad}
          onEliminar={eliminarProducto}
          onVaciar={vaciarCarrito}
          onCobrar={iniciarCobro}
        />

      </div>

      {/* formulario de pago */}
      <PaymentModal
        isOpen={modalPago}
        toggle={toggleModalPago}
        carrito={carrito}
        subtotal={subtotal}
        iva={iva}
        total={total}
        onConfirmar={confirmarVenta}
        onClosed={mostrarRecibo}
      />

      {/* comprobante de la venta */}
      <Receipt
        isOpen={modalRecibo}
        toggle={cerrarRecibo}
        venta={ventaConfirmada}
      />

      {/* alerta flotante de existencias */}
      {alertaStock && (

        <aside
          className="pos-stock-alert"
          aria-label="Advertencia de existencias"
        >

          <div className="pos-stock-alert-header">

            <div className="pos-stock-alert-icon">

              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>

            </div>

            <div className="pos-stock-alert-title">

              <h3>Existencias insuficientes</h3>

              <p>{alertaStock.producto.nombre}</p>

            </div>

            <button
              type="button"
              className="pos-stock-alert-close"
              onClick={cerrarAlertaStock}
              aria-label="Cerrar alerta"
            >
              ×
            </button>

          </div>

          {/* mostrar los motivos del rechazo */}
          <div
            className="pos-stock-alert-message"
            role="alert"
          >

            {alertaStock.errores.map((error, index) => (

              <p key={index}>
                {error}
              </p>

            ))}

          </div>

          <p className="pos-stock-alert-note">
            Tu pedido no se ha modificado.
          </p>

          {/* mostrar u ocultar las alternativas */}
          <button
            type="button"
            className="pos-stock-alert-expand"
            aria-expanded={mostrarAlternativas}
            aria-controls="pos-stock-alternatives"
            onClick={() =>
              setMostrarAlternativas(
                estadoActual => !estadoActual
              )
            }
          >

            <span>

              {mostrarAlternativas
                ? 'Ocultar alternativas'
                : 'Ver alternativas disponibles'}

            </span>

            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >

              {mostrarAlternativas

                ? <path d="m6 15 6-6 6 6" />

                : <path d="m6 9 6 6 6-6" />}

            </svg>

          </button>

          {/* lista de productos alternativos */}
          {mostrarAlternativas && (

            <div
              id="pos-stock-alternatives"
              className="pos-stock-alternatives"
            >

              {alternativas.length > 0 ? (

                <>

                  <p className="pos-stock-alternatives-note">
                    Productos que puedes ofrecer al cliente.
                  </p>

                  {alternativas.map(producto => (

                    <div
                      key={producto.id}
                      className="pos-stock-alternative"
                    >

                      <div className="pos-stock-alternative-image">

                        {producto.imagen ? (

                          <img
                            src={producto.imagen}
                            alt={producto.nombre}
                          />

                        ) : (

                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >

                            <path d="M3 8h14v5a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z" />

                            <path d="M17 9h2a2 2 0 0 1 0 4h-2M2 21h18M7 2v3M11 2v3" />

                          </svg>

                        )}

                      </div>

                      <div className="pos-stock-alternative-info">

                        <h4>{producto.nombre}</h4>

                        <span>
                          ${Number(producto.precio).toFixed(2)}
                        </span>

                      </div>

                      <button
                        type="button"
                        className="pos-stock-alternative-add"
                        onClick={() => agregarProducto(producto)}
                      >
                        + Agregar
                      </button>

                    </div>

                  ))}

                </>

              ) : (

                <p className="pos-stock-alternatives-empty">
                  No hay alternativas disponibles en esta categoría.
                </p>

              )}

              <button
                type="button"
                className="pos-stock-alert-continue"
                onClick={cerrarAlertaStock}
              >
                Continuar con el pedido
              </button>

            </div>

          )}

        </aside>

      )}

    </div>

  );

}
