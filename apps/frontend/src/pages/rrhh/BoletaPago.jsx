// Comprobante de pago: presenta los datos de un empleado y el período de su planilla.

const moneda = (valor) =>
  new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(valor || 0));

export default function BoletaPago({
  empleado,
  periodo,
  fechaGeneracion,
  onCerrar,
  simulada,
}) {
  if (!empleado) return null;

  // Lee los importes ya calculados por la API para mostrarlos en la boleta.
  const salario = Number(
    empleado.salarioQuincenal ?? empleado.salario ?? 0
  );
  const isss = Number(empleado.isss ?? 0);
  const afp = Number(empleado.afp ?? 0);
  const renta = Number(empleado.renta ?? 0);
  const liquido = Number(
    empleado.liquidoPagar ?? empleado.liquido ?? salario - isss - afp - renta
  );

  return (
    <div className="card mt-3 boleta-printable">
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            .boleta-printable, .boleta-printable * { visibility: visible; }
            .boleta-printable {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              border: 0 !important;
              box-shadow: none !important;
            }
          }
        `}
      </style>

      <div className="card-header d-flex justify-content-between align-items-center">
        <strong>Boleta de pago</strong>
        <div className="d-print-none d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary" onClick={onCerrar}>
            Cerrar
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => window.print()}
          >
            Imprimir
          </button>
        </div>
      </div>

      <div className="card-body">
        <h5>Orígenes SV</h5>
        {simulada && <p className="fw-bold">SIMULACIÓN ACADÉMICA — NO VÁLIDA PARA PAGOS</p>}
        <p className="mb-1">
          <strong>Empleado:</strong> {empleado.nombre}
        </p>
        <p className="mb-1">
          <strong>Período:</strong> {periodo || "No especificado"}
        </p>
        <p className="mb-3">
          <strong>Generada:</strong>{" "}
          {fechaGeneracion
            ? new Date(fechaGeneracion).toLocaleDateString("es-SV")
            : "No especificada"}
        </p>

        <table className="table table-bordered">
          <tbody>
            <tr>
              <th>Salario quincenal</th>
              <td>{moneda(salario)}</td>
            </tr>
            <tr>
              <th>ISSS</th>
              <td>{moneda(isss)}</td>
            </tr>
            <tr>
              <th>AFP</th>
              <td>{moneda(afp)}</td>
            </tr>
            <tr>
              <th>Renta</th>
              <td>{moneda(renta)}</td>
            </tr>
            <tr>
              <th>Líquido a pagar</th>
              <td>
                <strong>{moneda(liquido)}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
