import {
  Alert,
  Badge,
  Button,
  Spinner,
  Table,
} from 'reactstrap';

import useAlertasStock from '../../hooks/useAlertasStock.js';
import AlertMessage from '../../components/ui/AlertMessage.jsx'

export default function AlertasStock() {
  //Obtiene las alertas y el estado de la consulta.
  const {
        alertas,
        totalInsumos,
        loading,
        error,
        recargar,
    } = useAlertasStock();

    // Cuenta los insumos que están completamente agotados.
    const agotados = alertas.filter(
        (item) => item.estado === 'agotado'
    ).length;

    // Cuenta los insumos que están por debajo de su mínimo.
    const stockBajo = alertas.filter(
        (item) => item.estado === 'bajo'
    ).length;

    return (
        <section>
            {/* Encabezado y botón para actualizar la información. */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div>
                    <h2 className="h5 mb-1">Alertas de stock</h2>
                    <p className="text-muted mb-0">
                        Insumos que necesitan reposición.
                    </p>
                </div>

                <Button
                    color="secondary"
                    outline
                    size="sm"
                    onClick={recargar}
                    disabled={loading}
                >
                    Actualizar
                </Button>
            </div>

            {/* Muestra los errores de consulta. */}
            {error && (
                <AlertMessage color="danger">
                    {error}
                </AlertMessage>
            )}

            {/* Indicadores generales de inventario. */}
            {!error && (
                <div className="row g-3 mb-4">
                    <div className="col-md-4">
                        <div className="card h-100">
                            <div className="card-body">
                                <p className="text-muted mb-1">
                                    Insumos registrados
                                </p>
                                <h3 className="mb-0">{totalInsumos}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card h-100">
                            <div className="card-body">
                                <p className="text-muted mb-1">
                                    Stock bajo
                                </p>
                                <h3 className="mb-0 text-warning">
                                    {stockBajo}
                                </h3>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card h-100">
                            <div className="card-body">
                                <p className="text-muted mb-1">
                                    Insumos agotados
                                </p>
                                <h3 className="mb-0 text-danger">
                                    {agotados}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Estado de carga mientras se consultan los insumos. */}
            {loading && (
                <div className="text-center py-4">
                    <Spinner />
                    <p className="text-muted mt-2">
                        Consultando existencias...
                    </p>
                </div>
            )}

            {/* Tabla de insumos que necesitan reposición. */}
            {!loading && !error && (
                alertas.length === 0 ? (
                    <Alert color="success">
                        No hay alertas. Todos los insumos tienen existencias
                        superiores a su cantidad mínima.
                    </Alert>
                ) : (
                    <div className="card">
                        <div className="card-body">
                            <h3 className="h6 mb-3">
                                Insumos que necesitan atención
                            </h3>

                            <div className="table-responsive">
                                <Table striped hover responsive>
                                    <thead>
                                        <tr>
                                            <th>Insumo</th>
                                            <th>Existencia</th>
                                            <th>Stock mínimo</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {alertas.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.name}</td>
                                                <td>
                                                    {item.quantity} {item.unit}
                                                </td>
                                                <td>
                                                    {item.minimumQuantity} {item.unit}
                                                </td>
                                                <td>
                                                    {item.estado === 'agotado' ? (
                                                        <Badge color="danger">
                                                            Agotado
                                                        </Badge>
                                                    ) : (
                                                        <Badge color="warning">
                                                            Stock bajo
                                                        </Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </div>
                )
            )}
        </section>
    );
}