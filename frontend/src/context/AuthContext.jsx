import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");

        if (usuarioGuardado) {
            setUsuario(JSON.parse(usuarioGuardado));
        }

        setLoading(false);
    }, []);

    const login = async (correo, password) => {

        const response = await api.post("/auth/login", {
            correo,
            password
        });

        const { token, usuario } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("usuario", JSON.stringify(usuario));

        setUsuario(usuario);

        return usuario;
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        setUsuario(null);
    };

    return (
        <AuthContext.Provider
            value={{
                usuario,
                rol: usuario?.rol,
                isAuthenticated: !!usuario,
                loading,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}