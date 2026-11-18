import { FormGroup, Input, Label } from 'reactstrap';
export default function DocumentTypeSelector() {
  return <FormGroup><Label for="document-type">Tipo de documento</Label><Input id="document-type" type="select" defaultValue="ticket"><option value="ticket">Ticket</option><option value="factura">Factura</option></Input></FormGroup>;
}
