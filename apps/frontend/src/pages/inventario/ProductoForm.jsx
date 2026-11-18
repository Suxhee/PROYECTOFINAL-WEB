import FormField from '../../components/ui/FormField.jsx';
export default function ProductoForm() { return <form><FormField id="product-name" label="Nombre del producto" required /><FormField id="product-price" label="Precio" type="number" min="0" step="0.01" required /></form>; }
