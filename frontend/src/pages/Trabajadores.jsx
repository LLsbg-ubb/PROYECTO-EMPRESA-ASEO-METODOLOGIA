import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const initialForm = {
    id_usuario: "",
    fecha_contratacion: "",
    estado: "DISPONIBLE"
};

function getErrorMessage(error, fallback) {
    return error.response?.data?.error ?? fallback;
}

export default function Trabajadores() {
    const navigate = useNavigate();
    const { rol } = useAuth();

    const [trabajadores, setTrabajadores] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const puedeGuardar = rol === "ADMINISTRATIVO" || rol === "SUPERVISOR";
    const puedeEliminar = rol === "ADMINISTRATIVO";

    const trabajadoresDisponibles = useMemo(
        () => trabajadores.filter((trabajador) => trabajador.estado === "DISPONIBLE").length,
        [trabajadores]
    );

    const trabajadoresAsignados = useMemo(
        () => trabajadores.filter((trabajador) => trabajador.estado === "ASIGNADO").length,
        [trabajadores]
    );

    async function cargarTrabajadores() {
        setLoading(true);
        setError("");

        try {
            const trabajadoresResponse = await api.get("/trabajadores");
            const usuariosResponse = await api.get("/usuarios");

            setTrabajadores(trabajadoresResponse.data);
            setUsuarios(usuariosResponse.data);
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "No fue posible cargar el modulo de trabajadores."
                )
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            cargarTrabajadores();
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
            id_usuario: Number(form.id_usuario),
            fecha_contratacion: form.fecha_contratacion,
            estado: form.estado
        };

        try {
            if (editingId) {
                await api.put(`/trabajadores/${editingId}`, payload);
                setMessage("Trabajador actualizado correctamente.");
            } else {
                await api.post("/trabajadores", payload);
                setMessage("Trabajador registrado correctamente.");
            }

            resetForm();
            await cargarTrabajadores();
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "No fue posible guardar el trabajador."
                )
            );
        } finally {
            setSaving(false);
        }
    };

    const editarTrabajador = (trabajador) => {
        setEditingId(trabajador.id_trabajador);

        setForm({
            id_usuario: trabajador.usuario?.id_usuario ?? "",
            fecha_contratacion: trabajador.fecha_contratacion ?? "",
            estado: trabajador.estado ?? "DISPONIBLE"
        });

        setMessage("");
        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const eliminarTrabajador = async (idTrabajador) => {
        const confirmar = window.confirm(
            "¿Desea eliminar este trabajador?"
        );

        if (!confirmar) {
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");

        try {
            await api.delete(`/trabajadores/${idTrabajador}`);

            setMessage(
                "Trabajador eliminado correctamente."
            );

            await cargarTrabajadores();
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "No fue posible eliminar el trabajador."
                )
            );
        } finally {
            setSaving(false);
        }
    };
        return (
        <div className="container mt-5 mb-5">

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h1 className="mb-1">
                        Modulo de Trabajadores
                    </h1>

                    <p className="text-muted mb-0">
                        Administración de trabajadores registrados.
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

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {message && (
                <div className="alert alert-success">
                    {message}
                </div>
            )}

            <div className="row g-4 mb-4">

                <div className="col-md-4">
                    <div className="card shadow h-100">
                        <div className="card-body">
                            <h5 className="card-title">
                                Trabajadores
                            </h5>

                            <p className="display-6 mb-0">
                                {trabajadores.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow h-100">
                        <div className="card-body">
                            <h5 className="card-title">
                                Disponibles
                            </h5>

                            <p className="display-6 mb-0">
                                {trabajadoresDisponibles}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow h-100">
                        <div className="card-body">
                            <h5 className="card-title">
                                Asignados
                            </h5>

                            <p className="display-6 mb-0">
                                {trabajadoresAsignados}
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            <div className="card shadow mb-4">

                <div className="card-body">

                    <h4 className="card-title mb-3">
                        {editingId ? "Editar trabajador" : "Nuevo trabajador"}
                    </h4>

                    {!puedeGuardar && !editingId && (
                        <div className="alert alert-info mb-0">
                            Su rol permite consultar trabajadores.
                            Para registrar o editar se requiere rol Administrativo o Supervisor.
                        </div>
                    )}

                    {(puedeGuardar || editingId) && (
                        <form onSubmit={handleSubmit}>

                            <div className="row g-3">

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Usuario
                                    </label>

                                    <select
                                        className="form-select"
                                        name="id_usuario"
                                        value={form.id_usuario}
                                        onChange={handleChange}
                                        disabled={editingId !== null}
                                        required
                                    >
                                        <option value="">
                                            Seleccione un usuario
                                        </option>

                                        {usuarios.map((usuario) => (
                                            <option
                                                key={usuario.id_usuario}
                                                value={usuario.id_usuario}
                                            >
                                                {usuario.nombres} {usuario.apellido_paterno} {usuario.apellido_materno ?? ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Fecha contratación
                                    </label>

                                    <input
                                        type="date"
                                        className="form-control"
                                        name="fecha_contratacion"
                                        value={form.fecha_contratacion}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Estado
                                    </label>

                                    <select
                                        className="form-select"
                                        name="estado"
                                        value={form.estado}
                                        onChange={handleChange}
                                    >
                                        <option value="DISPONIBLE">
                                            Disponible
                                        </option>

                                        <option value="ASIGNADO">
                                            Asignado
                                        </option>
                                    </select>
                                </div>

                            </div>

                            <div className="d-flex gap-2 mt-4">

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                >
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

                        <h4 className="card-title mb-0">
                            Trabajadores registrados
                        </h4>

                        <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={cargarTrabajadores}
                            disabled={loading}
                        >
                            Actualizar
                        </button>

                    </div>

                    {loading ? (

                        <div className="text-center py-4">
                            Cargando trabajadores...
                        </div>

                    ) : trabajadores.length === 0 ? (

                        <div className="alert alert-info mb-0">
                            No hay trabajadores registrados.
                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-striped table-hover align-middle">

                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Trabajador</th>
                                        <th>Correo</th>
                                        <th>Fecha contratación</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {trabajadores.map((trabajador) => (

                                        <tr key={trabajador.id_trabajador}>

                                            <td>
                                                {trabajador.id_trabajador}
                                            </td>

                                            <td>
                                                {trabajador.usuario
                                                    ? `${trabajador.usuario.nombres} ${trabajador.usuario.apellido_paterno} ${trabajador.usuario.apellido_materno ?? ""}`
                                                    : "Sin usuario"}
                                            </td>

                                            <td>
                                                {trabajador.usuario?.correo ?? "-"}
                                            </td>

                                            <td>
                                                {trabajador.fecha_contratacion}
                                            </td>

                                            <td>
                                                <span
                                                    className={`badge ${
                                                        trabajador.estado === "DISPONIBLE"
                                                            ? "text-bg-success"
                                                            : "text-bg-warning"
                                                    }`}
                                                >
                                                    {trabajador.estado}
                                                </span>
                                            </td>

                                            <td>

                                                <div className="d-flex flex-wrap gap-2">

                                                    {puedeGuardar && (
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => editarTrabajador(trabajador)}
                                                            disabled={saving}
                                                        >
                                                            Editar
                                                        </button>
                                                    )}

                                                    {puedeEliminar && (
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => eliminarTrabajador(trabajador.id_trabajador)}
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