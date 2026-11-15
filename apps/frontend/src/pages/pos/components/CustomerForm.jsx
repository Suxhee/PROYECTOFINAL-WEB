import { FormGroup, Input, Label } from 'reactstrap';
export default function CustomerForm() {
  return <FormGroup><Label for="customer-name">Cliente (opcional)</Label><Input id="customer-name" autoComplete="name" /></FormGroup>;
}
