import FormField from '../../components/ui/FormField.jsx';
export default function FacturaCompra() { return <form><FormField id="invoice-number" label="Número de factura" required /><FormField id="invoice-total" label="Total" type="number" min="0" step="0.01" required /></form>; }
