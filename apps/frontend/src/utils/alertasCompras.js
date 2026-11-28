export const CONFIG_ALERTAS_COMPRAS = Object.freeze({
  factorExcesoStock: 3,
  porcentajeIncrementoPrecio: 10,
  diasProximoVencimiento: 7,
});

export function calcularProyeccionStock(insumo, detalle) {
  if (!insumo || !detalle) {
    return null;
  }

  const stockActual = Number(insumo.stock);
  const stockMinimo = Number(insumo.stockMinimo);
  const cantidadPaquete = Number(detalle.cantidadPaquete);
  const unidadesPaquete = Number(detalle.unidadesPaquete);

  if (
    insumo.stock == null ||
    insumo.stockMinimo == null ||
    String(insumo.stock).trim() === '' ||
    String(insumo.stockMinimo).trim() === '' ||
    !Number.isFinite(stockActual) ||
    !Number.isFinite(stockMinimo) ||
    stockActual < 0 ||
    stockMinimo <= 0 ||
    !Number.isSafeInteger(cantidadPaquete) ||
    !Number.isSafeInteger(unidadesPaquete) ||
    cantidadPaquete <= 0 ||
    unidadesPaquete <= 0
  ) {
    return null;
  }

  const cantidadAdquirida = cantidadPaquete * unidadesPaquete;
  const stockProyectado = stockActual + cantidadAdquirida;
  const umbralExceso =
    stockMinimo * CONFIG_ALERTAS_COMPRAS.factorExcesoStock;

  if (
    !Number.isSafeInteger(cantidadAdquirida) ||
    !Number.isFinite(stockProyectado) ||
    !Number.isFinite(umbralExceso)
  ) {
    return null;
  }

  return {
    stockActual,
    stockMinimo,
    cantidadAdquirida,
    stockProyectado,
    umbralExceso,
    unidad: insumo.unidad,
    excesoStock: stockProyectado > umbralExceso,
    abastecimientoInsuficiente: stockProyectado < stockMinimo,
  };
}

export function generarAlertasStock(insumos, detalles) {
  const alertas = [];

  detalles.forEach((detalle) => {
    const insumo = insumos.find(
      (item) => String(item.id) === String(detalle.insumoId)
    );

    const proyeccion = calcularProyeccionStock(insumo, detalle);

    if (!proyeccion) {
      return;
    }

    if (proyeccion.excesoStock) {
      alertas.push({
        id: `exceso-${detalle.id}`,
        tipo: 'EXCESO_STOCK',
        color: 'warning',
        titulo: `Posible exceso de inventario: ${insumo.nombre}`,
        mensaje: `La compra elevaría las existencias de ${proyeccion.stockActual} a ${proyeccion.stockProyectado} ${proyeccion.unidad}, superando el umbral preventivo de ${proyeccion.umbralExceso} ${proyeccion.unidad}. Verifica si el abastecimiento es necesario.`,
      });
    }

    if (proyeccion.abastecimientoInsuficiente) {
      alertas.push({
        id: `insuficiente-${detalle.id}`,
        tipo: 'ABASTECIMIENTO_INSUFICIENTE',
        color: 'warning',
        titulo: `Abastecimiento insuficiente: ${insumo.nombre}`,
        mensaje: `Después de la compra quedarían ${proyeccion.stockProyectado} ${proyeccion.unidad}, por debajo del mínimo de ${proyeccion.stockMinimo} ${proyeccion.unidad}.`,
      });
    }
  });

  return alertas;
}
export function calcularCantidadRecomendada(insumo, detalle) {
  const proyeccion = calcularProyeccionStock(insumo, detalle);

  if (!proyeccion) {
    return null;
  }

  const unidadesPaquete = Number(detalle.unidadesPaquete);

  const cantidadFaltante = Math.max(
    0,
    proyeccion.stockMinimo - proyeccion.stockActual
  );

  const paquetesRecomendados = Math.ceil(
    cantidadFaltante / unidadesPaquete
  );

  return {
    cantidadFaltante,
    paquetesRecomendados,
    cantidadRecomendada: paquetesRecomendados * unidadesPaquete,
    unidad: proyeccion.unidad,
  };
}

export function generarSugerenciasCompra(insumos, detalles) {
  const sugerencias = [];

  detalles.forEach((detalle) => {
    const insumo = insumos.find(
      (item) => String(item.id) === String(detalle.insumoId)
    );

    const recomendacion = calcularCantidadRecomendada(
      insumo,
      detalle
    );

    if (!recomendacion || recomendacion.cantidadFaltante === 0) {
      return;
    }

    sugerencias.push({
      id: `sugerencia-${detalle.id}`,
      tipo: 'CANTIDAD_RECOMENDADA',
      color: 'info',
      titulo: `Cantidad recomendada: ${insumo.nombre}`,
      mensaje: `Faltan ${recomendacion.cantidadFaltante} ${recomendacion.unidad} para alcanzar el stock mínimo. Se recomienda adquirir al menos ${recomendacion.paquetesRecomendados} paquete(s), equivalentes a ${recomendacion.cantidadRecomendada} ${recomendacion.unidad}.`,
    });
  });

  return sugerencias;
}
export function calcularCostoUnitario(detalle) {
  if (!detalle) {
    return null;
  }

  const costo = Number(detalle.costoPaquete);
  const unidades = Number(detalle.unidadesPaquete);

  if (
    !Number.isFinite(costo) ||
    costo <= 0 ||
    !Number.isSafeInteger(unidades) ||
    unidades <= 0
  ) {
    return null;
  }

  const costoUnitario = costo / unidades;

  return Number.isFinite(costoUnitario) && costoUnitario > 0
    ? costoUnitario
    : null;
}

export function buscarUltimaCompra(
  compras,
  proveedorId,
  insumoId,
  sucursalId,
  fechaCompra
) {
  const comprasComparables = compras
    .filter(
      (compra) =>
        String(compra.proveedorId) === String(proveedorId) &&
        String(compra.sucursalId) === String(sucursalId) &&
        compra.estado === 'REGISTRADA' &&
        compra.fecha &&
        compra.fecha <= fechaCompra &&
        compra.detalles?.some(
          (detalle) =>
            String(detalle.insumoId) === String(insumoId)
        )
    )
    .sort(
      (a, b) =>
        b.fecha.localeCompare(a.fecha) ||
        Number(b.id) - Number(a.id)
    );

  const ultimaCompra = comprasComparables[0];

  if (!ultimaCompra) {
    return null;
  }

  const detalle = ultimaCompra.detalles.find(
    (item) => String(item.insumoId) === String(insumoId)
  );

  return {
    compra: ultimaCompra,
    detalle,
  };
}

export function generarAlertasPrecio(
  compras,
  insumos,
  detalles,
  proveedorId,
  sucursalId,
  fechaCompra
) {
  if (!proveedorId || !fechaCompra) {
    return [];
  }

  const alertas = [];

  detalles.forEach((detalle) => {
    const insumo = insumos.find(
      (item) => String(item.id) === String(detalle.insumoId)
    );

    if (!insumo) {
      return;
    }

    const ultimaCompra = buscarUltimaCompra(
      compras,
      proveedorId,
      detalle.insumoId,
      sucursalId,
      fechaCompra
    );

    if (!ultimaCompra) {
      return;
    }

    const precioAnterior = calcularCostoUnitario(
      ultimaCompra.detalle
    );

    const precioActual = calcularCostoUnitario(detalle);

    if (precioAnterior === null || precioActual === null) {
      return;
    }

    const incremento =
      ((precioActual - precioAnterior) / precioAnterior) * 100;

    if (
      Number.isFinite(incremento) &&
      incremento >=
        CONFIG_ALERTAS_COMPRAS.porcentajeIncrementoPrecio - 1e-9
    ) {
      alertas.push({
        id: `precio-${detalle.id}`,
        tipo: 'INCREMENTO_PRECIO',
        color: 'warning',
        titulo: `Incremento de precio: ${insumo.nombre}`,
        mensaje: `El costo por ${insumo.unidad} aumentó un ${incremento.toFixed(2)} %. Precio anterior: $${precioAnterior.toFixed(4)}. Precio actual: $${precioActual.toFixed(4)}. Factura de referencia: ${ultimaCompra.compra.numeroFactura}. Verifica el precio con el proveedor.`,
      });
    }
  });

  return alertas;
}
export function calcularDiasParaVencimiento(fechaLimite, fechaActual) {
  const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;

  if (
    !formatoFecha.test(fechaLimite) ||
    !formatoFecha.test(fechaActual)
  ) {
    return null;
  }

  const limite = new Date(`${fechaLimite}T00:00:00Z`);
  const actual = new Date(`${fechaActual}T00:00:00Z`);

  if (
    !Number.isFinite(limite.getTime()) ||
    !Number.isFinite(actual.getTime())
  ) {
    return null;
  }

  if (
    limite.toISOString().slice(0, 10) !== fechaLimite ||
    actual.toISOString().slice(0, 10) !== fechaActual
  ) {
    return null;
  }

  return (limite.getTime() - actual.getTime()) / 86400000;
}

export function obtenerProximosVencimientos(compras, fechaActual) {
  return compras
    .filter((compra) => !compra.pagada && compra.fechaLimite)
    .map((compra) => ({
      ...compra,
      diasRestantes: calcularDiasParaVencimiento(
        compra.fechaLimite,
        fechaActual
      ),
    }))
    .filter(
      (compra) =>
        compra.diasRestantes !== null &&
        compra.diasRestantes >= 0 &&
        compra.diasRestantes <=
          CONFIG_ALERTAS_COMPRAS.diasProximoVencimiento
    )
    .sort((a, b) => a.diasRestantes - b.diasRestantes);
}