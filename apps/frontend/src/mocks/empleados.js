// Datos ficticios: se conservan mientras la aplicación está abierta.
import { esDuiValido } from '../utils/validaciones.js';
// Empleados de ejemplo para probar los formularios y la apertura de caja.
export const empleadosMock = [
  { id: 1, nombre: 'Ana López', dui: '01234567-8', cargo: 'cajero', salarioMensual: 600, fechaIngreso: '2025-01-15', activo: true },
  { id: 2, nombre: 'Carlos Pérez', dui: '02345678-9', cargo: 'barista', salarioMensual: 550, fechaIngreso: '2025-03-01', activo: true },
  { id: 3, nombre: 'María Hernández', dui: '03456789-0', cargo: 'gerente', salarioMensual: 850, fechaIngreso: '2024-08-10', activo: true },
];
// Historial temporal de las planillas generadas durante la sesión.
export const planillasMock = [];
const copia = (obj) => structuredClone(obj);
const redondear = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const cargos = ['barista', 'cajero', 'gerente'];
let siguienteId = 4;
// Formatea una fecha local como AAAA-MM-DD sin convertirla a UTC.
export function fechaLocal(fecha = new Date()) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth()+1).padStart(2,'0')}-${String(fecha.getDate()).padStart(2,'0')}`;
}
// Comprueba los datos del empleado y evita DUI duplicados.
function validarEmpleado(e, id) {
  if (!e.nombre?.trim() || !esDuiValido(e.dui) || !cargos.includes(e.cargo) ||
      !Number.isFinite(e.salarioMensual) || e.salarioMensual <= 0 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(e.fechaIngreso) || e.fechaIngreso > fechaLocal() ||
      !Number.isFinite(Date.parse(e.fechaIngreso)) || new Date(e.fechaIngreso).toISOString().slice(0,10) !== e.fechaIngreso) {
    throw new Error('Revisa los datos del empleado.');
  }
  if (empleadosMock.some(item => item.id !== id && item.dui === e.dui)) throw new Error('El DUI ya está registrado.');
}
// Devuelve una copia del listado para proteger los datos originales.
export const listarEmpleadosMock = () => copia(empleadosMock);
// Registra un empleado activo con un ID nuevo después de validarlo.
export function crearEmpleadoMock(datos) {
  const e = { ...datos, activo: true, id: siguienteId };
  validarEmpleado(e);
  siguienteId++;
  empleadosMock.push(e);
  return copia(e);
}
// Combina los datos nuevos con el registro existente sin cambiar su ID.
export function actualizarEmpleadoMock(id, datos) {
  const i = empleadosMock.findIndex(e => e.id === Number(id));
  if (i < 0) throw new Error('Empleado no encontrado.');
  const e = { ...empleadosMock[i], ...datos, id: empleadosMock[i].id };
  validarEmpleado(e, e.id);
  empleadosMock[i] = e;
  return copia(e);
}
// Simulación académica de la tabla quincenal del Decreto Ejecutivo 10 (2025).
// No incluye ajustes fiscales especiales, recálculos ni otras remuneraciones.
export function rentaQuincenalMock(base) {
  if (base <= 275) return 0;
  if (base <= 447.62) return redondear((base - 275) * .10 + 8.83);
  if (base <= 1019.05) return redondear((base - 447.62) * .20 + 30);
  return redondear((base - 1019.05) * .30 + 144.28);
}
// Calcula salario quincenal, deducciones y líquido a pagar de forma simulada.
export function calcularDetalleMock(e) {
  const salarioQuincenal = redondear(e.salarioMensual / 2);
  const isss = redondear(Math.min(salarioQuincenal, 500) * .03);
  const afp = redondear(salarioQuincenal * .0725);
  // La base de renta simulada descuenta primero ISSS y AFP.
  const base = redondear(salarioQuincenal - isss - afp);
  const renta = rentaQuincenalMock(base);
  return { id: e.id, nombre: e.nombre, cargo: e.cargo, salarioQuincenal, isss, afp, renta, liquidoPagar: redondear(base - renta) };
}
// Genera una planilla académica para una quincena válida.
export function generarPlanillaMock({ anio, mes, quincena }) {
  if (!Number.isInteger(anio) || anio < 2020 || anio > 2100 || !Number.isInteger(mes) || mes < 1 || mes > 12 || ![1,2].includes(quincena)) throw new Error('Período inválido.');
  // Construye las fechas de inicio y fin según la quincena y el mes.
  const prefijo = `${anio}-${String(mes).padStart(2,'0')}`;
  const inicio = `${prefijo}-${quincena === 1 ? '01' : '16'}`;
  const fin = `${prefijo}-${quincena === 1 ? 15 : new Date(anio, mes, 0).getDate()}`;
  if (inicio > fechaLocal()) throw new Error('No se puede generar una planilla para una quincena futura.');
  if (inicio < '2025-05-16') throw new Error('La simulación utiliza la tabla de 2025; selecciona un período desde la segunda quincena de mayo de 2025.');
  // Identifica cada quincena y evita generar dos planillas del mismo período.
  const id = `${prefijo}-${quincena}`;
  if (planillasMock.some(p => p.id === id)) throw new Error('Ya existe una planilla para ese período. Consulta el historial.');
  // Selecciona empleados activos y rechaza ingresos a mitad de la quincena.
  const elegibles = empleadosMock.filter(e => e.activo && e.fechaIngreso <= fin);
  if (elegibles.some(e => e.fechaIngreso > inicio)) throw new Error('La simulación no contempla ingresos a mitad de quincena. Selecciona un período completo.');
  const empleados = elegibles.map(calcularDetalleMock);
  if (!empleados.length) throw new Error('No hay empleados activos para este período.');
  // Guarda el detalle calculado para que el historial conserve los montos originales.
  const planilla = { id, periodo: `${inicio} al ${fin}`, fechaGeneracion: new Date().toISOString(), empleados, totalLiquido: redondear(empleados.reduce((s,e) => s + e.liquidoPagar, 0)), simulada: true };
  planillasMock.unshift(planilla);
  return copia(planilla);
}
// El listado devuelve resúmenes; el detalle se consulta por ID.
export const listarPlanillasMock = () => copia(planillasMock.map(({ empleados, ...p }) => p));
export function obtenerPlanillaMock(id) {
  const planilla = planillasMock.find(p => p.id === String(id));
  if (!planilla) throw new Error('Planilla no encontrada.');
  return copia(planilla);
}
