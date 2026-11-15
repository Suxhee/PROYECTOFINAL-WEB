export default function Receipt({ sale }) {
  return <section aria-label="Recibo"><h2 className="h5">Recibo</h2><p>{sale?.number || 'Se genera al confirmar la venta.'}</p></section>;
}
