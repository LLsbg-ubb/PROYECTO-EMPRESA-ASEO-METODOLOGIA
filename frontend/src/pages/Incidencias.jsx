import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const prioridades = ["BAJA", "MEDIA", "ALTA", "CRITICA"];

const initialForm = {
    id_servicio: "",
    reportada_por: "",
    tipo: "",
    descripcion: "",
    prioridad: "MEDIA",
    id_recurso: "",
    cantidad_requerida: 1,
    observacion: ""
};

function getNombreUsuario(usuario) {
    if (!usuario) {
        return "Sin usuario";
    }

    return [usuario.nombres, usuario.apellido_paterno, usuario.apellido_materno]
        .filter(Boolean)
        .join(" ");
}

function getErrorMessage(error, fallback) {
    return error.response?.data?.error ?? fallback;
}

export default function Incidencias() {
    const navigate = useNavigate();
    const { usuario, rol } = useAuth();

    const [incidencias, setIncidencias] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [recursos, setRecursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [closingId, setClosingId] = useState(null);
    const [form, setForm] = useState(() => ({
        ...initialForm,
        reportada_por: usuario?.id_usuario ? String(usuario.id_usuario) : ""
    }));
    const [solucion, setSolucion] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const puedeCrear = rol === "SUPERVISOR";
    const puedeEditar = rol === "SUPERVISOR";
    const puedeEliminar = rol === "ADMINISTRATIVO";

    const incidenciasAbiertas = useMemo(
        () => incidencias.filter((incidencia) => incidencia.estado === "ABIERTA").length,
        [incidencias]
    );

    const incidenciasResueltas = incidencias.length - incidenciasAbiertas;

    async function cargarDatos() {
        setLoading(true);
        setError("");

        try {
            const [incidenciasResponse, serviciosResponse, recursosResponse] = await Promise.all([
                api.get("/incidencias"),
                api.get("/servicios"),
                api.get("/recursos")
            ]);

            setIncidencias(incidenciasResponse.data);
            setServicios(serviciosResponse.data);
            setRecursos(recursosResponse.data);
        }
        catch (err) {
            setError(getErrorMessage(err, "No fue posible cargar el modulo de incidencias."));
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            cargarDatos();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((currentForm) => ({
            ...currentForm,
            [name]: value
        }));
    };

    const resetForm = () => {
        setForm({
            ...initialForm,
            reportada_por: usuario?.id_usuario ? String(usuario.id_usuario) : ""
        });
        setEditingId(null);
    };

    const buildPayload = () => {
        const recursosRequeridos = form.id_recurso
            ? [
                {
                    id_recurso: Number(form.id_recurso),
                    cantidad_requerida: Number(form.cantidad_requerida),
                    observacion: form.observacion.trim()
                }
            ]
            : [];

        const payload = {
            tipo: form.tipo,
            descripcion: form.descripcion,
            prioridad: form.prioridad,
            recursos_requeridos: recursosRequeridos
        };

        if (!editingId) {
            payload.id_servicio = Number(form.id_servicio);
            payload.reportada_por = Number(form.reportada_por || usuario?.id_usuario);
        }

        return payload;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        try {
            if (editingId) {
                await api.put(`/incidencias/${editingId}`, buildPayload());
                setMessage("Incidencia actualizada correctamente.");
            }
            else {
                await api.post("/incidencias", buildPayload());
                setMessage("Incidencia registrada correctamente.");
            }

            resetForm();
            await cargarDatos();
        }
        catch (err) {
            setError(getErrorMessage(err, "No fue posible guardar la incidencia."));
        }
        finally {
            setSaving(false);
        }
    };

    const editarIncidencia = (incidencia) => {
        const recursoIncidencia = incidencia.recursosRequeridos?.[0];

        setEditingId(incidencia.id_incidencia);
        setForm({
            id_servicio: incidencia.servicio?.id_servicio ? String(incidencia.servicio.id_servicio) : "",
            reportada_por: incidencia.reportadaPor?.id_usuario ? String(incidencia.reportadaPor.id_usuario) : "",
            tipo: incidencia.tipo,
            descripcion: incidencia.descripcion,
            prioridad: incidencia.prioridad,
            id_recurso: recursoIncidencia?.recurso?.id_recurso ? String(recursoIncidencia.recurso.id_recurso) : "",
            cantidad_requerida: recursoIncidencia?.cantidad_requerida ?? 1,
            observacion: recursoIncidencia?.observacion ?? ""
        });
        setMessage("");
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const cerrarIncidencia = async (idIncidencia) => {
        setSaving(true);
        setError("");
        setMessage("");

        try {
            await api.put(`/incidencias/${idIncidencia}/cerrar`, {
                solucion
            });

            setClosingId(null);
            setSolucion("");
            setMessage("Incidencia cerrada correctamente.");
            await cargarDatos();
        }
        catch (err) {
            setError(getErrorMessage(err, "No fue posible cerrar la incidencia."));
        }
        finally {
            setSaving(false);
        }
    };

    const eliminarIncidencia = async (idIncidencia) => {
        const confirmar = window.confirm("Desea eliminar esta incidencia?");

        if (!confirmar) {
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");

        try {
            await api.delete(`/incidencias/${idIncidencia}`);
            setMessage("Incidencia eliminada correctamente.");
            await cargarDatos();
        }
        catch (err) {
            setError(getErrorMessage(err, "No fue posible eliminar la incidencia."));
        }
        finally {
            setSaving(false);
        }
    };

    return (
        <div className="container mt-5 mb-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h1 className="mb-1">Modulo de Incidencias</h1>
                    <p className="text-muted mb-0">
                        Registro, seguimiento y cierre de incidencias de servicios.
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
                <div className="col-md-4">
                    <div className="card shadow h-100">
                        <div className="card-body">
                            <h5 className="card-title">Total</h5>
                            <p className="display-6 mb-0">{incidencias.length}</p>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow h-100">
                        <div className="card-body">
                            <h5 className="card-title">Abiertas</h5>
                            <p className="display-6 mb-0">{incidenciasAbiertas}</p>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow h-100">
                        <div className="card-body">
                            <h5 className="card-title">Resueltas</h5>
                            <p className="display-6 mb-0">{incidenciasResueltas}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow mb-4">
                <div className="card-body">
                    <h4 className="card-title mb-3">
                        {editingId ? "Editar incidencia" : "Nueva incidencia"}
                    </h4>

                    {!puedeCrear && !editingId && (
                        <div className="alert alert-info mb-0">
                            Su rol permite consultar incidencias. Para registrar una nueva incidencia se requiere rol Supervisor.
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
                                        required={!editingId}
                                        disabled={!!editingId}
                                    >
                                        <option value="">Seleccione un servicio</option>
                                        {servicios.map((servicio) => (
                                            <option key={servicio.id_servicio} value={servicio.id_servicio}>
                                                {servicio.nombre_servicio}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Prioridad</label>
                                    <select
                                        className="form-select"
                                        name="prioridad"
                                        value={form.prioridad}
                                        onChange={handleChange}
                                    >
                                        {prioridades.map((prioridad) => (
                                            <option key={prioridad} value={prioridad}>
                                                {prioridad}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Tipo</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="tipo"
                                        value={form.tipo}
                                        onChange={handleChange}
                                        placeholder="Ej: Falta de insumos"
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Recurso requerido</label>
                                    <select
                                        className="form-select"
                                        name="id_recurso"
                                        value={form.id_recurso}
                                        onChange={handleChange}
                                    >
                                        <option value="">Sin recurso asociado</option>
                                        {recursos.map((recurso) => (
                                            <option key={recurso.id_recurso} value={recurso.id_recurso}>
                                                {recurso.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">Cantidad</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="form-control"
                                        name="cantidad_requerida"
                                        value={form.cantidad_requerida}
                                        onChange={handleChange}
                                        disabled={!form.id_recurso}
                                    />
                                </div>

                                <div className="col-md-9">
                                    <label className="form-label">Observacion del recurso</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="observacion"
                                        value={form.observacion}
                                        onChange={handleChange}
                                        disabled={!form.id_recurso}
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label">Descripcion</label>
                                    <textarea
                                        className="form-control"
                                        name="descripcion"
                                        rows="3"
                                        value={form.descripcion}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="d-flex gap-2 mt-4">
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? "Guardando..." : "Guardar"}
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

            <div className="card shadow">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="card-title mb-0">Incidencias registradas</h4>
                        <button className="btn btn-outline-primary btn-sm" onClick={cargarDatos} disabled={loading}>
                            Actualizar
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-4">Cargando incidencias...</div>
                    ) : incidencias.length === 0 ? (
                        <div className="alert alert-info mb-0">No hay incidencias registradas.</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-striped table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Servicio</th>
                                        <th>Tipo</th>
                                        <th>Prioridad</th>
                                        <th>Estado</th>
                                        <th>Reportada por</th>
                                        <th>Recurso</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {incidencias.map((incidencia) => {
                                        const recursoIncidencia = incidencia.recursosRequeridos?.[0];
                                        const estaAbierta = incidencia.estado === "ABIERTA";

                                        return (
                                            <tr key={incidencia.id_incidencia}>
                                                <td>{incidencia.id_incidencia}</td>
                                                <td>{incidencia.servicio?.nombre_servicio ?? "Sin servicio"}</td>
                                                <td>
                                                    <strong>{incidencia.tipo}</strong>
                                                    <div className="small text-muted">{incidencia.descripcion}</div>
                                                </td>
                                                <td>
                                                    <span className="badge text-bg-warning">
                                                        {incidencia.prioridad}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${estaAbierta ? "text-bg-danger" : "text-bg-success"}`}>
                                                        {incidencia.estado}
                                                    </span>
                                                </td>
                                                <td>{getNombreUsuario(incidencia.reportadaPor)}</td>
                                                <td>
                                                    {recursoIncidencia
                                                        ? `${recursoIncidencia.recurso?.nombre ?? "Recurso"} (${recursoIncidencia.cantidad_requerida})`
                                                        : "Sin recurso"}
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-wrap gap-2">
                                                        {puedeEditar && estaAbierta && (
                                                            <>
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() => editarIncidencia(incidencia)}
                                                                    disabled={saving}
                                                                >
                                                                    Editar
                                                                </button>

                                                                <button
                                                                    className="btn btn-sm btn-outline-success"
                                                                    onClick={() => {
                                                                        setClosingId(incidencia.id_incidencia);
                                                                        setSolucion("");
                                                                    }}
                                                                    disabled={saving}
                                                                >
                                                                    Cerrar
                                                                </button>
                                                            </>
                                                        )}

                                                        {puedeEliminar && (
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => eliminarIncidencia(incidencia.id_incidencia)}
                                                                disabled={saving}
                                                            >
                                                                Eliminar
                                                            </button>
                                                        )}
                                                    </div>

                                                    {closingId === incidencia.id_incidencia && (
                                                        <div className="mt-3">
                                                            <textarea
                                                                className="form-control form-control-sm mb-2"
                                                                rows="2"
                                                                value={solucion}
                                                                onChange={(event) => setSolucion(event.target.value)}
                                                                placeholder="Solucion o accion correctiva"
                                                            />
                                                            <div className="d-flex gap-2">
                                                                <button
                                                                    className="btn btn-sm btn-success"
                                                                    onClick={() => cerrarIncidencia(incidencia.id_incidencia)}
                                                                    disabled={saving || !solucion.trim()}
                                                                >
                                                                    Confirmar
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                    onClick={() => setClosingId(null)}
                                                                    disabled={saving}
                                                                >
                                                                    Cancelar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
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
