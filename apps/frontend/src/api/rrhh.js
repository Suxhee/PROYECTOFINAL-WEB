// Servicio de RRHH: concentra las peticiones de empleados y planillas.

import { get, post, put } from './client.js';
import { seleccionarApi } from './mode.js';
import { listarEmpleadosMock, crearEmpleadoMock, actualizarEmpleadoMock, generarPlanillaMock, listarPlanillasMock, obtenerPlanillaMock } from '../mocks/empleados.js';
// Gestión de empleados: seleccionarApi recibe la función HTTP y su equivalente mock.
export const obtenerEmpleados = seleccionarApi(() => get('/payroll/employees'), listarEmpleadosMock);
export const crearEmpleado = seleccionarApi(datos => post('/payroll/employees', datos), crearEmpleadoMock);
// Codifica el ID para insertarlo de forma segura en la ruta.
export const actualizarEmpleado = seleccionarApi((id, datos) => put(`/payroll/employees/${encodeURIComponent(id)}`, datos), actualizarEmpleadoMock);
// Baja lógica: desactiva al empleado sin eliminar su registro.
export const darBajaEmpleado = id => actualizarEmpleado(id, { activo: false });
// Genera una planilla para el período seleccionado (año, mes y quincena).
export const generarPlanilla = seleccionarApi(datos => post('/payroll/periods', datos), generarPlanillaMock);
// Consulta el historial y, por ID, el detalle de una planilla.
export const obtenerPlanillas = seleccionarApi(() => get('/payroll/periods'), listarPlanillasMock);
export const obtenerPlanilla = seleccionarApi(id => get(`/payroll/periods/${encodeURIComponent(id)}`), obtenerPlanillaMock);

// Alias compatible con la API inicial de develop.
export const listarEmpleados = obtenerEmpleados;
