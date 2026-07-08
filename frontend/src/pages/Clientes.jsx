import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const initialForm = {
    rut: "",
    razon_social: "",
    nombre_contacto: "",
    telefono: "",
    correo: "",
    direccion: "",
    comuna: "",
    ciudad: ""
};

function getErrorMessage(error, fallback) {
    return error.response?.data?.error ?? fallback;
}

export default function Clientes() {

    const navigate = useNavigate();
    const { rol } = useAuth();

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


    const totalClientes = useMemo(
        () => clientes.length,
        [clientes]
    );


    async function cargarClientes() {

        setLoading(true);
        setError("");

        try {

            const response = await api.get("/clientes");

            setClientes(response.data);

        }
        catch (err) {

            setError(
                getErrorMessage(
                    err,
                    "No fue posible cargar el modulo de clientes."
                )
            );

        }
        finally {

            setLoading(false);

        }

    }



    useEffect(() => {

        cargarClientes();

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

            rut: form.rut,
            razon_social: form.razon_social,
            nombre_contacto: form.nombre_contacto,
            telefono: form.telefono,
            correo: form.correo,
            direccion: form.direccion,
            comuna: form.comuna,
            ciudad: form.ciudad

        };



        try {


            if (editingId) {

                await api.put(
                    `/clientes/${editingId}`,
                    payload
                );

                setMessage(
                    "Cliente actualizado correctamente."
                );

            }
            else {

                await api.post(
                    "/clientes",
                    payload
                );

                setMessage(
                    "Cliente registrado correctamente."
                );

            }



            resetForm();

            await cargarClientes();


        }
        catch (err) {

            setError(
                getErrorMessage(
                    err,
                    "No fue posible guardar el cliente."
                )
            );

        }
        finally {

            setSaving(false);

        }

    };





    const editarCliente = (cliente) => {


        setEditingId(cliente.id_cliente);


        setForm({

            rut: cliente.rut ?? "",
            razon_social: cliente.razon_social ?? "",
            nombre_contacto: cliente.nombre_contacto ?? "",
            telefono: cliente.telefono ?? "",
            correo: cliente.correo ?? "",
            direccion: cliente.direccion ?? "",
            comuna: cliente.comuna ?? "",
            ciudad: cliente.ciudad ?? ""

        });



        setMessage("");

        setError("");


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    };





    const eliminarCliente = async (idCliente) => {


        const confirmar = window.confirm(
            "¿Desea eliminar este cliente?"
        );


        if (!confirmar) {

            return;

        }


        setSaving(true);

        setError("");

        setMessage("");



        try {

            await api.delete(
                `/clientes/${idCliente}`
            );


            setMessage(
                "Cliente eliminado correctamente."
            );


            await cargarClientes();


        }
        catch (err) {

            setError(
                getErrorMessage(
                    err,
                    "No fue posible eliminar el cliente."
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
                        Modulo de Clientes
                    </h1>

                    <p className="text-muted mb-0">
                        Administración de clientes registrados.
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
                                Clientes
                            </h5>

                            <p className="display-6 mb-0">
                                {totalClientes}
                            </p>

                        </div>

                    </div>

                </div>

            </div>







            <div className="card shadow mb-4">

                <div className="card-body">


                    <h4 className="card-title mb-3">

                        {editingId
                            ? "Editar cliente"
                            : "Nuevo cliente"}

                    </h4>




                    {(puedeGuardar || editingId) && (

                        <form onSubmit={handleSubmit}>


                            <div className="row g-3">


                                <div className="col-md-6">
                                    <label className="form-label">
                                        RUT
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        name="rut"
                                        value={form.rut}
                                        onChange={handleChange}
                                        required
                                        disabled={editingId !== null}
                                    />
                                </div>



                                <div className="col-md-6">

                                    <label className="form-label">
                                        Razón social
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        name="razon_social"
                                        value={form.razon_social}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>



                                <div className="col-md-6">

                                    <label className="form-label">
                                        Nombre contacto
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        name="nombre_contacto"
                                        value={form.nombre_contacto}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>




                                <div className="col-md-6">

                                    <label className="form-label">
                                        Teléfono
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        name="telefono"
                                        value={form.telefono}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>




                                <div className="col-md-6">

                                    <label className="form-label">
                                        Correo
                                    </label>

                                    <input
                                        type="email"
                                        className="form-control"
                                        name="correo"
                                        value={form.correo}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>




                                <div className="col-md-6">

                                    <label className="form-label">
                                        Ciudad
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        name="ciudad"
                                        value={form.ciudad}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>




                                <div className="col-md-6">

                                    <label className="form-label">
                                        Comuna
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        name="comuna"
                                        value={form.comuna}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>




                                <div className="col-12">

                                    <label className="form-label">
                                        Dirección
                                    </label>

                                    <textarea
                                        className="form-control"
                                        name="direccion"
                                        rows="3"
                                        value={form.direccion}
                                        onChange={handleChange}
                                        required
                                    />

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
                            Clientes registrados
                        </h4>


                        <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={cargarClientes}
                            disabled={loading}
                        >

                            Actualizar

                        </button>


                    </div>







                    {loading ? (

                        <div className="text-center py-4">
                            Cargando clientes...
                        </div>


                    ) : clientes.length === 0 ? (

                        <div className="alert alert-info">
                            No hay clientes registrados.
                        </div>


                    ) : (


                        <div
                            className="table-responsive"
                            style={{
                                maxHeight: "500px",
                                overflowY: "auto",
                                overflowX: "auto"
                            }}
                        >


                            <table
                                className="table table-striped table-hover align-middle"
                                style={{
                                    minWidth: "1400px"
                                }}
                            >


                                <thead>

                                    <tr>

                                        <th>ID</th>
                                        <th>RUT</th>
                                        <th>Razón social</th>
                                        <th>Contacto</th>
                                        <th>Teléfono</th>
                                        <th>Correo</th>
                                        <th>Dirección</th>
                                        <th>Comuna</th>
                                        <th>Ciudad</th>
                                        <th>Acciones</th>

                                    </tr>

                                </thead>




                                <tbody>


                                    {clientes.map((cliente) => (


                                        <tr key={cliente.id_cliente}>


                                            <td>
                                                {cliente.id_cliente}
                                            </td>


                                            <td>
                                                {cliente.rut}
                                            </td>


                                            <td>
                                                {cliente.razon_social}
                                            </td>


                                            <td>
                                                {cliente.nombre_contacto}
                                            </td>


                                            <td>
                                                {cliente.telefono}
                                            </td>


                                            <td>
                                                {cliente.correo}
                                            </td>


                                            <td>
                                                {cliente.direccion}
                                            </td>


                                            <td>
                                                {cliente.comuna}
                                            </td>


                                            <td>
                                                {cliente.ciudad}
                                            </td>



                                            <td>

                                                <div className="d-flex flex-wrap gap-2">


                                                    {puedeGuardar && (

                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => editarCliente(cliente)}
                                                            disabled={saving}
                                                        >
                                                            Editar
                                                        </button>

                                                    )}



                                                    {puedeEliminar && (

                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => eliminarCliente(cliente.id_cliente)}
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