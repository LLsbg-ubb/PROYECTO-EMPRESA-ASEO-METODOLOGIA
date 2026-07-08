import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";


const initialForm = {
    nombre: ""
};


function getErrorMessage(error, fallback) {
    return error.response?.data?.error ?? fallback;
}



export default function Especializaciones() {


    const navigate = useNavigate();

    const { rol } = useAuth();



    const [especializaciones, setEspecializaciones] = useState([]);

    const [form, setForm] = useState(initialForm);

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");





    const puedeGuardar =
        rol === "ADMINISTRATIVO";


    const puedeEliminar =
        rol === "ADMINISTRATIVO";





    const totalEspecializaciones = useMemo(
        () => especializaciones.length,
        [especializaciones]
    );








    async function cargarEspecializaciones() {


        setLoading(true);

        setError("");



        try {


            const response =
                await api.get("/especializaciones");


            setEspecializaciones(
                response.data
            );



        }
        catch (err) {


            setError(
                getErrorMessage(
                    err,
                    "No fue posible cargar el modulo de especializaciones."
                )
            );


        }
        finally {

            setLoading(false);

        }


    }







    useEffect(() => {

        cargarEspecializaciones();

    }, []);







    const handleChange = (event) => {


        const {
            name,
            value
        } = event.target;



        setForm(
            currentForm => ({

                ...currentForm,

                [name]: value

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

            nombre:
                form.nombre.trim()

        };



        try {



            if (editingId) {


                await api.put(

                    `/especializaciones/${editingId}`,

                    payload

                );


                setMessage(
                    "Especialización actualizada correctamente."
                );


            }
            else {


                await api.post(

                    "/especializaciones",

                    payload

                );


                setMessage(
                    "Especialización registrada correctamente."
                );


            }





            resetForm();


            await cargarEspecializaciones();





        }
        catch(err) {


            setError(

                getErrorMessage(

                    err,

                    "No fue posible guardar la especialización."

                )

            );


        }
        finally {

            setSaving(false);

        }


    };







    const editarEspecializacion = (especializacion) => {


        setEditingId(
            especializacion.id_especializacion
        );



        setForm({

            nombre:
                especializacion.nombre ?? ""

        });



        setMessage("");

        setError("");



        window.scrollTo({

            top:0,

            behavior:"smooth"

        });


    };








    const eliminarEspecializacion = async (idEspecializacion) => {


        const confirmar =
            window.confirm(
                "¿Desea eliminar esta especialización?"
            );



        if (!confirmar) {

            return;

        }



        setSaving(true);

        setError("");

        setMessage("");



        try {



            await api.delete(

                `/especializaciones/${idEspecializacion}`

            );



            setMessage(
                "Especialización eliminada correctamente."
            );



            await cargarEspecializaciones();




        }
        catch(err) {


            setError(

                getErrorMessage(

                    err,

                    "No fue posible eliminar la especialización."

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
                        Modulo de Especializaciones
                    </h1>


                    <p className="text-muted mb-0">
                        Administración de especializaciones disponibles para trabajadores.
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
                                Especializaciones
                            </h5>


                            <p className="display-6 mb-0">

                                {totalEspecializaciones}

                            </p>


                        </div>


                    </div>


                </div>


            </div>








            <div className="card shadow mb-4">


                <div className="card-body">



                    <h4 className="card-title mb-3">


                        {editingId

                            ? "Editar especialización"

                            : "Nueva especialización"

                        }


                    </h4>







                    {!puedeGuardar && (

                        <div className="alert alert-info">

                            Solo los usuarios administrativos pueden crear, editar o eliminar especializaciones.

                        </div>

                    )}








                    {puedeGuardar && (


                        <form onSubmit={handleSubmit}>


                            <div className="row g-3">


                                <div className="col-md-6">


                                    <label className="form-label">

                                        Nombre

                                    </label>



                                    <input


                                        type="text"


                                        className="form-control"


                                        name="nombre"


                                        value={form.nombre}


                                        onChange={handleChange}


                                        placeholder="Ej: Electricidad"


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

                                        : "Guardar"

                                    }


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

                            Especializaciones registradas

                        </h4>





                        <button


                            className="btn btn-outline-primary btn-sm"


                            onClick={cargarEspecializaciones}


                            disabled={loading}


                        >

                            Actualizar

                        </button>



                    </div>








                    {loading ? (


                        <div className="text-center py-4">

                            Cargando especializaciones...

                        </div>




                    ) : especializaciones.length === 0 ? (



                        <div className="alert alert-info">

                            No hay especializaciones registradas.

                        </div>





                    ) : (




                        <div

                            className="table-responsive"

                            style={{

                                maxHeight:"400px",

                                overflowY:"auto"

                            }}

                        >




                            <table className="table table-striped table-hover align-middle">



                                <thead>


                                    <tr>

                                        <th>ID</th>

                                        <th>Nombre</th>

                                        <th>Acciones</th>


                                    </tr>


                                </thead>






                                <tbody>



                                    {especializaciones.map(

                                        (especializacion) => (



                                            <tr

                                                key={
                                                    especializacion.id_especializacion
                                                }

                                            >



                                                <td>

                                                    {
                                                        especializacion.id_especializacion
                                                    }

                                                </td>




                                                <td>


                                                    <strong>

                                                        {
                                                            especializacion.nombre
                                                        }

                                                    </strong>


                                                </td>







                                                <td>



                                                    <div className="d-flex gap-2">





                                                        {puedeGuardar && (



                                                            <button


                                                                className="btn btn-sm btn-outline-primary"


                                                                onClick={() =>
                                                                    editarEspecializacion(
                                                                        especializacion
                                                                    )
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
                                                                    eliminarEspecializacion(
                                                                        especializacion.id_especializacion
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




                                        )

                                    )}



                                </tbody>



                            </table>



                        </div>




                    )}



                </div>



            </div>




        </div>


    );

}