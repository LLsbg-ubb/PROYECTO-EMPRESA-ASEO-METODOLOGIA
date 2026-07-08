import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, loading, login } = useAuth();

    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const from = location.state?.from?.pathname ?? "/";

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await login(correo, password);

            navigate(from, { replace: true });
        } catch (err) {
            setError(err.response?.data?.error ?? "No fue posible iniciar sesión.");
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="row justify-content-center align-items-center vh-100">
                    <div className="col-md-4 text-center">Cargando sesion...</div>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="container">
            <div className="row justify-content-center align-items-center vh-100">
                <div className="col-md-4">
                    <div className="card shadow">
                        <div className="card-body">
                            <h3 className="text-center mb-4">Iniciar Sesión</h3>

                            {error && <div className="alert alert-danger">{error}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Correo</label>

                                    <input
                                        type="email"
                                        className="form-control"
                                        value={correo}
                                        onChange={(e) => setCorreo(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Contraseña</label>

                                    <input
                                        type="password"
                                        className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary w-100">
                                    Ingresar
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
