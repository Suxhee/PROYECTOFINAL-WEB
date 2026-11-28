
// calcular cuantas unidades se pueden vender de un producto
export function calcularDisponibilidad(
  productoId,
  insumos,
  recetas,
  empacados
) {

  // comprobar si es un producto empacado
  const empacado = empacados.find(
    item => item.productoId === productoId
  );

  if (empacado) {
    return Math.max(0, Math.floor(empacado.stock));
  }

  // buscar los ingredientes del producto
  const receta = recetas.filter(
    item => item.productoId === productoId
  );

  // evitar vender productos sin receta registrada
  if (receta.length === 0) {
    return 0;
  }

  // calcular cuantas unidades permite cada insumo
  const cantidades = receta.map(item => {

    const insumo = insumos.find(
      insumo => insumo.id === item.insumoId
    );

    if (!insumo || item.cantidad <= 0) {
      return 0;
    }

    return Math.max(
      0,
      Math.floor(insumo.stock / item.cantidad)
    );

  });

  // devolver la menor cantidad disponible
  return Math.min(...cantidades);

}


// calcular los insumos necesarios para todo el pedido
export function calcularConsumoCarrito(
  carrito,
  recetas
) {

  const consumo = {};

  carrito.forEach(producto => {

    // buscar la receta de cada producto
    const receta = recetas.filter(
      item => item.productoId === producto.productoId
    );

    receta.forEach(item => {

      // multiplicar el consumo por la cantidad solicitada
      const cantidadNecesaria =
        item.cantidad * producto.cantidad;

      // acumular el consumo de los insumos compartidos
      consumo[item.insumoId] =
        (consumo[item.insumoId] || 0) +
        cantidadNecesaria;

    });

  });

  return consumo;

}


// validar las existencias de todo el pedido
export function validarCarrito(
  carrito,
  insumos,
  recetas,
  empacados
) {

  const errores = [];

  // validar las cantidades de los productos
  carrito.forEach(producto => {

    if (
      !Number.isInteger(producto.cantidad) ||
      producto.cantidad <= 0
    ) {
      errores.push(
        `Cantidad inválida para ${producto.nombre}.`
      );
    }

  });

  if (errores.length > 0) {
    return {
      valido: false,
      errores
    };
  }

  // calcular el consumo total de los ingredientes
  const consumo = calcularConsumoCarrito(
    carrito,
    recetas
  );

  // comprobar las existencias de los insumos
  Object.entries(consumo).forEach(
    ([insumoId, cantidadNecesaria]) => {

      const insumo = insumos.find(
        item => item.id === Number(insumoId)
      );

      if (!insumo) {

        errores.push(
          `El insumo ${insumoId} no está registrado.`
        );

      } else if (cantidadNecesaria > insumo.stock) {

        const faltante =
          cantidadNecesaria - insumo.stock;

        errores.push(
          `Stock insuficiente de ${insumo.nombre}. ` +
          `Faltan ${faltante} ${insumo.unidad}.`
        );

      }

    }
  );

  // comprobar los productos empacados y las recetas
  carrito.forEach(producto => {

    const empacado = empacados.find(
      item => item.productoId === producto.productoId
    );

    if (empacado) {

      if (producto.cantidad > empacado.stock) {

        errores.push(
          `Stock insuficiente de ${producto.nombre}. ` +
          `Solo hay ${empacado.stock} unidades.`
        );

      }

    } else {

      const tieneReceta = recetas.some(
        item => item.productoId === producto.productoId
      );

      if (!tieneReceta) {

        errores.push(
          `${producto.nombre} no tiene una receta registrada.`
        );

      }

    }

  });

  // devolver el resultado de la validacion
  return {
    valido: errores.length === 0,
    errores
  };

}


// obtener productos alternativos que se pueden agregar al pedido
export function obtenerAlternativas(
  producto,
  catalogo,
  carrito,
  insumos,
  recetas,
  empacados
) {

  // buscar productos activos de la misma categoria
  const candidatos = catalogo.filter(item =>

    item.id !== producto.id &&
    item.activo &&
    item.categoria === producto.categoria

  );

  // comprobar las existencias de cada alternativa
  const alternativas = candidatos.filter(item => {

    // comprobar si el producto ya esta en el pedido
    const existe = carrito.some(
      detalle => detalle.productoId === item.id
    );

    // simular que se agrega una unidad al pedido
    const nuevoCarrito = existe

      ? carrito.map(detalle =>
          detalle.productoId === item.id
            ? {
                ...detalle,
                cantidad: detalle.cantidad + 1
              }
            : detalle
        )

      : [
          ...carrito,
          {
            productoId: item.id,
            nombre: item.nombre,
            precio: item.precio,
            cantidad: 1
          }
        ];

    // validar las existencias del pedido simulado
    const resultado = validarCarrito(
      nuevoCarrito,
      insumos,
      recetas,
      empacados
    );

    return resultado.valido;

  });

  // mostrar como maximo tres alternativas
  return alternativas.slice(0, 3);

}


// descontar las existencias despues de confirmar una venta
export function descontarExistencias(
  carrito,
  insumos,
  recetas,
  empacados
) {

  // comprobar que existen suficientes productos e insumos
  const resultado = validarCarrito(
    carrito,
    insumos,
    recetas,
    empacados
  );

  if (!resultado.valido) {
    return {
      valido: false,
      errores: resultado.errores,
      insumos,
      empacados
    };
  }

  // calcular los ingredientes utilizados en la venta
  const consumo = calcularConsumoCarrito(
    carrito,
    recetas
  );

  // descontar los ingredientes utilizados
  const nuevosInsumos = insumos.map(insumo => ({

    ...insumo,

    stock: insumo.stock - (consumo[insumo.id] || 0)

  }));

  // descontar los productos empacados vendidos
  const nuevosEmpacados = empacados.map(empacado => {

    const cantidadVendida = carrito
      .filter(
        item => item.productoId === empacado.productoId
      )
      .reduce(
        (acumulado, item) => acumulado + item.cantidad,
        0
      );

    return {

      ...empacado,

      stock: empacado.stock - cantidadVendida

    };

  });

  // devolver las existencias actualizadas
  return {
    valido: true,
    errores: [],
    insumos: nuevosInsumos,
    empacados: nuevosEmpacados
  };

}

// comprobar que existe una caja abierta
export function validarCaja(caja) {

  if (!caja || caja.estado !== 'abierta') {

    return {
      valido: false,
      mensaje: 'Debes tener una caja abierta para realizar ventas.'
    };

  }

  return {
    valido: true,
    mensaje: ''
  };

}