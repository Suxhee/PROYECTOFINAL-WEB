import { useEffect, useState } from 'react';
import { Row, Col, Button, Table, Input } from 'reactstrap';

import FormField from '../../components/ui/FormField.jsx';
import AlertMessage from '../../components/ui/AlertMessage.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';

import { esCampoRequerido, esNumeroPositivo,} from '../../utils/validaciones.js';
import {
  listarProveedores,
  crearCompra,
  listarCompras,
} from '../../api/compras.js';
import { insumos } from '../../mocks/insumos.js';
import { formatearMoneda } from '../../utils/format.js';
import {
  generarAlertasStock,
  generarSugerenciasCompra,
  generarAlertasPrecio,
} from '../../utils/alertasCompras.js';

const obtenerFechaActual = () => {
  const fecha = new Date();

  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
};
const crearDetalleVacio = (id) => ({
  id,
  insumoId: '',
  cantidadPaquete: '1',
  unidadesPaquete: '1',
  costoPaquete: '',
});
const TASA_IVA = 0.13;
export default function FacturaCompra() {
  const [proveedores, setProveedores] = useState([]);
  const [comprasHistoricas, setComprasHistoricas] = useState([]);
const [errorHistorial, setErrorHistorial] = useState('');
const [cargandoHistorial, setCargandoHistorial] = useState(true);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [errores, setErrores] = useState([]);
  const [guardando, setGuardando] = useState(false);
const [mensajeExito, setMensajeExito] = useState('');
const [errorRegistro, setErrorRegistro] = useState('');



  const [encabezado, setEncabezado] = useState({
    proveedorId: '',
    numeroFactura: '',
    fecha: obtenerFechaActual(),
    condicionPago: 'CONTADO',
    fechaLimite: '',
  });
  const [detalles, setDetalles] = useState([
  crearDetalleVacio(1),
]);

  useEffect(() => {
    let activo = true;

    const cargarProveedores = async () => {
      try {
        const datos = await listarProveedores();

        if (activo) {
          setProveedores(
            datos.filter((proveedor) => proveedor.activo)
          );
        }
      } catch (error) {
        if (activo) {
          setError(error.message);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    cargarProveedores();

    return () => {
      activo = false;
    };
  }, []);
  useEffect(() => {
  let activo = true;

  const cargarHistorial = async () => {
    try {
      const datos = await listarCompras();

      if (activo) {
        setComprasHistoricas(datos);
        setErrorHistorial('');
      }
    } catch (error) {
      if (activo) {
        setErrorHistorial(error.message);
      }
    } finally {
      if (activo) {
        setCargandoHistorial(false);
      }
    }
  };

  cargarHistorial();

  return () => {
    activo = false;
  };
}, []);

  const manejarCambio = (event) => {
    const { name, value } = event.target;

    setEncabezado((anterior) => ({
      ...anterior,
      [name]: value,
      ...(name === 'condicionPago' && value === 'CONTADO'
        ? { fechaLimite: '' }
        : {}),
    }));
  };
  const agregarDetalle = () => {
  setDetalles((anteriores) => [
    ...anteriores,
    crearDetalleVacio(
      Math.max(0, ...anteriores.map((detalle) => detalle.id)) + 1
    ),
  ]);
};

const eliminarDetalle = (id) => {
  setDetalles((anteriores) =>
    anteriores.filter((detalle) => detalle.id !== id)
  );
};

const actualizarDetalle = (id, campo, valor) => {
  setDetalles((anteriores) =>
    anteriores.map((detalle) =>
      detalle.id === id
        ? { ...detalle, [campo]: valor }
        : detalle
    )
  );
};

const calcularSubtotalDetalle = (detalle) => {
  const cantidad = Number(detalle.cantidadPaquete);
  const costo = Number(detalle.costoPaquete);

  return Math.round(cantidad * costo * 100) / 100;
};
const subtotal = Math.round(
  detalles.reduce(
    (acumulado, detalle) =>
      acumulado + calcularSubtotalDetalle(detalle),
    0
  ) * 100
) / 100;

const iva = Math.round(subtotal * TASA_IVA * 100) / 100;

const total = Math.round((subtotal + iva) * 100) / 100;
const esCredito = encabezado.condicionPago === 'CREDITO';

const pagada = !esCredito;

const saldoPendiente = esCredito ? total : 0;
const alertasStock = [
  ...generarAlertasStock(insumos, detalles),
  ...generarSugerenciasCompra(insumos, detalles),
  ...generarAlertasPrecio(
    comprasHistoricas,
    insumos,
    detalles,
    encabezado.proveedorId,
    1,
    encabezado.fecha
  ),
];
const validarCompra = () => {
  const nuevosErrores = [];

  const proveedorValido = proveedores.some(
    (proveedor) =>
      String(proveedor.id) === encabezado.proveedorId &&
      proveedor.activo
  );

  if (!proveedorValido) {
    nuevosErrores.push('Selecciona un proveedor activo.');
  }

  if (!esCampoRequerido(encabezado.numeroFactura)) {
    nuevosErrores.push('El número de factura es obligatorio.');
  }

  if (!esCampoRequerido(encabezado.fecha)) {
    nuevosErrores.push('La fecha de compra es obligatoria.');
  }

  if (!['CONTADO', 'CREDITO'].includes(encabezado.condicionPago)) {
    nuevosErrores.push('La condición de pago no es válida.');
  }

  if (esCredito) {
    if (!esCampoRequerido(encabezado.fechaLimite)) {
      nuevosErrores.push('La fecha límite de pago es obligatoria.');
    } else if (encabezado.fechaLimite < encabezado.fecha) {
      nuevosErrores.push(
        'La fecha límite no puede ser anterior a la fecha de compra.'
      );
    }
  }

  if (detalles.length === 0) {
    nuevosErrores.push('Agrega al menos un insumo.');
  }

  detalles.forEach((detalle, indice) => {
    const fila = indice + 1;

    const insumoValido = insumos.some(
      (insumo) => String(insumo.id) === detalle.insumoId
    );

    if (!insumoValido) {
      nuevosErrores.push(
        `Fila ${fila}: selecciona un insumo válido.`
      );
    }

    if (
      !esNumeroPositivo(detalle.cantidadPaquete) ||
      !Number.isInteger(Number(detalle.cantidadPaquete))
    ) {
      nuevosErrores.push(
        `Fila ${fila}: la cantidad de paquetes debe ser un entero positivo.`
      );
    }

    if (
      !esNumeroPositivo(detalle.unidadesPaquete) ||
      !Number.isInteger(Number(detalle.unidadesPaquete))
    ) {
      nuevosErrores.push(
        `Fila ${fila}: las unidades por paquete deben ser un entero positivo.`
      );
    }

    if (
      !esNumeroPositivo(detalle.costoPaquete) ||
      !/^\d+(\.\d{1,2})?$/.test(String(detalle.costoPaquete))
    ) {
      nuevosErrores.push(
        `Fila ${fila}: ingresa un costo positivo con máximo dos decimales.`
      );
    }
  });

  const idsInsumos = detalles
    .map((detalle) => detalle.insumoId)
    .filter(Boolean);

  if (new Set(idsInsumos).size !== idsInsumos.length) {
    nuevosErrores.push('No se permiten insumos duplicados.');
  }

  if (!Number.isFinite(total) || total <= 0) {
    nuevosErrores.push('El total de la compra debe ser mayor que cero.');
  }

  setErrores(nuevosErrores);

  return nuevosErrores.length === 0;
};
const manejarEnvio = async (event) => {
  event.preventDefault();

  if (guardando) return;

  setMensajeExito('');
  setErrorRegistro('');

  if (!validarCompra()) {
    return;
  }

  setGuardando(true);

  try {
    const datosCompra = {
      proveedorId: Number(encabezado.proveedorId),
      sucursalId: 1,
      numeroFactura: encabezado.numeroFactura.trim(),
      fecha: encabezado.fecha,
      condicionPago: encabezado.condicionPago,
      fechaLimite: esCredito
        ? encabezado.fechaLimite
        : null,
      detalles: detalles.map((detalle) => ({
        insumoId: Number(detalle.insumoId),
        cantidadPaquete: Number(detalle.cantidadPaquete),
        unidadesPaquete: Number(detalle.unidadesPaquete),
        costoPaquete: Number(detalle.costoPaquete),
      })),
    };

    const compraRegistrada = await crearCompra(datosCompra);
    setComprasHistoricas((anteriores) => [
  ...anteriores.filter(
    (compra) => compra.id !== compraRegistrada.id
  ),
  compraRegistrada,
]);

    setMensajeExito(
      `Compra ${compraRegistrada.numeroFactura} registrada correctamente. Total: ${formatearMoneda(compraRegistrada.total)}.`
    );

    setEncabezado({
      proveedorId: '',
      numeroFactura: '',
      fecha: obtenerFechaActual(),
      condicionPago: 'CONTADO',
      fechaLimite: '',
    });

    setDetalles([crearDetalleVacio(1)]);
    setErrores([]);

  } catch (error) {
    setErrorRegistro(error.message);

  } finally {
    setGuardando(false);
  }
};

  if (cargando) {
    return <LoadingSpinner label="Cargando proveedores..." />;
  }

  if (error) {
    return <AlertMessage color="danger">{error}</AlertMessage>;
  }

  return (
    <section>
      <h2 className="h4 mb-3">Registro de compra</h2>

      <form onSubmit={manejarEnvio} noValidate>
        {mensajeExito && (
  <AlertMessage color="success">
    {mensajeExito}
  </AlertMessage>
)}

{errorRegistro && (
  <AlertMessage color="danger">
    {errorRegistro}
  </AlertMessage>
)}
        {errores.length > 0 && (
  <AlertMessage color="danger">
    <strong>Corrige los siguientes errores:</strong>

    <ul className="mb-0 mt-2">
      {errores.map((mensaje, indice) => (
        <li key={indice}>{mensaje}</li>
      ))}
    </ul>
  </AlertMessage>
)}
        <h3 className="h5 mb-3">Datos de la factura</h3>

        <Row>
          <Col md={6}>
            <FormField
              id="compra-proveedor"
              name="proveedorId"
              label="Proveedor"
              type="select"
              value={encabezado.proveedorId}
              onChange={manejarCambio}
              required
            >
              <option value="">Seleccionar proveedor</option>

              {proveedores.map((proveedor) => (
                <option
                  key={proveedor.id}
                  value={proveedor.id}
                >
                  {proveedor.compania}
                </option>
              ))}
            </FormField>
          </Col>

          <Col md={6}>
            <FormField
              id="compra-factura"
              name="numeroFactura"
              label="Número de factura"
              value={encabezado.numeroFactura}
              onChange={manejarCambio}
              required
            />
          </Col>

          <Col md={6}>
            <FormField
              id="compra-fecha"
              name="fecha"
              label="Fecha de compra"
              type="date"
              value={encabezado.fecha}
              onChange={manejarCambio}
              required
            />
          </Col>

          <Col md={6}>
            <FormField
              id="compra-condicion"
              name="condicionPago"
              label="Condición de pago"
              type="select"
              value={encabezado.condicionPago}
              onChange={manejarCambio}
              required
            >
              <option value="CONTADO">Contado</option>
              <option value="CREDITO">Crédito</option>
            </FormField>
          </Col>

          {encabezado.condicionPago === 'CREDITO' && (
            <Col md={6}>
              <FormField
                id="compra-fecha-limite"
                name="fechaLimite"
                label="Fecha límite de pago"
                type="date"
                min={encabezado.fecha}
                value={encabezado.fechaLimite}
                onChange={manejarCambio}
                required
              />
            </Col>
          )}
        </Row>
        <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
  <h3 className="h5 mb-0">Detalle de compra</h3>

  <Button
    type="button"
    color="primary"
    outline
    onClick={agregarDetalle}
    disabled={detalles.length >= insumos.length}
  >
    + Agregar insumo
  </Button>
</div>

<Table responsive bordered hover>
  <thead>
    <tr>
      <th>Insumo</th>
      <th>Paquetes</th>
      <th>Cantidad por paquete (unidad del insumo)</th>
      <th>Costo por paquete</th>
      <th>Subtotal</th>
      <th>Acción</th>
    </tr>
  </thead>

  <tbody>
    {detalles.map((detalle) => (
      <tr key={detalle.id}>
        <td>
          <Input
            type="select"
            aria-label="Insumo"
            value={detalle.insumoId}
            onChange={(event) =>
              actualizarDetalle(
                detalle.id,
                'insumoId',
                event.target.value
              )
            }
          >
            <option value="">Seleccionar insumo</option>

            {insumos.map((insumo) => (
              <option
                key={insumo.id}
                value={insumo.id}
                disabled={detalles.some(
                  (item) =>
                    item.id !== detalle.id &&
                    item.insumoId === String(insumo.id)
                )}
              >
                {insumo.nombre} ({insumo.unidad})
              </option>
            ))}
          </Input>
        </td>

        <td>
          <Input
            type="number"
            aria-label="Cantidad de paquetes"
            min="1"
            step="1"
            value={detalle.cantidadPaquete}
            onChange={(event) =>
              actualizarDetalle(
                detalle.id,
                'cantidadPaquete',
                event.target.value
              )
            }
          />
        </td>

        <td>
          <Input
            type="number"
            aria-label="Unidades por paquete"
            min="1"
            step="1"
            value={detalle.unidadesPaquete}
            onChange={(event) =>
              actualizarDetalle(
                detalle.id,
                'unidadesPaquete',
                event.target.value
              )
            }
          />
        </td>

        <td>
          <Input
            type="number"
            aria-label="Costo por paquete"
            min="0.01"
            step="0.01"
            value={detalle.costoPaquete}
            onChange={(event) =>
              actualizarDetalle(
                detalle.id,
                'costoPaquete',
                event.target.value
              )
            }
          />
        </td>

        <td className="align-middle">
          {formatearMoneda(
            calcularSubtotalDetalle(detalle)
          )}
        </td>

        <td>
          <Button
            type="button"
            color="danger"
            outline
            size="sm"
            disabled={detalles.length === 1}
            onClick={() => eliminarDetalle(detalle.id)}
          >
            Eliminar
          </Button>
        </td>
      </tr>
    ))}
  </tbody>
</Table>
{cargandoHistorial && (
  <p className="text-muted small mt-3">
    Consultando historial de precios...
  </p>
)}

{errorHistorial && (
  <AlertMessage color="warning">
    No se pudo consultar el historial de precios.
    Las alertas de incrementos no están disponibles.
    Puedes continuar registrando la compra.
  </AlertMessage>
)}
{alertasStock.length > 0 && (
  <section className="mt-4" aria-label="Alertas preventivas">
    <h3 className="h5 mb-2">
  Alertas preventivas de compra
</h3>

    <p className="text-muted small">
      Recomendaciones para apoyar la toma de decisiones.
      Estas advertencias no impiden registrar la compra.
    </p>

    {alertasStock.map((alerta) => (
      <AlertMessage
        key={alerta.id}
        color={alerta.color}
      >
        <strong>{alerta.titulo}</strong>

        <p className="mb-0 mt-1">
          {alerta.mensaje}
        </p>
      </AlertMessage>
    ))}
  </section>
)}
<Row className="justify-content-end mt-4">
  <Col md={5} lg={4}>
    <div className="border rounded p-3 bg-light">
      <h3 className="h5 mb-3">Resumen de compra</h3>

      <div className="d-flex justify-content-between mb-2">
        <span>Subtotal:</span>
        <span>{formatearMoneda(subtotal)}</span>
      </div>

      <div className="d-flex justify-content-between mb-2">
        <span>IVA (13 %):</span>
        <span>{formatearMoneda(iva)}</span>
      </div>

      <hr />

      <div className="d-flex justify-content-between fw-bold fs-5">
        <span>Total:</span>
        <span>{formatearMoneda(total)}</span>
      </div>

      {/* NUEVO CÓDIGO B8.7 */}

      <hr />

      <div className="d-flex justify-content-between mb-2">
        <span>Condición de pago:</span>
        <strong>{esCredito ? 'Crédito' : 'Contado'}</strong>
      </div>

      <div className="d-flex justify-content-between mb-2">
        <span>Estado de pago:</span>

        <span className={pagada ? 'text-success' : 'text-warning'}>
          {pagada ? 'Pagada' : 'Pendiente de pago'}
        </span>
      </div>

      <div className="d-flex justify-content-between">
        <span>Saldo pendiente:</span>
        <strong>{formatearMoneda(saldoPendiente)}</strong>
      </div>

    </div>
  </Col>
</Row>
<div className="d-flex justify-content-end mt-4">
<Button
  type="submit"
  color="primary"
  disabled={guardando}
>
  {guardando ? 'Registrando...' : 'Registrar compra'}
</Button>
</div>
      </form>
    </section>
  );
}