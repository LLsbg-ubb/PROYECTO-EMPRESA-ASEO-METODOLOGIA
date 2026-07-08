import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios.js";
import Semaforo from "../components/Semaforo.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const initialForm = {
    id_servicio: "",
    id_trabajador: "",
    porcentaje_avance: 0,
    observaciones: ""
};

function getErrorMessage(error, fallback) {
    return error.response?.data?.error ?? error.response?.data?.message ?? fallback;
}

function getNombreUsuario(usuario) {
    if (!usuario) {
        return "Sin usuario";
    }

    return [usuario.nombres, usuario.apellido_paterno, usuario.apellido_materno]
        .filter(Boolean)
        .join(" ");
}

function getNombreTrabajador(trabajador) {
    if (!trabajador) {
        return "Sin trabajador";
    }

    return getNombreUsuario(trabajador.usuario) || `Trabajador #${trabajador.id_trabajador}`;
}

function formatDate(date) {
    if (!date) {
        return "Sin fecha";
    }

    return new Date(date).toLocaleString("es-CL");
}

export default function Reportes() {
    const navigate = useNavigate();
    const { usuario, rol } = useAuth();

    const [servicios, setServicios] = useState([]);
    const [reportes, setReportes] = useState([]);
    const [trabajadores, setTrabajadores] = useState([]);
    const [estadosOperativos, setEstadosOperativos] = useState({});
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const puedeCrear = rol === "SUPERVISOR" || rol === "TRABAJADOR";
    const puedeEditar = rol === "SUPERVISOR";
    const puedeEliminar = rol === "ADMINISTRATIVO";

    const trabajadorSesion = useMemo(() => {
        return trabajadores.find(
            (trabajador) => Number(trabajador.usuario?.id_usuario) === Number(usuario?.id_usuario)
        );
    }, [trabajadores, usuario]);

    const serviciosActivos = useMemo(() => {
        return servicios.filter((servicio) =>
            ["ASIGNADO", "EN_PROCESO", "PENDIENTE"].includes(servicio.estado)
        );
    }, [servicios]);

    const conteoSemaforo = useMemo(() => {
        return servicios.reduce(
            (conteo, servicio) => {
                const color = estadosOperativos[servicio.id_servicio]?.semaforo ?? servicio.semaforo ?? "VERDE";
                conteo[color] = (conteo[color] ?? 0) + 1;
                return conteo;
            },
            { VERDE: 0, AMARILLO: 0, ROJO: 0 }
        );
    }, [estadosOperativos, servicios]);

    async function cargarDatos() {
        setLoading(true);
        setError("");

        try {
            const [serviciosResponse, reportesResponse, trabajadoresResponse] = await Promise.all([
                api.get("/servicios"),
                api.get("/reportes"),
                api.get("/trabajadores")
            ]);

            setServicios(serviciosResponse.data);
            setReportes(reportesResponse.data);
            setTrabajadores(trabajadoresResponse.data);

            const estados = {};

            await Promise.all(
                serviciosResponse.data.map(async (servicio) => {
                    try {
                        const response = await api.get(`/semaforo/${servicio.id_servicio}`);
                        estados[servicio.id_servicio] = response.data;
                    }
                    catch {
                        estados[servicio.id_servicio] = {
                            semaforo: servicio.semaforo ?? "VERDE",
                            avance_esperado: 0,
                            avance_reportado: 0
                        };
                    }
                })
            );

            setEstadosOperativos(estados);
        }
        catch (err) {
            setError(getErrorMessage(err, "No fue posible cargar el modulo de reportes."));
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        if (rol === "TRABAJADOR" && trabajadorSesion && !editingId) {
            setForm((current) => ({
                ...current,
                id_trabajador: String(trabajadorSesion.id_trabajador)
            }));
        }
    }, [editingId, rol, trabajadorSesion]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value
        }));
    };

    const resetForm = () => {
        setForm({
            ...initialForm,
            id_trabajador: rol === "TRABAJADOR" && trabajadorSesion
                ? String(trabajadorSesion.id_trabajador)
                : ""
        });
        setEditingId(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        const payload = {
            id_servicio: Number(form.id_servicio),
            id_trabajador: Number(form.id_trabajador),
            porcentaje_avance: Number(form.porcentaje_avance),
            observaciones: form.observaciones
        };

        try {
            if (editingId) {
                await api.put(`/reportes/${editingId}`, {
                    porcentaje_avance: payload.porcentaje_avance,
                    observaciones: payload.observaciones
                });
                setMessage("Reporte actualizado correctamente.");
            }
            else {
                await api.post("/reportes", payload);
                setMessage("Reporte de terreno registrado correctamente.");
            }

            resetForm();
            await cargarDatos();
        }
        catch (err) {
            setError(getErrorMessage(err, "No fue posible guardar el reporte."));
        }
        finally {
            setSaving(false);
        }
    };

    const editarReporte = (reporte) => {
        setEditingId(reporte.id_reporte);
        setForm({
            id_servicio: String(reporte.servicio?.id_servicio ?? ""),
            id_trabajador: String(reporte.trabajador?.id_trabajador ?? ""),
            porcentaje_avance: reporte.porcentaje_avance ?? 0,
            observaciones: reporte.observaciones ?? ""
        });
        setMessage("");
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const eliminarReporte = async (idReporte) => {
        if (!window.confirm("Desea eliminar este reporte?")) {
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");

        try {
            await api.delete(`/reportes/${idReporte}`);
            setMessage("Reporte eliminado correctamente.");
            await cargarDatos();
        }
        catch (err) {
            setError(getErrorMessage(err, "No fue posible eliminar el reporte."));
        }
        finally {
            setSaving(false);
        }
    };

    return (
        <div className="container mt-5 mb-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h1 className="mb-1">Reportes</h1>
                    <p className="text-muted mb-0">
                        Seguimiento operativo, avance de terreno y estado del servicio.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/")}
                >
                    Volver al dashboard
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card shadow h-100">
                        <div className="card-body">
                            <h5 className="card-title">Servicios activos</h5>
                            <p className="display-6 mb-0">{serviciosActivos.length}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card shadow h-100">
                        <div className="card-body">
                            <h5 className="card-title">Verde</h5>
                            <p className="display-6 mb-0 text-success">{conteoSemaforo.VERDE ?? 0}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card shadow h-100">
                        <div className="card-body">
                            <h5 className="card-title">Amarillo</h5>
                            <p className="display-6 mb-0 text-warning">{conteoSemaforo.AMARILLO ?? 0}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card shadow h-100">
                        <div className="card-body">
                            <h5 className="card-title">Rojo</h5>
                            <p className="display-6 mb-0 text-danger">{conteoSemaforo.ROJO ?? 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow mb-4">
                <div className="card-body">
                    <h4 className="card-title mb-3">
                        {editingId ? "Editar reporte" : "Nuevo reporte de terreno"}
                    </h4>

                    {!puedeCrear && !editingId && (
                        <div className="alert alert-info mb-0">
                            Su rol permite consultar reportes. Para registrar avance se requiere rol Supervisor o Trabajador.
                        </div>
                    )}

                    {(puedeCrear || editingId) && (
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Servicio</label>
                                    <select
                                        className="form-select"
                                        name="id_servicio"
                                        value={form.id_servicio}
                                        onChange={handleChange}
                                        disabled={!!editingId}
                                        required
                                    >
                                        <option value="">Seleccione servicio</option>
                                        {servicios.map((servicio) => (
                                            <option key={servicio.id_servicio} value={servicio.id_servicio}>
                                                #{servicio.id_servicio} - {servicio.nombre_servicio}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Trabajador</label>
                                    <select
                                        className="form-select"
                                        name="id_trabajador"
                                        value={form.id_trabajador}
                                        onChange={handleChange}
                                        disabled={!!editingId || rol === "TRABAJADOR"}
                                        required
                                    >
                                        <option value="">Seleccione trabajador</option>
                                        {trabajadores.map((trabajador) => (
                                            <option key={trabajador.id_trabajador} value={trabajador.id_trabajador}>
                                                {getNombreTrabajador(trabajador)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">Porcentaje de avance</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        className="form-control"
                                        name="porcentaje_avance"
                                        value={form.porcentaje_avance}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-8">
                                    <label className="form-label">Observaciones</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="observaciones"
                                        value={form.observaciones}
                                        onChange={handleChange}
                                        placeholder="Detalle breve del avance en terreno"
                                    />
                                </div>
                            </div>

                            <div className="d-flex gap-2 mt-4">
                                <button className="btn btn-primary" disabled={saving}>
                                    {saving ? "Guardando..." : "Guardar reporte"}
                                </button>

                                {editingId && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={resetForm}
                                        disabled={saving}
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <div className="card shadow mb-4">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="card-title mb-0">Estado operativo de servicios</h4>
                        <button className="btn btn-outline-primary btn-sm" onClick={cargarDatos} disabled={loading}>
                            Actualizar
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-4">Cargando seguimiento operativo...</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-striped table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th>Servicio</th>
                                        <th>Estado</th>
                                        <th>Semaforo</th>
                                        <th>Avance esperado</th>
                                        <th>Avance reportado</th>
                                        <th>Incidencias abiertas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {servicios.map((servicio) => {
                                        const estadoOperativo = estadosOperativos[servicio.id_servicio];
                                        const incidenciasAbiertas = (servicio.incidencias ?? []).filter(
                                            (incidencia) => incidencia.estado === "ABIERTA"
                                        ).length;

                                        return (
                                            <tr key={servicio.id_servicio}>
                                                <td>{servicio.nombre_servicio}</td>
                                                <td>{servicio.estado}</td>
                                                <td>
                                                    <Semaforo estadoSemaforo={estadoOperativo?.semaforo ?? servicio.semaforo} />
                                                </td>
                                                <td>{Math.round(estadoOperativo?.avance_esperado ?? 0)}%</td>
                                                <td>{estadoOperativo?.avance_reportado ?? 0}%</td>
                                                <td>{incidenciasAbiertas}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <div className="card shadow">
                <div className="card-body">
                    <h4 className="card-title mb-3">Reportes registrados</h4>

                    {reportes.length === 0 ? (
                        <div className="alert alert-info mb-0">No hay reportes registrados.</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-striped table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Servicio</th>
                                        <th>Trabajador</th>
                                        <th>Avance</th>
                                        <th>Fecha</th>
                                        <th>Observaciones</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportes.map((reporte) => (
                                        <tr key={reporte.id_reporte}>
                                            <td>{reporte.id_reporte}</td>
                                            <td>{reporte.servicio?.nombre_servicio ?? "Sin servicio"}</td>
                                            <td>{getNombreTrabajador(reporte.trabajador)}</td>
                                            <td>{reporte.porcentaje_avance ?? 0}%</td>
                                            <td>{formatDate(reporte.fecha_reporte)}</td>
                                            <td>{reporte.observaciones || "Sin observaciones"}</td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    {puedeEditar && (
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => editarReporte(reporte)}
                                                            disabled={saving}
                                                        >
                                                            Editar
                                                        </button>
                                                    )}

                                                    {puedeEliminar && (
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => eliminarReporte(reporte.id_reporte)}
                                                            disabled={saving}
                                                        >
                                                            Eliminar
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
