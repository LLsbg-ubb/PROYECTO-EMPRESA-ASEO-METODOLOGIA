const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                error: "Token no proporcionado."
            });
        }

        const [bearer, token] = authHeader.split(" ");

        if (bearer !== "Bearer" || !token) {
            return res.status(401).json({
                error: "Formato de token inválido."
            });
        }

        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.usuario = {
            id_usuario: payload.id_usuario,
            rol: payload.rol
        };

        next();

    } catch (err) {
        return res.status(401).json({
            error: "Token inválido o expirado."
        });
    }
};

module.exports = authMiddleware;