import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const primaryModules = [
    {
        title: "Servicios",
        description: "Planificar, consultar y administrar los servicios de aseo.",
        path: "/servicios",
        accent: ""
    },
    {
        title: "Clientes",
        description: "Mantener la informacion comercial y de contacto.",
        path: "/clientes",
        accent: "success"
    },
    {
        title: "Trabajadores",
        description: "Gestionar disponibilidad, perfiles y asignaciones.",
        path: "/trabajadores",
        accent: "warning"
    }
];

const operationModules = [
    {
        title: "Recursos",
        description: "Administrar insumos, equipos y stock disponible.",
        path: "/recursos",
        accent: ""
    },
    {
        title: "Especializaciones",
        description: "Definir capacidades requeridas para los servicios.",
        path: "/especializaciones",
        accent: "success"
    },
    {
        title: "Especializaciones de trabajadores",
        description: "Relacionar trabajadores con sus capacidades tecnicas.",
        path: "/trabajador-especializaciones",
        accent: "warning"
    },
    {
        title: "Incidencias",
        description: "Registrar problemas, prioridades y soluciones.",
        path: "/incidencias",
        accent: "danger"
    }
];

const controlModules = [
    {
        title: "Pagos",
        description: "Registrar comprobantes y validar pagos de servicios.",
        path: "/pagos",
        accent: ""
    },
    {
        title: "Reportes",
        description: "Consultar el estado operativo y seguimiento del servicio.",
        path: "/semaforo",
        accent: "warning"
    }
];

function ModuleCard({ module }) {
    const navigate = useNavigate();

    return (
        <div className="col-md-6 col-xl-4">
            <div className="card shadow dashboard-card">
                <div className="card-body">
                    <div className={`dashboard-card-accent ${module.accent}`} />
                    <h4 className="card-title mb-0">{module.title}</h4>
                    <p className="card-text">{module.description}</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate(module.path)}
                    >
                        Ingresar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();
    const { logout, usuario, rol } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="container dashboard-shell mt-5 mb-5">
            <div className="dashboard-hero mb-4">
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                    <div>
                        <h1>Sistema de Gestion de Servicios de Aseo</h1>
                        <p className="mb-0 mt-2">
                            Panel principal para coordinar servicios, personal, recursos y control operativo.
                        </p>
                    </div>

                    <div className="d-flex flex-column align-items-lg-end gap-2">
                        <span className="badge text-bg-primary">{rol ?? "Usuario"}</span>
                        <span className="text-muted small">
                            {usuario?.nombres ? `${usuario.nombres} ${usuario.apellido_paterno ?? ""}` : "Sesion activa"}
                        </span>
                        <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                            Cerrar Sesion
                        </button>
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <div className="dashboard-section-title mb-3">Gestion principal</div>
                <div className="row g-4">
                    {primaryModules.map((module) => (
                        <ModuleCard key={module.path} module={module} />
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <div className="dashboard-section-title mb-3">Operacion y terreno</div>
                <div className="row g-4">
                    {operationModules.map((module) => (
                        <ModuleCard key={module.path} module={module} />
                    ))}
                </div>
            </div>

            <div>
                <div className="dashboard-section-title mb-3">Control y cierre</div>
                <div className="row g-4">
                    {controlModules.map((module) => (
                        <ModuleCard key={module.path} module={module} />
                    ))}
                </div>
            </div>
        </div>
    );
}
