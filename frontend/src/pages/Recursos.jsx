import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const initialForm = {
    nombre: "",
    descripcion: "",
    stock_disponible: 0
};

function getErrorMessage(error, fallback) {
    return error.response?.data?.error ?? fallback;
}

export default function Recursos() {
    const navigate = useNavigate();
    const { rol } = useAuth();

    const [recursos, setRecursos] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const puedeGuardar = rol === "ADMINISTRATIVO" || rol === "SUPERVISOR";
    const puedeEliminar = rol === "ADMINISTRATIVO";

    const stockTotal = useMemo(
        () => recursos.reduce((total, recurso) => total + Number(recurso.stock_disponible ?? 0), 0),
        [recursos]
    );

    const recursosSinStock = useMemo(
        () => recursos.filter((recurso) => Number(recurso.stock_disponible ?? 0) === 0).length,
        [recursos]
    );

    async function cargarRecursos() {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/recursos");
            setRecursos(response.data);
        }
        catch (err) {
            setError(getErrorMessage(err, "No fue posible cargar el modulo de recursos."));
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            cargarRecursos();
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
        setEditingId(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        const payload = {
            nombre: form.nombre,
            descripcion: form.descripcion,
            stock_disponible: Number(form.stock_disponible)
        };

        try {
            if (editingId) {
                await api.put(`/recursos/${editingId}`, payload);
                setMessage("Recurso actualizado correctamente.");
            }
            else {
                await api.post("/recursos", payload);
                setMessage("Recurso registrado correctamente.");
            }

            resetForm();
            await cargarRecursos();
        }
        catch (err) {
            setError(getErrorMessage(err, "No fue posible guardar el recurso."));
        }
        finally {
            setSaving(false);
        }
    };

    const editarRecurso = (recurso) => {
        setEditingId(recurso.id_recurso);
        setForm({
            nombre: recurso.nombre,
            descripcion: recurso.descripcion ?? "",
            stock_disponible: recurso.stock_disponible ?? 0
        });
        setMessage("");
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const eliminarRecurso = async (idRecurso) => {
        const confirmar = window.confirm("Desea eliminar este recurso?");

        if (!confirmar) {
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");

        try {
            await api.delete(`/recursos/${idRecurso}`);
            setMessage("Recurso eliminado correctamente.");
            await cargarRecursos();
        }
        catch (err) {
            setError(getErrorMessage(err, "No fue posible eliminar el recurso."));
        }
        finally {
            setSaving(false);
        }
    };

    return (
        <div className="container mt-5 mb-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h1 className="mb-1">Modulo de Recursos</h1>
                    <p className="text-muted mb-0">
                        Inventario de insumos, equipos y materiales disponibles.
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
                            <h5 className="card-title">Recursos</h5>
                            <p className="display-6 mb-0">{recursos.length}</p>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow h-100">
                        <div className="card-body">
                            <h5 className="card-title">Stock total</h5>
                            <p className="display-6 mb-0">{stockTotal}</p>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow h-100">
                        <div className="card-body">
                            <h5 className="card-title">Sin stock</h5>
                            <p className="display-6 mb-0">{recursosSinStock}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow mb-4">
                <div className="card-body">
                    <h4 className="card-title mb-3">
                        {editingId ? "Editar recurso" : "Nuevo recurso"}
                    </h4>

                    {!puedeGuardar && !editingId && (
                        <div className="alert alert-info mb-0">
                            Su rol permite consultar recursos. Para registrar o editar se requiere rol Administrativo o Supervisor.
                        </div>
                    )}

                    {(puedeGuardar || editingId) && (
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Nombre</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="nombre"
                                        value={form.nombre}
                                        onChange={handleChange}
                                        placeholder="Ej: Guantes de nitrilo"
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Stock disponible</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="form-control"
                                        name="stock_disponible"
                                        value={form.stock_disponible}
                                        onChange={handleChange}
                                        required
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
                                        placeholder="Detalle del recurso, formato o uso principal"
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
                        <h4 className="card-title mb-0">Recursos registrados</h4>
                        <button className="btn btn-outline-primary btn-sm" onClick={cargarRecursos} disabled={loading}>
                            Actualizar
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-4">Cargando recursos...</div>
                    ) : recursos.length === 0 ? (
                        <div className="alert alert-info mb-0">No hay recursos registrados.</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-striped table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Descripcion</th>
                                        <th>Stock</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recursos.map((recurso) => {
                                        const stock = Number(recurso.stock_disponible ?? 0);

                                        return (
                                            <tr key={recurso.id_recurso}>
                                                <td>{recurso.id_recurso}</td>
                                                <td>
                                                    <strong>{recurso.nombre}</strong>
                                                </td>
                                                <td>{recurso.descripcion || "Sin descripcion"}</td>
                                                <td>{stock}</td>
                                                <td>
                                                    <span className={`badge ${stock > 0 ? "text-bg-success" : "text-bg-danger"}`}>
                                                        {stock > 0 ? "Disponible" : "Sin stock"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-wrap gap-2">
                                                        {puedeGuardar && (
                                                            <button
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={() => editarRecurso(recurso)}
                                                                disabled={saving}
                                                            >
                                                                Editar
                                                            </button>
                                                        )}

                                                        {puedeEliminar && (
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => eliminarRecurso(recurso.id_recurso)}
                                                                disabled={saving}
                                                            >
                                                                Eliminar
                                                            </button>
                                                        )}
                                                    </div>
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
