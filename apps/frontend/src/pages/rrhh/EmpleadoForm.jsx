import FormField from '../../components/ui/FormField.jsx';
export default function EmpleadoForm() { return <form><FormField id="employee-name" label="Nombre completo" autoComplete="name" required /><FormField id="employee-dui" label="DUI" placeholder="00000000-0" required /></form>; }
