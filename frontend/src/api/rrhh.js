import { get, post } from './client.js';
export const listarEmpleados = () => get('/payroll/employees');
export const crearEmpleado = (empleado) => post('/payroll/employees', empleado);
