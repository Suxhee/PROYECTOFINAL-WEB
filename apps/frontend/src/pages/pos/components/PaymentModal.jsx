
import { useState } from 'react';

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
  FormFeedback
} from 'reactstrap';

export default function PaymentModal({
  isOpen,
  toggle,
  carrito = [],
  subtotal = 0,
  iva = 0,
  total = 0,
  onConfirmar,
  onClosed
}) {

  // datos del comprobante y metodo de pago
  const [tipoComprobante, setTipoComprobante] = useState('CF');
  const [metodoPago, setMetodoPago] = useState('efectivo');

  // datos del cliente
  const [cliente, setCliente] = useState({
    razonSocial: '',
    nit: '',
    nrc: '',
    giro: '',
    direccion: ''
  });

  // errores de los campos del cliente
  const [camposRevisados, setCamposRevisados] = useState({});

  // datos del pago
  const [montoRecibido, setMontoRecibido] = useState('');
  const [referencia, setReferencia] = useState('');
  const [error, setError] = useState('');

  // calcular el cambio utilizando centavos
  const totalCentavos = Math.round(total * 100);

  const recibidoCentavos = Math.round(
    Number(montoRecibido) * 100
  );

  const cambio = Math.max(
    0,
    recibidoCentavos - totalCentavos
  ) / 100;

  // comprobar si el efectivo es insuficiente
  const montoInsuficiente =
    montoRecibido !== '' &&
    recibidoCentavos < totalCentavos;

  const montoFaltante = Math.max(
    0,
    totalCentavos - recibidoCentavos
  ) / 100;

  // contar los productos del pedido
  const cantidadProductos = carrito.reduce(
    (acumulado, item) => acumulado + item.cantidad,
    0
  );

  // actualizar los datos del cliente
  const actualizarCliente = (campo, valor) => {

    setCliente(clienteActual => ({
      ...clienteActual,
      [campo]: valor
    }));

    setError('');

  };

  // marcar un campo como revisado
  const revisarCampo = (campo) => {

    setCamposRevisados(camposActuales => ({
      ...camposActuales,
      [campo]: true
    }));

  };

  // validar los datos del credito fiscal
  const validarCliente = () => {

    const errores = {};

    if (tipoComprobante !== 'CCF') {
      return errores;
    }

    if (!cliente.razonSocial.trim()) {
      errores.razonSocial =
        'Ingresa el nombre o razón social.';
    }

    // validar el formato del nit
    const nitValido =
      /^(?:[0-9]{14}|[0-9]{4}-[0-9]{6}-[0-9]{3}-[0-9])$/;

    if (!cliente.nit.trim()) {

      errores.nit = 'Ingresa el NIT.';

    } else if (!nitValido.test(cliente.nit.trim())) {

      errores.nit = 'El NIT debe contener 14 dígitos.';

    }

    // validar el formato del nrc
    const nrcValido = /^[0-9]+(?:-[0-9])?$/;

    if (!cliente.nrc.trim()) {

      errores.nrc = 'Ingresa el NRC.';

    } else if (!nrcValido.test(cliente.nrc.trim())) {

      errores.nrc = 'Ingresa un NRC válido.';

    }

    if (!cliente.giro.trim()) {
      errores.giro = 'Ingresa el giro comercial.';
    }

    if (!cliente.direccion.trim()) {
      errores.direccion = 'Ingresa la dirección.';
    }

    return errores;

  };

  // obtener los errores actuales del formulario
  const erroresCliente = validarCliente();

  const clienteValido =
    Object.keys(erroresCliente).length === 0;

  // limpiar los campos del formulario
  const reiniciarFormulario = () => {

    setTipoComprobante('CF');
    setMetodoPago('efectivo');

    setCliente({
      razonSocial: '',
      nit: '',
      nrc: '',
      giro: '',
      direccion: ''
    });

    setCamposRevisados({});
    setMontoRecibido('');
    setReferencia('');
    setError('');

  };

  // cambiar el tipo de comprobante
  const cambiarComprobante = (tipo) => {

    setTipoComprobante(tipo);
    setCamposRevisados({});
    setError('');

  };

  // cambiar el metodo de pago
  const seleccionarMetodo = (metodo) => {

    setMetodoPago(metodo);
    setMontoRecibido('');
    setReferencia('');
    setError('');

  };

  // validar los datos antes de confirmar el pago
  const confirmarPago = (e) => {

    e.preventDefault();
    setError('');

    if (
      carrito.length === 0 ||
      !Number.isFinite(total) ||
      total <= 0
    ) {

      setError('El pedido no tiene un total válido.');
      return;

    }

    // comprobar los datos del credito fiscal
    if (!clienteValido) {

      setCamposRevisados({
        razonSocial: true,
        nit: true,
        nrc: true,
        giro: true,
        direccion: true
      });

      setError(
        'Revisa los datos del comprobante de crédito fiscal.'
      );

      return;

    }

    // validar el pago en efectivo
    if (metodoPago === 'efectivo') {

      if (
        montoRecibido.trim() === '' ||
        !Number.isFinite(Number(montoRecibido)) ||
        Number(montoRecibido) <= 0
      ) {

        setError('Ingresa un monto válido.');
        return;

      }

      if (montoInsuficiente) {

        setError('El monto recibido es insuficiente.');
        return;

      }

    }

    // validar la referencia del pago
    if (
      metodoPago !== 'efectivo' &&
      !referencia.trim()
    ) {

      setError('Ingresa la referencia de la transacción.');
      return;

    }

    // preparar los datos del cliente
    let datosCliente = null;

    if (tipoComprobante === 'CCF') {

      datosCliente = {
        razonSocial: cliente.razonSocial.trim(),
        nit: cliente.nit.trim(),
        nrc: cliente.nrc.trim(),
        giro: cliente.giro.trim(),
        direccion: cliente.direccion.trim()
      };

    } else if (cliente.razonSocial.trim()) {

      datosCliente = {
        razonSocial: cliente.razonSocial.trim()
      };

    }

    // preparar los datos de la venta
    const datosPago = {

      tipoComprobante,

      metodoPago,

      total: totalCentavos / 100,

      cliente: datosCliente,

      montoRecibido: metodoPago === 'efectivo'
        ? recibidoCentavos / 100
        : totalCentavos / 100,

      cambio: metodoPago === 'efectivo'
        ? cambio
        : 0,

      referencia: metodoPago !== 'efectivo'
        ? referencia.trim()
        : null

    };

    // enviar los datos al componente principal
    if (onConfirmar) {
      onConfirmar(datosPago);
    }

  };

  return (

    <Modal
      isOpen={isOpen}
      toggle={toggle}
      onClosed={() => {

        reiniciarFormulario();

        if (onClosed) {
          onClosed();
        }

      }}
      centered
      scrollable
      className="pos-payment-modal"
    >

      <ModalHeader toggle={toggle}>
        Finalizar venta
      </ModalHeader>

      <Form onSubmit={confirmarPago}>

        <ModalBody>

          <div className="pos-payment-layout">

            {/* formulario de facturacion y pago */}
            <section className="pos-payment-details">

              <FormGroup>

                <Label for="tipoComprobante">
                  Tipo de comprobante
                </Label>

                <Input
                  id="tipoComprobante"
                  type="select"
                  value={tipoComprobante}
                  onChange={(e) =>
                    cambiarComprobante(e.target.value)
                  }
                >

                  <option value="CF">
                    Consumidor final
                  </option>

                  <option value="CCF">
                    Comprobante de crédito fiscal
                  </option>

                </Input>

              </FormGroup>

              {/* datos opcionales del consumidor final */}
              {tipoComprobante === 'CF' && (

                <FormGroup>

                  <Label for="nombreCliente">
                    Nombre del cliente (opcional)
                  </Label>

                  <Input
                    id="nombreCliente"
                    type="text"
                    placeholder="Nombre del cliente"
                    value={cliente.razonSocial}
                    onChange={(e) =>
                      actualizarCliente(
                        'razonSocial',
                        e.target.value
                      )
                    }
                  />

                </FormGroup>

              )}

              {/* datos obligatorios para credito fiscal */}
              {tipoComprobante === 'CCF' && (

                <div className="pos-customer-fields">

                  <FormGroup>

                    <Label for="razonSocial">
                      Nombre o razón social *
                    </Label>

                    <Input
                      id="razonSocial"
                      type="text"
                      placeholder="Nombre de la empresa"
                      value={cliente.razonSocial}
                      invalid={Boolean(
                        camposRevisados.razonSocial &&
                        erroresCliente.razonSocial
                      )}
                      onChange={(e) =>
                        actualizarCliente(
                          'razonSocial',
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        revisarCampo('razonSocial')
                      }
                    />

                    <FormFeedback>
                      {erroresCliente.razonSocial}
                    </FormFeedback>

                  </FormGroup>

                  <FormGroup>

                    <Label for="nit">
                      NIT *
                    </Label>

                    <Input
                      id="nit"
                      type="text"
                      inputMode="numeric"
                      placeholder="0000-000000-000-0"
                      maxLength={17}
                      value={cliente.nit}
                      invalid={Boolean(
                        camposRevisados.nit &&
                        erroresCliente.nit
                      )}
                      onChange={(e) => {

                        actualizarCliente(
                          'nit',
                          e.target.value
                        );

                        revisarCampo('nit');

                      }}
                      onBlur={() => revisarCampo('nit')}
                    />

                    <FormFeedback>
                      {erroresCliente.nit}
                    </FormFeedback>

                  </FormGroup>

                  <FormGroup>

                    <Label for="nrc">
                      NRC *
                    </Label>

                    <Input
                      id="nrc"
                      type="text"
                      inputMode="numeric"
                      placeholder="000000-0"
                      maxLength={20}
                      value={cliente.nrc}
                      invalid={Boolean(
                        camposRevisados.nrc &&
                        erroresCliente.nrc
                      )}
                      onChange={(e) => {

                        actualizarCliente(
                          'nrc',
                          e.target.value
                        );

                        revisarCampo('nrc');

                      }}
                      onBlur={() => revisarCampo('nrc')}
                    />

                    <FormFeedback>
                      {erroresCliente.nrc}
                    </FormFeedback>

                  </FormGroup>

                  <FormGroup>

                    <Label for="giro">
                      Giro comercial *
                    </Label>

                    <Input
                      id="giro"
                      type="text"
                      placeholder="Actividad económica"
                      value={cliente.giro}
                      invalid={Boolean(
                        camposRevisados.giro &&
                        erroresCliente.giro
                      )}
                      onChange={(e) =>
                        actualizarCliente(
                          'giro',
                          e.target.value
                        )
                      }
                      onBlur={() => revisarCampo('giro')}
                    />

                    <FormFeedback>
                      {erroresCliente.giro}
                    </FormFeedback>

                  </FormGroup>

                  <FormGroup>

                    <Label for="direccion">
                      Dirección *
                    </Label>

                    <Input
                      id="direccion"
                      type="text"
                      placeholder="Dirección de la empresa"
                      value={cliente.direccion}
                      invalid={Boolean(
                        camposRevisados.direccion &&
                        erroresCliente.direccion
                      )}
                      onChange={(e) =>
                        actualizarCliente(
                          'direccion',
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        revisarCampo('direccion')
                      }
                    />

                    <FormFeedback>
                      {erroresCliente.direccion}
                    </FormFeedback>

                  </FormGroup>

                  <small className="pos-payment-note">
                    * Campos obligatorios para crédito fiscal.
                  </small>

                </div>

              )}

              {/* seleccionar el metodo de pago */}
              <FormGroup>

                <Label id="metodoPagoLabel">
                  Método de pago
                </Label>

                <div
                  className="pos-payment-methods"
                  role="group"
                  aria-labelledby="metodoPagoLabel"
                >

                  {[
                    {
                      valor: 'efectivo',
                      nombre: 'Efectivo'
                    },
                    {
                      valor: 'tarjeta',
                      nombre: 'Tarjeta'
                    },
                    {
                      valor: 'digital',
                      nombre: 'Pago digital'
                    }
                  ].map((metodo) => (

                    <Button
                      key={metodo.valor}
                      type="button"
                      className={`pos-payment-method ${
                        metodoPago === metodo.valor
                          ? 'seleccionado'
                          : ''
                      }`}
                      aria-pressed={
                        metodoPago === metodo.valor
                      }
                      onClick={() =>
                        seleccionarMetodo(metodo.valor)
                      }
                    >

                      <span className="pos-method-indicator" />

                      <span>{metodo.nombre}</span>

                    </Button>

                  ))}

                </div>

              </FormGroup>

              {/* solicitar los datos del pago */}
              {metodoPago === 'efectivo' ? (

                <FormGroup>

                  <Label for="montoRecibido">
                    Efectivo recibido ($)
                  </Label>

                  <Input
                    id="montoRecibido"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={montoRecibido}
                    onChange={(e) => {

                      setMontoRecibido(e.target.value);
                      setError('');

                    }}
                  />

                  <button
                    type="button"
                    className="pos-exact-amount"
                    onClick={() => {

                      setMontoRecibido(total.toFixed(2));
                      setError('');

                    }}
                  >

                    Usar monto exacto

                  </button>

                </FormGroup>

              ) : (

                <FormGroup>

                  <Label for="referencia">
                    Referencia de la transacción
                  </Label>

                  <Input
                    id="referencia"
                    type="text"
                    placeholder="Número de referencia"
                    value={referencia}
                    onChange={(e) => {

                      setReferencia(e.target.value);
                      setError('');

                    }}
                  />

                  <small className="pos-payment-note">
                    Verifica el pago antes de confirmar la venta.
                  </small>

                </FormGroup>

              )}

              {/* mostrar errores de validacion */}
              {error && (

                <Alert color="danger" className="mb-0">
                  {error}
                </Alert>

              )}

            </section>

            {/* resumen de los productos del pedido */}
            <aside className="pos-payment-summary">

              <div className="pos-payment-summary-header">

                <h3>Resumen del pedido</h3>

                <span>
                  {cantidadProductos} productos
                </span>

              </div>

              <div className="pos-payment-products">

                {carrito.map((item) => (

                  <div
                    className="pos-payment-product"
                    key={item.productoId}
                  >

                    <span className="pos-payment-product-qty">
                      {item.cantidad} ×
                    </span>

                    <span className="pos-payment-product-name">
                      {item.nombre}
                    </span>

                    <strong>
                      ${(item.precio * item.cantidad).toFixed(2)}
                    </strong>

                  </div>

                ))}

              </div>

              {/* importes de la venta */}
              <div className="pos-payment-totals">

                <div className="pos-summary-row">

                  <span>Subtotal sin IVA</span>

                  <span>${subtotal.toFixed(2)}</span>

                </div>

                <div className="pos-summary-row">

                  <span>IVA (13%)</span>

                  <span>${iva.toFixed(2)}</span>

                </div>

                <div className="pos-payment-grand-total">

                  <span>Total a pagar</span>

                  <strong>${total.toFixed(2)}</strong>

                </div>

              </div>

              {/* mostrar el cambio o el monto faltante */}
              {metodoPago === 'efectivo' && (

                <div
                  className={`pos-payment-change ${
                    montoInsuficiente
                      ? 'monto-insuficiente'
                      : ''
                  }`}
                >

                  <span>

                    {montoInsuficiente
                      ? 'Monto faltante'
                      : 'Cambio a entregar'}

                  </span>

                  <strong>

                    {montoRecibido === ''
                      ? '—'
                      : `$${montoInsuficiente
                          ? montoFaltante.toFixed(2)
                          : cambio.toFixed(2)}`}

                  </strong>

                </div>

              )}

            </aside>

          </div>

        </ModalBody>

        <ModalFooter>

          <Button
            type="button"
            color="secondary"
            outline
            onClick={toggle}
          >

            Cancelar

          </Button>

          <Button
            type="submit"
            className="pos-confirm-payment"
            disabled={
              !onConfirmar ||
              carrito.length === 0 ||
              !clienteValido
            }
          >

            Confirmar venta

          </Button>

        </ModalFooter>

      </Form>

    </Modal>

  );

}
