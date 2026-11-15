import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
export default function PaymentModal({ isOpen = false, onCancel = () => {} }) {
  return <Modal isOpen={isOpen} toggle={onCancel} centered><ModalHeader toggle={onCancel}>Registrar pago</ModalHeader><ModalBody>La integración de pagos se habilitará en una etapa posterior.</ModalBody><ModalFooter><Button color="secondary" onClick={onCancel}>Cerrar</Button></ModalFooter></Modal>;
}
