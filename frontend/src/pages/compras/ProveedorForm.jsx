import FormField from '../../components/ui/FormField.jsx';
export default function ProveedorForm() { return <form><FormField id="supplier-name" label="Nombre del proveedor" required /><FormField id="supplier-email" label="Correo" type="email" /></form>; }
