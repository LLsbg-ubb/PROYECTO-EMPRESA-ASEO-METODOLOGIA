import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import Semaforo from "../components/Semaforo.jsx";

const initialForm = {
    id_cliente: "",
    nombre_servicio: "",
    direccion_servicio: "",
    fecha_inicio_programada: "",
    fecha_fin_programada: "",
    estado: "PENDIENTE",
    semaforo: "VERDE",
    contrato_confirmado: false,
    observaciones: ""
};

const initialRequirementForm = {
    id_especializacion: "",
    id_recurso: "",
    cantidad_requerida: 1
};

const initialAssignmentForm = {
    idSupervisor: "",
    trabajadores: [],
    recursos: []
};

function getErrorMessage(error, fallback) {
    return error.response?.data?.error ?? fallback;
}

function formatDateForInput(date) {
    if (!date) {
        return "";
    }

    const fecha = new Date(date);
    const offset = fecha.getTimezoneOffset();

    fecha.setMinutes(fecha.getMinutes() - offset);

    return fecha.toISOString().slice(0, 16);
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
    return getNombreUsuario(trabajador.usuario) || `Trabajador #${trabajador.id_trabajador}`;
}

export default function Servicios() {
    const navigate = useNavigate();
    const { usuario, rol } = useAuth();

    const [servicios, setServicios] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [trabajadores, setTrabajadores] = useState([]);
    const [recursos, setRecursos] = useState([]);
    const [especializaciones, setEspecializaciones] = useState([]);
    const [usuarios, setUsuarios] = useState([]);

    const [form, setForm] = useState(initialForm);
    const [requirementForm, setRequirementForm] = useState(initialRequirementForm);
    const [assignmentForm, setAssignmentForm] = useState(initialAssignmentForm);
    const [resourceDrafts, setResourceDrafts] = useState({});
    const [specialtyDrafts, setSpecialtyDrafts] = useState({});

    const [editingId, setEditingId] = useState(null);
    const [selectedServiceId, setSelectedServiceId] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const puedeGuardar = rol === "ADMINISTRATIVO" || rol === "SUPERVISOR";
    const puedeEliminar = rol === "ADMINISTRATIVO";
    const puedeGestionarAsignaciones = rol === "ADMINISTRATIVO";

    const selectedService = useMemo(
        () => servicios.find((servicio) => String(servicio.id_servicio) === String(selectedServiceId)),
        [servicios, selectedServiceId]
    );

    const especializacionesRequeridas = selectedService?.especializacionesRequeridas ?? [];
    const recursosRequeridos = selectedService?.recursosRequeridos ?? [];

    const serviciosPendientes = useMemo(
        () => servicios.filter((servicio) => servicio.estado === "PENDIENTE").length,
        [servicios]
    );

    const serviciosProceso = useMemo(
        () => servicios.filter((servicio) => servicio.estado === "EN_PROCESO").length,
        [servicios]
    );

    const supervisores = useMemo(
        () => usuarios.filter((item) => item.rol === "SUPERVISOR"),
        [usuarios]
    );

    const especializacionesCubiertas = useMemo(() => {
        const cubiertas = new Set();

        assignmentForm.trabajadores.forEach((idTrabajador) => {
            const trabajador = trabajadores.find(
                (item) => Number(item.id_trabajador) === Number(idTrabajador)
            );

            (trabajador?.especializaciones ?? []).forEach((especializacion) => {
                cubiertas.add(Number(especializacion.id_especializacion));
            });
        });

        return cubiertas;
    }, [assignmentForm.trabajadores, trabajadores]);

    const requerimientosCompletos = useMemo(() => {
        if (especializacionesRequeridas.length === 0) {
            return false;
        }

        return especializacionesRequeridas.every((relacion) =>
            especializacionesCubiertas.has(Number(relacion.id_especializacion))
        );
    }, [especializacionesCubiertas, especializacionesRequeridas]);

    const trabajadoresOrdenados = useMemo(() => {
        const requeridas = new Set(
            especializacionesRequeridas.map((relacion) => Number(relacion.id_especializacion))
        );

        return [...trabajadores].sort((a, b) => {
            const aCoincidencias = (a.especializaciones ?? []).filter((especializacion) =>
                requeridas.has(Number(especializacion.id_especializacion))
            ).length;
            const bCoincidencias = (b.especializaciones ?? []).filter((especializacion) =>
                requeridas.has(Number(especializacion.id_especializacion))
            ).length;

            return bCoincidencias - aCoincidencias;
        });
    }, [especializacionesRequeridas, trabajadores]);

    function calcularSemaforo(fechaInicio, fechaFin, estadoStr) {
        if (!fechaInicio || !fechaFin) {
            return "VERDE";
        }

        if (["CERRADO", "FINALIZADO", "CANCELADO"].includes(estadoStr)) {
            return "VERDE";
        }

        const ahora = new Date();
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);

        if (ahora > fin) {
            return "ROJO";
        }

        const duracionTotal = fin.getTime() - inicio.getTime();
        const tiempoTranscurrido = ahora.getTime() - inicio.getTime();

        if (duracionTotal > 0 && tiempoTranscurrido > 0) {
            const porcentaje = (tiempoTranscurrido / duracionTotal) * 100;

            if (porcentaje >= 90) {
                return "AMARILLO";
            }
        }

        return "VERDE";
    }

    async function cargarServicios(servicioASeleccionar = selectedServiceId) {
        setLoading(true);
        setError("");

        try {
            const [
                serviciosResponse,
                clientesResponse,
                trabajadoresResponse,
                recursosResponse,
                especializacionesResponse
            ] = await Promise.all([
                api.get("/servicios"),
                api.get("/clientes"),
                api.get("/trabajadores"),
                api.get("/recursos"),
                api.get("/especializaciones")
            ]);

            setServicios(serviciosResponse.data);
            setClientes(clientesResponse.data);
            setTrabajadores(trabajadoresResponse.data);
            setRecursos(recursosResponse.data);
            setEspecializaciones(especializacionesResponse.data);

            if (puedeGestionarAsignaciones) {
                const usuariosResponse = await api.get("/usuarios");
                setUsuarios(usuariosResponse.data);
            }

            const existeSeleccion = serviciosResponse.data.some(
                (servicio) => String(servicio.id_servicio) === String(servicioASeleccionar)
            );

            if (!existeSeleccion && serviciosResponse.data.length > 0) {
                setSelectedServiceId(String(serviciosResponse.data[0].id_servicio));
            }
        }
        catch (err) {
            setError(getErrorMessage(err, "No fue posible cargar el modulo de servicios."));
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        cargarServicios();
    }, []);

    useEffect(() => {
        if (!selectedService) {
            return;
        }

        const recursosPorDefecto = (selectedService.recursosRequeridos ?? []).map(
            (relacion) => Number(relacion.id_recurso)
        );

        setAssignmentForm((current) => ({
            ...current,
            recursos: recursosPorDefecto
        }));

        setResourceDrafts(
            Object.fromEntries(
                (selectedService.recursosRequeridos ?? []).map((relacion) => [
                    relacion.id_recurso,
                    relacion.cantidad_requerida
                ])
            )
        );

        setSpecialtyDrafts(
            Object.fromEntries(
                (selectedService.especializacionesRequeridas ?? []).map((relacion) => [
                    relacion.id_especializacion,
                    relacion.id_especializacion
                ])
            )
        );
    }, [selectedService]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((currentForm) => ({
            ...currentForm,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleRequirementChange = (event) => {
        const { name, value } = event.target;

        setRequirementForm((currentForm) => ({
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
            id_cliente: Number(form.id_cliente),
            nombre_servicio: form.nombre_servicio.trim(),
            direccion_servicio: form.direccion_servicio,
            fecha_inicio_programada: form.fecha_inicio_programada,
            fecha_fin_programada: form.fecha_fin_programada,
            estado: form.estado,
            semaforo: calcularSemaforo(
                form.fecha_inicio_programada,
                form.fecha_fin_programada,
                form.estado
            ),
            contrato_confirmado: form.contrato_confirmado,
            observaciones: form.observaciones
        };

        try {
            if (editingId) {
                await api.put(`/servicios/${editingId}`, payload);
                setMessage("Servicio actualizado correctamente.");
                await cargarServicios(editingId);
            }
            else {
                const response = await api.post("/servicios", {
                    ...payload,
                    creado_por: usuario.id_usuario
                });

                setSelectedServiceId(String(response.data.id_servicio));
                setMessage("Servicio registrado correctamente.");
                await cargarServicios(response.data.id_servicio);
            }

            resetForm();
        }
        catch (err) {
            setError(getErrorMessage(err, "No fue posible guardar el servicio."));
        }
        finally {
            setSaving(false);
        }
    };

    const editarServicio = (servicio) => {
        setEditingId(servicio.id_servicio);
        setSelectedServiceId(String(servicio.id_servicio));
        setForm({
            id_cliente: servicio.cliente?.id_cliente ?? "",
            nombre_servicio: servicio.nombre_servicio ?? "",
            direccion_servicio: servicio.direccion_servicio ?? "",
            fecha_inicio_programada: formatDateForInput(servicio.fecha_inicio_programada),
            fecha_fin_programada: formatDateForInput(servicio.fecha_fin_programada),
            estado: servicio.estado ?? "PENDIENTE",
            semaforo: servicio.semaforo ?? "VERDE",
            contrato_confirmado: servicio.contrato_confirmado ?? false,
            observaciones: servicio.observaciones ?? ""
        });
        setMessage("");
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const eliminarServicio = async (idServicio) => {
        const confirmar = window.confirm("Desea eliminar este servicio?");

        if (!confirmar) {
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");

        try {
            await api.delete(`/servicios/${idServicio}`);
            setMessage("Servicio eliminado correctamente.");
            await cargarServicios();
        }
        catch (err) {
            setError(getErrorMessage(err, "No fue posible eliminar el servicio."));
        }
        finally {
            setSaving(false);
        }
    };

    const agregarEspecializacion = async (event) => {
        event.preventDefault();

        if (!selectedServiceId || !requirementForm.id_especializacion) {
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");

        try {
            await api.post(`/servicios/${selectedServiceId}/especializaciones`, {
                idEspecializacion: Number(requirementForm.id_especializacion)
            });

            setRequirementForm((current) => ({
                ...current,
                id_especializacion: ""
            }));
            setMessage("Especializacion requerida agregada.");
            await cargarServicios(selectedServiceId);
        }
        catch (err) {
            setError(getErrorMessage(err, "No fue posible agregar la especializacion."));
        }
        finally {
            setSaving(false);
        }
    };

    const actualizarEspecializacion = async (idEspecializacionActual) => {
        const idEspecializacionNueva = specialtyDrafts[idEspecializacionActual];

        if (!idEspecializacionNueva) {
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");

        try {
            await api.put(
                `/servicios/${selectedServiceId}/especializaciones/${idEspecializacionActual}`,
                {
                    idEspecializacion: Number(idEspecializacionNueva)
                }
            );

            setMessage("Especializacion requerida actualizada.");
            await cargarServicios(selectedServiceId);
        }
        catch (err) {
            setError(getErrorMessage(err, "No fue posible actualizar la especializacion."));
        }
        finally {
            setSaving(false);
        }
    };

    const eliminarEspecializacion = async (idEspecializacion) => {
        if (!window.confirm("Desea quitar esta especializacion requerida?")) {
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");

        try {
            await api.delete(`/servicios/${selectedServiceId}/especializaciones/${idEspecializacion}`);
            setMessage("Especializacion requerida eliminada.");
            await cargarServicios(selectedServiceId);
        }
        catch (err) {
            setError(getErrorMessage(err, "No fue posible eliminar la especializacion."));
        }
        finally {
            setSaving(false);
        }
    };

    const agregarRecurso = async (event) => {
        event.preventDefault();

        if (!selectedServiceId || !requirementForm.id_recurso) {
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");

        try {
            await api.post(`/servicios/${selectedServiceId}/recursos`, {
                idRecurso: Number(requirementForm.id_recurso),
                cantidadRequerida: Number(requirementForm.cantidad_requerida)
            });

            setRequirementForm((current) => ({
                ...current,
                id_recurso: "",
                cantidad_requerida: 1
            }));
            setMessage("Recurso requerido agregado.");
            await cargarServicios(selectedServiceId);
        }
        catch (err) {
            setError(getErrorMessage(err, "No fue posible agregar el recurso."));
        }
        finally {
            setSaving(false);
        }
    };

    const actualizarRecurso = async (idRecurso) => {
        setSaving(true);
        setError("");
        setMessage("");

        try {
            await api.put(`/servicios/${selectedServiceId}/recursos/${idRecurso}`, {
                cantidadRequerida: Number(resourceDrafts[idRecurso])
            });

            setMessage("Recurso requerido actualizado.");
            await cargarServicios(selectedServiceId);
        }
        catch (err) {
            setError(getErrorMessage(err, "No fue posible actualizar el recurso."));
        }
        finally {
            setSaving(false);
        }
    };

    const eliminarRecurso = async (idRecurso) => {
        if (!window.confirm("Desea quitar este recurso requerido?")) {
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");

        try {
            await api.delete(`/servicios/${selectedServiceId}/recursos/${idRecurso}`);
            setMessage("Recurso requerido eliminado.");
            await cargarServicios(selectedServiceId);
        }
        catch (err) {
            setError(getErrorMessage(err, "No fue posible eliminar el recurso."));
        }
        finally {
            setSaving(false);
        }
    };

    const toggleAssignmentItem = (field, id) => {
        setAssignmentForm((current) => {
            const existe = current[field].some((item) => Number(item) === Number(id));

            return {
                ...current,
                [field]: existe
                    ? current[field].filter((item) => Number(item) !== Number(id))
                    : [...current[field], Number(id)]
            };
        });
    };

    const asignarServicio = async (event) => {
        event.preventDefault();

        setSaving(true);
        setError("");
        setMessage("");

        try {
            await api.post(`/servicios/${selectedServiceId}/asignar`, {
                trabajadores: assignmentForm.trabajadores.map(Number),
                recursos: assignmentForm.recursos.map(Number),
                idSupervisor: Number(assignmentForm.idSupervisor),
                idAdministrador: Number(usuario.id_usuario)
            });

            setAssignmentForm(initialAssignmentForm);
            setMessage("Servicio asignado correctamente.");
            await cargarServicios(selectedServiceId);
        }
        catch (err) {
            setError(getErrorMessage(err, "No fue posible asignar el servicio."));
        }
        finally {
            setSaving(false);
        }
    };

    return (
        <div className="container mt-5 mb-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h1 className="mb-1">Modulo de Servicios</h1>
                    <p className="text-muted mb-0">
                        Administracion de servicios, requerimientos y asignaciones.
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
                            <h5 className="card-title">Servicios</h5>
                            <p className="display-6 mb-0">{servicios.length}</p>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow h-100">
                        <div className="card-body">
                            <h5 className="card-title">Pendientes</h5>
                            <p className="display-6 mb-0">{serviciosPendientes}</p>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow h-100">
                        <div className="card-body">
                            <h5 className="card-title">En proceso</h5>
                            <p className="display-6 mb-0">{serviciosProceso}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow mb-4">
                <div className="card-body">
                    <h4 className="card-title mb-3">
                        {editingId ? "Editar servicio" : "Nuevo servicio"}
                    </h4>

                    {!puedeGuardar && (
                        <div className="alert alert-info mb-0">
                            Su rol permite consultar servicios. Para crear o editar se requiere rol Administrativo o Supervisor.
                        </div>
                    )}

                    {(puedeGuardar || editingId) && (
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Cliente</label>
                                    <select
                                        className="form-select"
                                        name="id_cliente"
                                        value={form.id_cliente}
                                        onChange={handleChange}
                                        disabled={editingId !== null}
                                        required
                                    >
                                        <option value="">Seleccione cliente</option>
                                        {clientes.map((cliente) => (
                                            <option key={cliente.id_cliente} value={cliente.id_cliente}>
                                                {cliente.rut} - {cliente.razon_social}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Nombre servicio</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="nombre_servicio"
                                        value={form.nombre_servicio}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Fecha inicio programada</label>
                                    <input
                                        type="datetime-local"
                                        className="form-control"
                                        name="fecha_inicio_programada"
                                        value={form.fecha_inicio_programada}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Fecha fin programada</label>
                                    <input
                                        type="datetime-local"
                                        className="form-control"
                                        name="fecha_fin_programada"
                                        value={form.fecha_fin_programada}
                                        onChange={handleChange}
                                        min={form.fecha_inicio_programada}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Estado</label>
                                    <select
                                        className="form-select"
                                        name="estado"
                                        value={form.estado}
                                        onChange={handleChange}
                                    >
                                        <option value="PENDIENTE">PENDIENTE</option>
                                        <option value="ASIGNADO">ASIGNADO</option>
                                        <option value="EN_PROCESO">EN_PROCESO</option>
                                        <option value="FINALIZADO">FINALIZADO</option>
                                        <option value="CERRADO">CERRADO</option>
                                        <option value="CANCELADO">CANCELADO</option>
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Semaforo</label>
                                    <select
                                        className="form-select"
                                        name="semaforo"
                                        value={form.semaforo}
                                        onChange={handleChange}
                                        disabled
                                    >
                                        <option value="VERDE">VERDE</option>
                                        <option value="AMARILLO">AMARILLO</option>
                                        <option value="ROJO">ROJO</option>
                                    </select>
                                </div>

                                <div className="col-12">
                                    <label className="form-label">Direccion servicio</label>
                                    <textarea
                                        className="form-control"
                                        name="direccion_servicio"
                                        rows="2"
                                        value={form.direccion_servicio}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label">Observaciones</label>
                                    <textarea
                                        className="form-control"
                                        name="observaciones"
                                        rows="3"
                                        value={form.observaciones}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-12">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="contrato_confirmado"
                                            checked={form.contrato_confirmado}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label">
                                            Contrato confirmado
                                        </label>
                                    </div>
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

            <div className="card shadow mb-4">
                <div className="card-body">
                    <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
                        <div>
                            <h4 className="card-title mb-1">Requerimientos y asignacion</h4>
                            <p className="text-muted mb-0">
                                Seleccione un servicio pendiente para definir especializaciones, recursos y personal.
                            </p>
                        </div>

                        <div style={{ minWidth: "280px" }}>
                            <select
                                className="form-select"
                                value={selectedServiceId}
                                onChange={(event) => setSelectedServiceId(event.target.value)}
                            >
                                <option value="">Seleccione un servicio</option>
                                {servicios.map((servicio) => (
                                    <option key={servicio.id_servicio} value={servicio.id_servicio}>
                                        #{servicio.id_servicio} - {servicio.nombre_servicio}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {!selectedService ? (
                        <div className="alert alert-info mb-0">
                            Cree o seleccione un servicio para gestionar sus requerimientos.
                        </div>
                    ) : (
                        <>
                            <div className="row g-3 mb-4">
                                <div className="col-md-3">
                                    <div className="border rounded p-3 h-100">
                                        <div className="text-muted small">Estado</div>
                                        <strong>{selectedService.estado}</strong>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="border rounded p-3 h-100">
                                        <div className="text-muted small">Contrato</div>
                                        <strong>{selectedService.contrato_confirmado ? "Confirmado" : "Pendiente"}</strong>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="border rounded p-3 h-100">
                                        <div className="text-muted small">Especializaciones</div>
                                        <strong>{especializacionesRequeridas.length}</strong>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="border rounded p-3 h-100">
                                        <div className="text-muted small">Recursos</div>
                                        <strong>{recursosRequeridos.length}</strong>
                                    </div>
                                </div>
                            </div>

                            {!puedeGestionarAsignaciones && (
                                <div className="alert alert-info">
                                    Su rol puede consultar esta informacion. Para editar requerimientos o asignar el servicio se requiere rol Administrativo.
                                </div>
                            )}

                            <div className="row g-4">
                                <div className="col-lg-6">
                                    <div className="border rounded p-3 h-100">
                                        <h5 className="mb-3">Especializaciones requeridas</h5>

                                        {puedeGestionarAsignaciones && selectedService.estado === "PENDIENTE" && (
                                            <form className="row g-2 mb-3" onSubmit={agregarEspecializacion}>
                                                <div className="col">
                                                    <select
                                                        className="form-select"
                                                        name="id_especializacion"
                                                        value={requirementForm.id_especializacion}
                                                        onChange={handleRequirementChange}
                                                        required
                                                    >
                                                        <option value="">Seleccione especializacion</option>
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
                                                <div className="col-auto">
                                                    <button className="btn btn-primary" disabled={saving}>
                                                        Agregar
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                        {especializacionesRequeridas.length === 0 ? (
                                            <div className="alert alert-warning mb-0">
                                                Este servicio no tiene especializaciones requeridas.
                                            </div>
                                        ) : (
                                            <div className="vstack gap-2">
                                                {especializacionesRequeridas.map((relacion) => (
                                                    <div
                                                        className="d-flex flex-column flex-md-row gap-2 justify-content-between border rounded p-2"
                                                        key={relacion.id_especializacion}
                                                    >
                                                        <div className="flex-grow-1">
                                                            {puedeGestionarAsignaciones && selectedService.estado === "PENDIENTE" ? (
                                                                <select
                                                                    className="form-select form-select-sm"
                                                                    value={specialtyDrafts[relacion.id_especializacion] ?? relacion.id_especializacion}
                                                                    onChange={(event) =>
                                                                        setSpecialtyDrafts((current) => ({
                                                                            ...current,
                                                                            [relacion.id_especializacion]: event.target.value
                                                                        }))
                                                                    }
                                                                >
                                                                    {especializaciones.map((especializacion) => (
                                                                        <option
                                                                            key={especializacion.id_especializacion}
                                                                            value={especializacion.id_especializacion}
                                                                        >
                                                                            {especializacion.nombre}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            ) : (
                                                                <strong>{relacion.especializacion?.nombre ?? `Especializacion #${relacion.id_especializacion}`}</strong>
                                                            )}
                                                        </div>

                                                        {puedeGestionarAsignaciones && selectedService.estado === "PENDIENTE" && (
                                                            <div className="d-flex gap-2">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() => actualizarEspecializacion(relacion.id_especializacion)}
                                                                    disabled={saving}
                                                                >
                                                                    Editar
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => eliminarEspecializacion(relacion.id_especializacion)}
                                                                    disabled={saving}
                                                                >
                                                                    Quitar
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="col-lg-6">
                                    <div className="border rounded p-3 h-100">
                                        <h5 className="mb-3">Recursos requeridos</h5>

                                        {puedeGestionarAsignaciones && selectedService.estado === "PENDIENTE" && (
                                            <form className="row g-2 mb-3" onSubmit={agregarRecurso}>
                                                <div className="col-md-7">
                                                    <select
                                                        className="form-select"
                                                        name="id_recurso"
                                                        value={requirementForm.id_recurso}
                                                        onChange={handleRequirementChange}
                                                        required
                                                    >
                                                        <option value="">Seleccione recurso</option>
                                                        {recursos.map((recurso) => (
                                                            <option key={recurso.id_recurso} value={recurso.id_recurso}>
                                                                {recurso.nombre} - stock {recurso.stock_disponible}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-md-3">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className="form-control"
                                                        name="cantidad_requerida"
                                                        value={requirementForm.cantidad_requerida}
                                                        onChange={handleRequirementChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-2 d-grid">
                                                    <button className="btn btn-primary" disabled={saving}>
                                                        Agregar
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                        {recursosRequeridos.length === 0 ? (
                                            <div className="alert alert-warning mb-0">
                                                Este servicio no tiene recursos requeridos.
                                            </div>
                                        ) : (
                                            <div className="vstack gap-2">
                                                {recursosRequeridos.map((relacion) => (
                                                    <div
                                                        className="d-flex flex-column flex-md-row gap-2 justify-content-between border rounded p-2"
                                                        key={relacion.id_recurso}
                                                    >
                                                        <div className="flex-grow-1">
                                                            <strong>{relacion.recurso?.nombre ?? `Recurso #${relacion.id_recurso}`}</strong>
                                                            <div className="text-muted small">
                                                                Stock disponible: {relacion.recurso?.stock_disponible ?? "No informado"}
                                                            </div>
                                                        </div>

                                                        <div className="d-flex gap-2 align-items-center">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                className="form-control form-control-sm"
                                                                style={{ width: "95px" }}
                                                                value={resourceDrafts[relacion.id_recurso] ?? relacion.cantidad_requerida}
                                                                disabled={!puedeGestionarAsignaciones || selectedService.estado !== "PENDIENTE"}
                                                                onChange={(event) =>
                                                                    setResourceDrafts((current) => ({
                                                                        ...current,
                                                                        [relacion.id_recurso]: event.target.value
                                                                    }))
                                                                }
                                                            />

                                                            {puedeGestionarAsignaciones && selectedService.estado === "PENDIENTE" && (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-primary"
                                                                        onClick={() => actualizarRecurso(relacion.id_recurso)}
                                                                        disabled={saving}
                                                                    >
                                                                        Editar
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        onClick={() => eliminarRecurso(relacion.id_recurso)}
                                                                        disabled={saving}
                                                                    >
                                                                        Quitar
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="border rounded p-3 mt-4">
                                <h5 className="mb-3">Asignar servicio</h5>

                                {selectedService.estado !== "PENDIENTE" && (
                                    <div className="alert alert-info mb-0">
                                        Este servicio ya no esta pendiente, por lo que no puede asignarse nuevamente.
                                    </div>
                                )}

                                {puedeGestionarAsignaciones && selectedService.estado === "PENDIENTE" && (
                                    <form onSubmit={asignarServicio}>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Supervisor</label>
                                                <select
                                                    className="form-select"
                                                    value={assignmentForm.idSupervisor}
                                                    onChange={(event) =>
                                                        setAssignmentForm((current) => ({
                                                            ...current,
                                                            idSupervisor: event.target.value
                                                        }))
                                                    }
                                                    required
                                                >
                                                    <option value="">Seleccione supervisor</option>
                                                    {supervisores.map((supervisor) => (
                                                        <option key={supervisor.id_usuario} value={supervisor.id_usuario}>
                                                            {getNombreUsuario(supervisor)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label">Cobertura de especializaciones</label>
                                                <div className={requerimientosCompletos ? "alert alert-success mb-0" : "alert alert-warning mb-0"}>
                                                    {requerimientosCompletos
                                                        ? "Todas las especializaciones requeridas estan cubiertas."
                                                        : "Defina especializaciones y seleccione trabajadores que cubran cada una."}
                                                </div>
                                            </div>

                                            <div className="col-lg-7">
                                                <label className="form-label">Trabajadores disponibles</label>
                                                <div className="border rounded p-2" style={{ maxHeight: "300px", overflowY: "auto" }}>
                                                    {trabajadoresOrdenados.length === 0 ? (
                                                        <div className="text-muted p-2">No hay trabajadores registrados.</div>
                                                    ) : (
                                                        trabajadoresOrdenados.map((trabajador) => {
                                                            const especialidades = trabajador.especializaciones ?? [];
                                                            const disponible = trabajador.estado === "DISPONIBLE";

                                                            return (
                                                                <label
                                                                    className="d-flex gap-2 align-items-start border-bottom py-2"
                                                                    key={trabajador.id_trabajador}
                                                                >
                                                                    <input
                                                                        className="form-check-input mt-1"
                                                                        type="checkbox"
                                                                        checked={assignmentForm.trabajadores.some(
                                                                            (item) => Number(item) === Number(trabajador.id_trabajador)
                                                                        )}
                                                                        disabled={!disponible}
                                                                        onChange={() => toggleAssignmentItem("trabajadores", trabajador.id_trabajador)}
                                                                    />
                                                                    <span>
                                                                        <strong>{getNombreTrabajador(trabajador)}</strong>
                                                                        <span className="badge text-bg-light ms-2">{trabajador.estado}</span>
                                                                        <span className="d-block text-muted small">
                                                                            {especialidades.length > 0
                                                                                ? especialidades.map((especializacion) => especializacion.nombre).join(", ")
                                                                                : "Sin especializaciones"}
                                                                        </span>
                                                                    </span>
                                                                </label>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </div>

                                            <div className="col-lg-5">
                                                <label className="form-label">Recursos a asignar</label>
                                                <div className="border rounded p-2" style={{ maxHeight: "300px", overflowY: "auto" }}>
                                                    {recursosRequeridos.length === 0 ? (
                                                        <div className="text-muted p-2">Agregue recursos requeridos antes de asignar.</div>
                                                    ) : (
                                                        recursosRequeridos.map((relacion) => (
                                                            <label
                                                                className="d-flex gap-2 align-items-start border-bottom py-2"
                                                                key={relacion.id_recurso}
                                                            >
                                                                <input
                                                                    className="form-check-input mt-1"
                                                                    type="checkbox"
                                                                    checked={assignmentForm.recursos.some(
                                                                        (item) => Number(item) === Number(relacion.id_recurso)
                                                                    )}
                                                                    onChange={() => toggleAssignmentItem("recursos", relacion.id_recurso)}
                                                                />
                                                                <span>
                                                                    <strong>{relacion.recurso?.nombre ?? `Recurso #${relacion.id_recurso}`}</strong>
                                                                    <span className="d-block text-muted small">
                                                                        Cantidad requerida: {relacion.cantidad_requerida}
                                                                    </span>
                                                                </span>
                                                            </label>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-end mt-3">
                                            <button
                                                type="submit"
                                                className="btn btn-success"
                                                disabled={
                                                    saving ||
                                                    !selectedService.contrato_confirmado ||
                                                    !assignmentForm.idSupervisor ||
                                                    assignmentForm.trabajadores.length === 0 ||
                                                    assignmentForm.recursos.length === 0 ||
                                                    recursosRequeridos.length === 0 ||
                                                    !requerimientosCompletos
                                                }
                                            >
                                                Asignar servicio
                                            </button>
                                        </div>

                                        {!selectedService.contrato_confirmado && (
                                            <div className="alert alert-warning mt-3 mb-0">
                                                Confirme el contrato del servicio antes de asignarlo.
                                            </div>
                                        )}
                                    </form>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="card shadow">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="card-title mb-0">Servicios registrados</h4>

                        <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => cargarServicios()}
                            disabled={loading}
                        >
                            Actualizar
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-4">Cargando servicios...</div>
                    ) : servicios.length === 0 ? (
                        <div className="alert alert-info">No hay servicios registrados.</div>
                    ) : (
                        <div className="table-responsive" style={{ maxHeight: "520px", overflowY: "auto" }}>
                            <table className="table table-striped table-hover align-middle" style={{ minWidth: "1650px" }}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Cliente</th>
                                        <th>Servicio</th>
                                        <th>Direccion</th>
                                        <th>Inicio</th>
                                        <th>Fin</th>
                                        <th>Estado</th>
                                        <th>Contrato</th>
                                        <th>Especializaciones</th>
                                        <th>Recursos</th>
                                        <th>Supervisor</th>
                                        <th>Observaciones</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {servicios.map((servicio) => (
                                        <tr
                                            key={servicio.id_servicio}
                                            className={String(selectedServiceId) === String(servicio.id_servicio) ? "table-primary" : ""}
                                        >
                                            <td>{servicio.id_servicio}</td>
                                            <td>{servicio.cliente?.razon_social ?? "Sin cliente"}</td>
                                            <td>{servicio.nombre_servicio}</td>
                                            <td>{servicio.direccion_servicio}</td>
                                            <td>{new Date(servicio.fecha_inicio_programada).toLocaleString("es-CL")}</td>
                                            <td>{new Date(servicio.fecha_fin_programada).toLocaleString("es-CL")}</td>
                                            <td>{servicio.estado}</td>
                                            <td>{servicio.contrato_confirmado ? "Si" : "No"}</td>
                                            <td>{servicio.especializacionesRequeridas?.length ?? 0}</td>
                                            <td>{servicio.recursosRequeridos?.length ?? 0}</td>
                                            <td>{getNombreUsuario(servicio.supervisor)}</td>
                                            <td>{servicio.observaciones || "Sin observaciones"}</td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary"
                                                        onClick={() => setSelectedServiceId(String(servicio.id_servicio))}
                                                        disabled={saving}
                                                    >
                                                        Gestionar
                                                    </button>

                                                    {puedeGuardar && (
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => editarServicio(servicio)}
                                                            disabled={saving}
                                                        >
                                                            Editar
                                                        </button>
                                                    )}

                                                    {puedeEliminar && (
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => eliminarServicio(servicio.id_servicio)}
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
