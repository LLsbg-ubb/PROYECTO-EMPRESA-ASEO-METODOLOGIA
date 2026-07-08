import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const initialForm = {
    id_trabajador: "",
    id_especializacion: ""
};

function getErrorMessage(error, fallback) {
    return error.response?.data?.error ?? fallback;
}

function getNombreTrabajador(trabajador) {
    const usuario = trabajador.usuario;

    if (!usuario) {
        return `Trabajador #${trabajador.id_trabajador}`;
    }

    return [usuario.nombres, usuario.apellido_paterno, usuario.apellido_materno]
        .filter(Boolean)
        .join(" ");
}

export default function TrabajadorEspecializaciones() {
    const navigate = useNavigate();
    const { rol } = useAuth();

    const [trabajadores, setTrabajadores] = useState([]);
    const [especializaciones, setEspecializaciones] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editingRelation, setEditingRelation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const puedeGestionar = rol === "ADMINISTRATIVO";

    const relaciones = useMemo(() => {
        return trabajadores.flatMap((trabajador) => (
            (trabajador.especializaciones ?? []).map((especializacion) => ({
                trabajador,
                especializacion
            }))
        ));
    }, [trabajadores]);

    const trabajadoresSinEspecializacion = useMemo(
        () => trabajadores.filter((trabajador) => (trabajador.especializaciones ?? []).length === 0).length,
        [trabajadores]
    );

    async function cargarDatos() {
        setLoading(true);
        setError("");

        try {
            const [trabajadoresResponse, especializacionesResponse] = await Promise.all([
                api.get("/trabajadores"),
                api.get("/especializaciones")
            ]);

            setTrabajadores(trabajadoresResponse.data);
            setEspecializaciones(especializacionesResponse.data);
        }
        catch (err) {
            setError(getErrorMessage(err, "No fue posible cargar las relaciones de especializaciones."));
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
        setForm(initialForm);
        setEditingRelation(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        try {
            if (editingRelation) {
                await api.put(
                    `/trabajadores/${editingRelation.id_trabajador}/especializaciones/${editingRelation.id_especializacion}`,
                    {
                        idEspecializacion: Number(form.id_especializacion)
                    }
                );

                setMessage("Relacion de especializacion actualizada correctamente.");
            }
            else {
                await api.post(
                    `/trabajadores/${form.id_trabajador}/especializaciones`,
                    {
                        idEspecializacion: Number(form.id_especializacion)
                    }
                );

                setMessage("Especializacion asignada correctamente al trabajador.");
            }

            resetForm();
            await cargarDatos();
        }
        catch (err) {
            setError(getErrorMessage(err, "No fue posible guardar la relacion."));
        }
        finally {
            setSaving(false);
        }
    };

    const editarRelacion = (trabajador, especializacion) => {
        setEditingRelation({
            id_trabajador: trabajador.id_trabajador,
            id_especializacion: especializacion.id_especializacion
        });
        setForm({
            id_trabajador: String(trabajador.id_trabajador),
            id_especializacion: String(especializacion.id_especializacion)
        });
        setMessage("");
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const eliminarRelacion = async (trabajador, especializacion) => {
        const confirmar = window.confirm("Desea quitar esta especializacion del trabajador?");

        if (!confirmar) {
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");

        try {
            await api.delete(
                `/trabajadores/${trabajador.id_trabajador}/especializaciones/${especializacion.id_especializacion}`
            );

            setMessage("Especializacion quitada del trabajador correctamente.");
            await cargarDatos();
        }
        catch (err) {
            setError(getErrorMessage(err, "No fue posible quitar la especializacion."));
        }
        finally {
            setSaving(false);
        }
    };

    return (
        <div className="container mt-5 mb-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h1 className="mb-1">Especializaciones de Trabajadores</h1>
                    <p className="text-muted mb-0">
                        Relacionar, editar y quitar especializaciones asignadas al personal.
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
                            <h5 className="card-title">Relaciones</h5>
                            <p className="display-6 mb-0">{relaciones.length}</p>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow h-100">
                        <div className="card-body">
                            <h5 className="card-title">Trabajadores</h5>
                            <p className="display-6 mb-0">{trabajadores.length}</p>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow h-100">
                        <div className="card-body">
                            <h5 className="card-title">Sin especializacion</h5>
                            <p className="display-6 mb-0">{trabajadoresSinEspecializacion}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow mb-4">
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                        {editingRelation ? "Editar relacion" : "Asignar especializacion"}
                    </h5>
                </div>
                <div className="card-body">
                    {!puedeGestionar && (
                        <div className="alert alert-info mb-0">
                            Su rol permite consultar relaciones. Para asignar, editar o quitar especializaciones se requiere rol Administrativo.
                        </div>
                    )}

                    {puedeGestionar && (
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Trabajador</label>
                                    <select
                                        className="form-select"
                                        name="id_trabajador"
                                        value={form.id_trabajador}
                                        onChange={handleChange}
                                        disabled={!!editingRelation}
                                        required
                                    >
                                        <option value="">Seleccione un trabajador</option>
                                        {trabajadores.map((trabajador) => (
                                            <option key={trabajador.id_trabajador} value={trabajador.id_trabajador}>
                                                #{trabajador.id_trabajador} - {getNombreTrabajador(trabajador)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Especializacion</label>
                                    <select
                                        className="form-select"
                                        name="id_especializacion"
                                        value={form.id_especializacion}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccione una especializacion</option>
                                        {especializaciones.map((especializacion) => (
                                            <option
                                                key={especializacion.id_especializacion}
                                                value={especializacion.id_especializacion}
                                            >
                                                {especializacion.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="d-flex gap-2 mt-4">
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? "Guardando..." : "Guardar"}
                                </button>

                                {editingRelation && (
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
                        <h4 className="card-title mb-0">Relaciones registradas</h4>
                        <button className="btn btn-outline-primary btn-sm" onClick={cargarDatos} disabled={loading}>
                            Actualizar
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-4">Cargando relaciones...</div>
                    ) : relaciones.length === 0 ? (
                        <div className="alert alert-info mb-0">No hay especializaciones asignadas a trabajadores.</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-striped table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th>ID trabajador</th>
                                        <th>Trabajador</th>
                                        <th>Estado</th>
                                        <th>Especializacion</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {relaciones.map(({ trabajador, especializacion }) => (
                                        <tr
                                            key={`${trabajador.id_trabajador}-${especializacion.id_especializacion}`}
                                        >
                                            <td>{trabajador.id_trabajador}</td>
                                            <td>
                                                <strong>{getNombreTrabajador(trabajador)}</strong>
                                                <div className="small text-muted">
                                                    {trabajador.usuario?.correo ?? "Sin correo"}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge text-bg-secondary">
                                                    {trabajador.estado}
                                                </span>
                                            </td>
                                            <td>{especializacion.nombre}</td>
                                            <td>
                                                <div className="d-flex flex-wrap gap-2">
                                                    {puedeGestionar && (
                                                        <>
                                                            <button
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={() => editarRelacion(trabajador, especializacion)}
                                                                disabled={saving}
                                                            >
                                                                Editar
                                                            </button>

                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => eliminarRelacion(trabajador, especializacion)}
                                                                disabled={saving}
                                                            >
                                                                Quitar
                                                            </button>
                                                        </>
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
