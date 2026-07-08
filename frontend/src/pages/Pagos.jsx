import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

function getErrorMessage(error, fallback) {
    return error.response?.data?.error ?? fallback;
}

export default function PagosYCierres() {
    const navigate = useNavigate();
    const { rol } = useAuth();

    const isAdmin = rol === "ADMINISTRATIVO";
    const isSupervisor = rol === "SUPERVISOR";

    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [pagoForm, setPagoForm] = useState({
        id_servicio: "",
        monto: ""
    });

    const [cierreForm, setCierreForm] = useState({
        id_servicio: "",
        observaciones: "",
        conformidad_cliente: false,
        validacion_cumplimiento: false
    });

    async function cargarDatos() {
        setLoading(true);
        setError("");
        try {
            const response = await api.get("/servicios");
            setServicios(response.data);
        } catch (err) {
            setError(getErrorMessage(err, "No se pudieron cargar los servicios."));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        cargarDatos();
    }, []);

    const handlePagoSubmit = async (event) => {
        event.preventDefault();
        if (!pagoForm.id_servicio) return setError("Debe seleccionar un servicio.");

        setSaving(true);
        setError("");
        setMessage("");

        try {
            await api.post(`/servicios/${pagoForm.id_servicio}/pago`, {
                monto: Number(pagoForm.monto)
            });
            setMessage("Pago registrado exitosamente. Comprobante digital generado.");
            setPagoForm({ id_servicio: "", monto: "" });
            await cargarDatos(); 
        } catch (err) {
            setError(getErrorMessage(err, "Error al procesar el pago."));
        } finally {
            setSaving(false);
        }
    };

    const handleCierreSubmit = async (event) => {
        event.preventDefault();
        if (!cierreForm.id_servicio) return setError("Debe seleccionar un servicio a cerrar.");

        setSaving(true);
        setError("");
        setMessage("");

        try {
            await api.post(`/servicios/${cierreForm.id_servicio}/cerrar`, {
                observaciones: cierreForm.observaciones,
                conformidad_cliente: cierreForm.conformidad_cliente,
                validacion_cumplimiento: cierreForm.validacion_cumplimiento
            });
            setMessage("Servicio validado y cerrado definitivamente.");
            setCierreForm({
                id_servicio: "",
                observaciones: "",
                conformidad_cliente: false,
                validacion_cumplimiento: false
            });
            await cargarDatos(); 
        } catch (err) {
            setError(getErrorMessage(err, "No se puede cerrar el servicio. Verifique pagos e incidencias."));
        } finally {
            setSaving(false);
        }
    };

    const serviciosParaPago = servicios.filter(s => 
        s.estado !== "CERRADO" && (!s.pago || s.pago.estado !== "PAGADO")
    );

    const serviciosParaCierre = servicios.filter(s => {
        const estaPagado = s.pago?.estado === "PAGADO";
        const sinIncidenciasAbiertas = !s.incidencias || s.incidencias.every(i => i.estado === "RESUELTA");
        const noEstaCerrado = s.estado !== "CERRADO";
        
        return estaPagado && sinIncidenciasAbiertas && noEstaCerrado;
    });

    return (
        <div className="container mt-5 mb-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h1 className="mb-1">Gestión de Cierres y Pagos</h1>
                    <p className="text-muted mb-0">Auditoría, validación de calidad y recaudación de servicios.</p>
                </div>
                <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/")}>
                    Volver al dashboard
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            <div className="row">
                {/* PANEL ADMINISTRATIVO */}
                {isAdmin && (
                    <div className="col-12 mb-4">
                        <div className="card shadow border-primary">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0">Módulo Administrativo: Registrar Pago</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handlePagoSubmit}>
                                    <div className="row g-3">
                                        <div className="col-md-8">
                                            <label className="form-label">Servicio Pendiente de Pago</label>
                                            <select
                                                className="form-select"
                                                value={pagoForm.id_servicio}
                                                onChange={(e) => setPagoForm({...pagoForm, id_servicio: e.target.value})}
                                                required
                                            >
                                                <option value="">Seleccione un servicio...</option>
                                                {serviciosParaPago.map(s => (
                                                    <option key={s.id_servicio} value={s.id_servicio}>
                                                        #{s.id_servicio} - {s.nombre_servicio} ({s.cliente?.razon_social})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Monto ($)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={pagoForm.monto}
                                                onChange={(e) => setPagoForm({...pagoForm, monto: e.target.value})}
                                                min="1"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary mt-3" disabled={saving}>
                                        {saving ? "Procesando..." : "Registrar Comprobante"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* PANEL SUPERVISOR */}
                {isSupervisor && (
                    <div className="col-12 mb-4">
                        <div className="card shadow border-success">
                            <div className="card-header bg-success text-white">
                                <h5 className="mb-0">Módulo Supervisor: Validación y Cierre Operativo</h5>
                            </div>
                            <div className="card-body">
                                <div className="alert alert-info py-2">
                                    Solo se muestran servicios que ya cuentan con el <strong>pago registrado</strong> y no tienen incidencias abiertas.
                                </div>
                                <form onSubmit={handleCierreSubmit}>
                                    <div className="row g-3">
                                        <div className="col-md-12">
                                            <label className="form-label fw-bold">Servicio a Validar</label>
                                            <select
                                                className="form-select"
                                                value={cierreForm.id_servicio}
                                                onChange={(e) => setCierreForm({...cierreForm, id_servicio: e.target.value})}
                                                required
                                            >
                                                <option value="">Seleccione un servicio validado administrativamente...</option>
                                                {serviciosParaCierre.map(s => (
                                                    <option key={s.id_servicio} value={s.id_servicio}>
                                                        #{s.id_servicio} - {s.nombre_servicio} (Pago: ${s.pago?.monto})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Observaciones Finales (Obligatorio)</label>
                                            <textarea
                                                className="form-control"
                                                rows="2"
                                                value={cierreForm.observaciones}
                                                onChange={(e) => setCierreForm({...cierreForm, observaciones: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-check form-switch mt-2">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={cierreForm.conformidad_cliente}
                                                    onChange={(e) => setCierreForm({...cierreForm, conformidad_cliente: e.target.checked})}
                                                    required
                                                />
                                                <label className="form-check-label text-danger fw-semibold">
                                                    Conformidad del cliente firmada
                                                </label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-check form-switch mt-2">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={cierreForm.validacion_cumplimiento}
                                                    onChange={(e) => setCierreForm({...cierreForm, validacion_cumplimiento: e.target.checked})}
                                                    required
                                                />
                                                <label className="form-check-label text-danger fw-semibold">
                                                    Validación de cumplimiento completada
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-success mt-4" disabled={saving}>
                                        {saving ? "Cerrando..." : "Cerrar Servicio Definitivamente"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* TABLA DE AUDITORÍA CONSOLIDADA */}
            <div className="card shadow">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="card-title mb-0">Seguimiento Histórico y Auditoría</h4>
                        <button className="btn btn-sm btn-outline-secondary" onClick={cargarDatos}>Actualizar Lista</button>
                    </div>
                    {loading ? (
                        <div className="text-center py-4">Cargando registros...</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-striped align-middle">
                                <thead className="table-dark">
                                    <tr>
                                        <th>ID</th>
                                        <th>Servicio</th>
                                        <th>Estado General</th>
                                        <th>Estado Pago</th>
                                        <th>Incidencias</th>
                                        <th>Comprobante Digital</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {servicios.map(s => {
                                        const totalIncidencias = s.incidencias?.length || 0;
                                        const abiertas = s.incidencias?.filter(i => i.estado !== "RESUELTA").length || 0;
                                        
                                        return (
                                            <tr key={s.id_servicio}>
                                                <td><strong>#{s.id_servicio}</strong></td>
                                                <td>{s.nombre_servicio}</td>
                                                <td>
                                                    <span className={`badge ${s.estado === "CERRADO" ? "bg-success" : "bg-warning text-dark"}`}>
                                                        {s.estado}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${s.pago?.estado === "PAGADO" ? "bg-primary" : "bg-danger"}`}>
                                                        {s.pago?.estado === "PAGADO" ? "PAGADO" : "PENDIENTE"}
                                                    </span>
                                                </td>
                                                <td>
                                                    {totalIncidencias === 0 ? (
                                                        <span className="text-muted">Ninguna</span>
                                                    ) : abiertas > 0 ? (
                                                        <span className="text-danger fw-bold">{abiertas} Abiertas</span>
                                                    ) : (
                                                        <span className="text-success">Resueltas</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {s.pago?.comprobante ? <code>{s.pago.comprobante}</code> : <span className="text-muted">-</span>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}