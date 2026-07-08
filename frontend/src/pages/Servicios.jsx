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


function getErrorMessage(error, fallback) {
    return error.response?.data?.error ?? fallback;
}


function formatDateForInput(date) {

    if (!date) {
        return "";
    }

    const fecha = new Date(date);

    const offset = fecha.getTimezoneOffset();

    fecha.setMinutes(
        fecha.getMinutes() - offset
    );

    return fecha.toISOString().slice(0, 16);
}



export default function Servicios() {


    const navigate = useNavigate();

    const { usuario, rol } = useAuth();

// --- CEREBRO DEL SEMAFORO ---
    const calcularSemaforo = (fechaInicio, fechaFin, estadoStr) => {
        if (!fechaInicio || !fechaFin) return "VERDE";
        if (estadoStr === "CERRADO" || estadoStr === "FINALIZADO" || estadoStr === "CANCELADO") return "VERDE";
        
        const ahora = new Date();
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        
        // REGLA (ROJO): Si la fecha actual supero el limite y sigue en ejecucion
        if (ahora > fin) return "ROJO";
        
        // REGLA PREVENTIVA (AMARILLO): Si ya se consumio mas del 90% del tiempo
        const duracionTotal = fin.getTime() - inicio.getTime();
        const tiempoTranscurrido = ahora.getTime() - inicio.getTime();
        
        if (duracionTotal > 0 && tiempoTranscurrido > 0) {
            const porcentaje = (tiempoTranscurrido / duracionTotal) * 100;
            if (porcentaje >= 90) return "AMARILLO"; 
        }
        
        return "VERDE";
    };
    // ----------------------------------------

    const [servicios, setServicios] = useState([]);

    const [clientes, setClientes] = useState([]);

    const [form, setForm] = useState(initialForm);

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");





    const puedeGuardar =
        rol === "ADMINISTRATIVO" ||
        rol === "SUPERVISOR";


    const puedeEliminar =
        rol === "ADMINISTRATIVO";





    const serviciosPendientes = useMemo(
        () =>
            servicios.filter(
                servicio =>
                    servicio.estado === "PENDIENTE"
            ).length,
        [servicios]
    );



    const serviciosProceso = useMemo(
        () =>
            servicios.filter(
                servicio =>
                    servicio.estado === "EN_PROCESO"
            ).length,
        [servicios]
    );






    async function cargarServicios() {

        setLoading(true);

        setError("");

        try {


            const serviciosResponse =
                await api.get("/servicios");


            const clientesResponse =
                await api.get("/clientes");



            setServicios(
                serviciosResponse.data
            );


            setClientes(
                clientesResponse.data
            );



        }
        catch (err) {


            setError(
                getErrorMessage(
                    err,
                    "No fue posible cargar el modulo de servicios."
                )
            );


        }
        finally {

            setLoading(false);

        }

    }







    useEffect(() => {

        cargarServicios();

    }, []);







    const handleChange = (event) => {


        const {
            name,
            value,
            type,
            checked
        } = event.target;



        setForm(
            currentForm => ({

                ...currentForm,

                [name]:
                    type === "checkbox"
                        ? checked
                        : value

            })
        );

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

            id_cliente:
                Number(form.id_cliente),

            nombre_servicio:
                form.nombre_servicio.trim(),

            direccion_servicio:
                form.direccion_servicio,

            fecha_inicio_programada:
                form.fecha_inicio_programada,

            fecha_fin_programada:
                form.fecha_fin_programada,

            estado:
                form.estado,

            semaforo: calcularSemaforo(form.fecha_inicio_programada, form.fecha_fin_programada, form.estado),

            contrato_confirmado:
                form.contrato_confirmado,

            observaciones:
                form.observaciones

        };





        try {



            if (editingId) {


                await api.put(
                    `/servicios/${editingId}`,
                    payload
                );


                setMessage(
                    "Servicio actualizado correctamente."
                );


            }
            else {



                await api.post(
                    "/servicios",
                    {
                        ...payload,

                        creado_por:
                            usuario.id_usuario
                    }
                );


                setMessage(
                    "Servicio registrado correctamente."
                );


            }




            resetForm();

            await cargarServicios();




        }
        catch(err) {


            setError(
                getErrorMessage(
                    err,
                    "No fue posible guardar el servicio."
                )
            );


        }
        finally {

            setSaving(false);

        }


    };







    const editarServicio = (servicio) => {


        setEditingId(
            servicio.id_servicio
        );



        setForm({


            id_cliente:
                servicio.cliente?.id_cliente ?? "",


            nombre_servicio:
                servicio.nombre_servicio ?? "",


            direccion_servicio:
                servicio.direccion_servicio ?? "",


            fecha_inicio_programada:
                formatDateForInput(
                    servicio.fecha_inicio_programada
                ),


            fecha_fin_programada:
                formatDateForInput(
                    servicio.fecha_fin_programada
                ),


            estado:
                servicio.estado ?? "PENDIENTE",


            semaforo:
                servicio.semaforo ?? "VERDE",


            contrato_confirmado:
                servicio.contrato_confirmado ?? false,


            observaciones:
                servicio.observaciones ?? ""

        });



        setMessage("");

        setError("");



        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });


    };





    const eliminarServicio = async (idServicio) => {


        const confirmar =
            window.confirm(
                "¿Desea eliminar este servicio?"
            );



        if (!confirmar) {

            return;

        }



        setSaving(true);

        setError("");

        setMessage("");



        try {



            await api.delete(
                `/servicios/${idServicio}`
            );



            setMessage(
                "Servicio eliminado correctamente."
            );



            await cargarServicios();



        }
        catch(err) {


            setError(
                getErrorMessage(
                    err,
                    "No fue posible eliminar el servicio."
                )
            );


        }
        finally {

            setSaving(false);

        }


    };

    return (

        <div className="container mt-5 mb-5">


            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

                <div>

                    <h1 className="mb-1">
                        Modulo de Servicios
                    </h1>

                    <p className="text-muted mb-0">
                        Administración de servicios registrados.
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
                                Servicios
                            </h5>

                            <p className="display-6 mb-0">
                                {servicios.length}
                            </p>

                        </div>

                    </div>

                </div>





                <div className="col-md-4">

                    <div className="card shadow h-100">

                        <div className="card-body">

                            <h5 className="card-title">
                                Pendientes
                            </h5>

                            <p className="display-6 mb-0">
                                {serviciosPendientes}
                            </p>

                        </div>

                    </div>

                </div>





                <div className="col-md-4">

                    <div className="card shadow h-100">

                        <div className="card-body">

                            <h5 className="card-title">
                                En proceso
                            </h5>

                            <p className="display-6 mb-0">
                                {serviciosProceso}
                            </p>

                        </div>

                    </div>

                </div>


            </div>







            <div className="card shadow mb-4">

                <div className="card-body">


                    <h4 className="card-title mb-3">

                        {editingId
                            ? "Editar servicio"
                            : "Nuevo servicio"}

                    </h4>





                    {(puedeGuardar || editingId) && (

                        <form onSubmit={handleSubmit}>


                            <div className="row g-3">



                                <div className="col-md-6">

                                    <label className="form-label">
                                        Cliente
                                    </label>


                                    <select

                                        className="form-select"

                                        name="id_cliente"

                                        value={form.id_cliente}

                                        onChange={handleChange}

                                        disabled={editingId !== null}

                                        required

                                    >

                                        <option value="">
                                            Seleccione cliente
                                        </option>


                                        {clientes.map(cliente => (

                                            <option

                                                key={cliente.id_cliente}

                                                value={cliente.id_cliente}

                                            >

                                                {cliente.rut} - {cliente.razon_social}

                                            </option>

                                        ))}


                                    </select>


                                </div>






                                <div className="col-md-6">

                                    <label className="form-label">
                                        Nombre servicio
                                    </label>


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

                                    <label className="form-label">
                                        Fecha inicio programada
                                    </label>


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

                                    <label className="form-label">
                                        Fecha fin programada
                                    </label>


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

                                    <label className="form-label">
                                        Estado
                                    </label>


                                    <select

                                        className="form-select"

                                        name="estado"

                                        value={form.estado}

                                        onChange={handleChange}

                                    >

                                        <option value="PENDIENTE">
                                            PENDIENTE
                                        </option>

                                        <option value="ASIGNADO">
                                            ASIGNADO
                                        </option>

                                        <option value="EN_PROCESO">
                                            EN_PROCESO
                                        </option>

                                        <option value="FINALIZADO">
                                            FINALIZADO
                                        </option>

                                        <option value="CERRADO">
                                            CERRADO
                                        </option>

                                        <option value="CANCELADO">
                                            CANCELADO
                                        </option>

                                    </select>


                                </div>






                                <div className="col-md-6">

                                    <label className="form-label">
                                        Semáforo
                                    </label>


                                    <select

                                        className="form-select"

                                        name="semaforo"

                                        value={form.semaforo}

                                        onChange={handleChange}

                                        disabled

                                    >

                                        <option value="VERDE">
                                            VERDE
                                        </option>

                                        <option value="AMARILLO">
                                            AMARILLO
                                        </option>

                                        <option value="ROJO">
                                            ROJO
                                        </option>


                                    </select>


                                </div>







                                <div className="col-12">


                                    <label className="form-label">
                                        Dirección servicio
                                    </label>


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

                                    <label className="form-label">
                                        Observaciones
                                    </label>


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


                                <button

                                    type="submit"

                                    className="btn btn-primary"

                                    disabled={saving}

                                >

                                    {saving
                                        ? "Guardando..."
                                        : "Guardar"}

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
                            Servicios registrados
                        </h4>



                        <button

                            className="btn btn-outline-primary btn-sm"

                            onClick={cargarServicios}

                            disabled={loading}

                        >

                            Actualizar

                        </button>


                    </div>







                    {loading ? (

                        <div className="text-center py-4">
                            Cargando servicios...
                        </div>


                    ) : servicios.length === 0 ? (


                        <div className="alert alert-info">
                            No hay servicios registrados.
                        </div>


                    ) : (



                        <div

                            className="table-responsive"

                            style={{

                                maxHeight: "500px",

                                overflowY: "auto"

                            }}

                        >



                            <table

                                className="table table-striped table-hover align-middle"

                                style={{

                                    minWidth:"1500px"

                                }}

                            >



                                <thead>

                                    <tr>

                                        <th>ID</th>

                                        <th>Cliente</th>

                                        <th>Servicio</th>

                                        <th>Dirección</th>

                                        <th>Inicio</th>

                                        <th>Fin</th>

                                        <th>Estado</th>

                                        <th>Semáforo</th>

                                        <th>Contrato</th>

                                        <th>Observaciones</th>

                                        <th>Acciones</th>

                                    </tr>

                                </thead>





                                <tbody>


                                    {servicios.map(servicio => (


                                        <tr key={servicio.id_servicio}>


                                            <td>
                                                {servicio.id_servicio}
                                            </td>


                                            <td>
                                                {servicio.cliente?.razon_social ?? "Sin cliente"}
                                            </td>


                                            <td>
                                                {servicio.nombre_servicio}
                                            </td>


                                            <td>
                                                {servicio.direccion_servicio}
                                            </td>


                                            <td>
                                                {new Date(servicio.fecha_inicio_programada)
                                                    .toLocaleString("es-CL")}
                                            </td>


                                            <td>
                                                {new Date(servicio.fecha_fin_programada)
                                                    .toLocaleString("es-CL")}
                                            </td>


                                            <td>
                                                {servicio.estado}
                                            </td>


                                            <td>
                                                <Semaforo estadoSemaforo={calcularSemaforo(servicio.fecha_inicio_programada, servicio.fecha_fin_programada, servicio.estado)} />
                                            </td>


                                            <td>

                                                {servicio.contrato_confirmado
                                                    ? "Sí"
                                                    : "No"}

                                            </td>


                                            <td>
                                                {servicio.observaciones || "Sin observaciones"}
                                            </td>




                                            <td>


                                                <div className="d-flex gap-2">


                                                    {puedeGuardar && (

                                                        <button

                                                            className="btn btn-sm btn-outline-primary"

                                                            onClick={() =>
                                                                editarServicio(servicio)
                                                            }

                                                            disabled={saving}

                                                        >

                                                            Editar

                                                        </button>

                                                    )}






                                                    {puedeEliminar && (

                                                        <button

                                                            className="btn btn-sm btn-outline-danger"

                                                            onClick={() =>
                                                                eliminarServicio(
                                                                    servicio.id_servicio
                                                                )
                                                            }

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
    