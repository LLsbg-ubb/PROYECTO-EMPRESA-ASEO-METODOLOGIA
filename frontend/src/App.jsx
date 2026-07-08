import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard.jsx";
import Incidencias from "./pages/Incidencias.jsx";
import Recursos from "./pages/Recursos.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function ProtectedRoute({ children }) {
    const location = useLocation();
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center">Cargando sesion...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return children;
}

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/incidencias"
                element={
                    <ProtectedRoute>
                        <Incidencias />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/recursos"
                element={
                    <ProtectedRoute>
                        <Recursos />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
