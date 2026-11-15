import { Alert } from 'reactstrap';
export default function AlertMessage({ color = 'info', children }) {
  return <Alert color={color} role={color === 'danger' ? 'alert' : 'status'}>{children}</Alert>;
}
