
import { useState } from 'react';
import { Input, Button } from 'reactstrap';
import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ productos = [], onAgregar }) {

  // estados del buscador y las categorias
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todos');

  const categorias = [
    'Todos',
    'Cafés',
    'Bebidas frías',
    'Alimentos',
    'Postres',
    'Empacados'
  ];

  // quitar tildes y mayusculas para facilitar la busqueda
  const normalizarTexto = (texto) => {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  };

  // filtrar productos por nombre y categoria
  const productosFiltrados = productos.filter((producto) => {

    const coincideCategoria =
      categoria === 'Todos' ||
      producto.categoria === categoria;

    const coincideBusqueda = normalizarTexto(producto.nombre)
      .includes(normalizarTexto(busqueda));

    return producto.activo &&
      coincideCategoria &&
      coincideBusqueda;
  });

  // limpiar los filtros
  const limpiarFiltros = () => {
    setBusqueda('');
    setCategoria('Todos');
  };

  return (
    <section className="pos-catalog">

      {/* encabezado y buscador */}
      <div className="pos-catalog-header">

        <div className="pos-catalog-title">
          <h2>Nuestro menú</h2>
          <p>Selecciona los productos del pedido</p>
        </div>

        <div className="pos-search-container">

          <svg
            className="pos-search-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M16 16L21 21" />
          </svg>

          <Input
            type="text"
            className="pos-search"
            placeholder="Buscar producto..."
            aria-label="Buscar productos"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          {/* limpiar el texto del buscador */}
          {busqueda && (
            <button
              type="button"
              className="pos-search-clear"
              aria-label="Limpiar busqueda"
              onClick={() => setBusqueda('')}
            >
              ×
            </button>
          )}

        </div>

      </div>

      {/* filtros por categoria */}
      <div className="pos-categories">

        {categorias.map((item) => (
          <Button
            key={item}
            type="button"
            className={`pos-category ${categoria === item ? 'active' : ''}`}
            aria-pressed={categoria === item}
            onClick={() => setCategoria(item)}
          >
            {item}
          </Button>
        ))}

      </div>

      {/* mostrar las tarjetas de los productos filtrados */}
      {productosFiltrados.length > 0 ? (

        <div className="pos-product-grid">

          {productosFiltrados.map((producto) => (
            <ProductCard
              key={producto.id}
              producto={producto}
              onAgregar={onAgregar}
            />
          ))}

        </div>

      ) : (

        /* mensaje cuando no hay coincidencias */
        <div className="pos-empty">

          <h3>No encontramos productos</h3>

          <p>Prueba otra búsqueda o categoría.</p>

          <Button
            type="button"
            className="pos-reset-button"
            onClick={limpiarFiltros}
          >
            Ver todos los productos
          </Button>

        </div>

      )}

    </section>
  );
}
