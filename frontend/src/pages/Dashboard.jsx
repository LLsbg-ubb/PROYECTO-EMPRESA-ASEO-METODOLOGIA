import { useNavigate } from "react-router-dom";

export default function Dashboard() {

    const navigate = useNavigate();

    return (
        <div className="container mt-5">

            <h1 className="text-center mb-5">
                Sistema de Gestión de Servicios de Aseo
            </h1>

            <div className="row g-4">

                <div className="col-md-4">
                    <div className="card shadow h-100">
                        <div className="card-body text-center">
                            <h4 className="card-title">Servicios</h4>

                            <p className="card-text">
                                Administrar los servicios de aseo.
                            </p>

                            <button
                                className="btn btn-primary"
                                onClick={() => navigate("/servicios")}
                            >
                                Ingresar
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow h-100">
                        <div className="card-body text-center">
                            <h4 className="card-title">Clientes</h4>

                            <p className="card-text">
                                Administrar los clientes.
                            </p>

                            <button
                                className="btn btn-primary"
                                onClick={() => navigate("/clientes")}
                            >
                                Ingresar
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow h-100">
                        <div className="card-body text-center">
                            <h4 className="card-title">Trabajadores</h4>

                            <p className="card-text">
                                Administrar trabajadores.
                            </p>

                            <button
                                className="btn btn-primary"
                                onClick={() => navigate("/trabajadores")}
                            >
                                Ingresar
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow h-100">
                        <div className="card-body text-center">
                            <h4 className="card-title">Recursos</h4>

                            <p className="card-text">
                                Administrar recursos e insumos.
                            </p>

                            <button
                                className="btn btn-primary"
                                onClick={() => navigate("/recursos")}
                            >
                                Ingresar
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow h-100">
                        <div className="card-body text-center">
                            <h4 className="card-title">Especializaciones</h4>

                            <p className="card-text">
                                Administrar especializaciones.
                            </p>

                            <button
                                className="btn btn-primary"
                                onClick={() => navigate("/especializaciones")}
                            >
                                Ingresar
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow h-100">
                        <div className="card-body text-center">
                            <h4 className="card-title">Incidencias</h4>

                            <p className="card-text">
                                Consultar y administrar incidencias.
                            </p>

                            <button
                                className="btn btn-primary"
                                onClick={() => navigate("/incidencias")}
                            >
                                Ingresar
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card shadow h-100">
                        <div className="card-body text-center">
                            <h4 className="card-title">Pagos</h4>

                            <p className="card-text">
                                Administrar pagos de los servicios.
                            </p>

                            <button
                                className="btn btn-primary"
                                onClick={() => navigate("/pagos")}
                            >
                                Ingresar
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card shadow h-100">
                        <div className="card-body text-center">

                            <h4 className="card-title">
                                Reportes
                            </h4>

                            <p className="card-text">
                                Consultar y generar reportes del sistema.
                            </p>

                            <button
                                className="btn btn-primary"
                                onClick={() => navigate("/reportes")}
                            >
                                Ingresar
                            </button>

                        </div>
                    </div>
                </div>
            
                <div className="row justify-content-center mt-4">
                    <div className="col-md-6">
                        <div className="card shadow h-100">
                            <div className="card-body text-center">
                                <h4 className="card-title">Cerrar Sesión</h4>

                                <p className="card-text">
                                    Salir del sistema.
                                </p>

                                <button className="btn btn-danger">
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </div>
                </div>              

            </div>

        </div>
    );
}