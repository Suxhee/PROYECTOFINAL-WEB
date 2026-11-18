import { FormGroup, Input, Label } from 'reactstrap';
export default function FormField({ id, label, type = 'text', ...props }) {
  return <FormGroup><Label for={id}>{label}</Label><Input id={id} type={type} {...props} /></FormGroup>;
}
