import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
export default function ConfirmModal({ isOpen, title = 'Confirmar', children, onCancel, onConfirm }) {
  return <Modal isOpen={isOpen} toggle={onCancel} centered>
    <ModalHeader toggle={onCancel}>{title}</ModalHeader>
    <ModalBody>{children}</ModalBody>
    <ModalFooter><Button color="secondary" onClick={onCancel}>Cancelar</Button><Button color="primary" onClick={onConfirm}>Aceptar</Button></ModalFooter>
  </Modal>;
}
