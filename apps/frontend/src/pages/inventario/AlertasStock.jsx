import useAlertasStock from '../../hooks/useAlertasStock.js';
import AlertMessage from '../../components/ui/AlertMessage.jsx';
export default function AlertasStock() {
  const { alertas, error } = useAlertasStock();
  return <section><h2 className="h5">Alertas de stock</h2>{error && <AlertMessage color="danger">{error}</AlertMessage>}{alertas.length ? <ul>{alertas.map((item) => <li key={item.id}>{item.nombre}: {item.stock} {item.unidad}</li>)}</ul> : !error && <p>No hay alertas de stock.</p>}</section>;
}
