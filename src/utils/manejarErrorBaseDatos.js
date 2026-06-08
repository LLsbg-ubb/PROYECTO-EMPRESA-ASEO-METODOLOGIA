const manejarErrorBaseDatos = (error, res) => {
    console.error(error);

    switch (error.code) {
        case "23505":
            return res.status(409).json({
                error: "Registro duplicado."
            });

        case "23503":
            return res.status(400).json({
                error: "Referencia inválida."
            });

        case "23502":
            return res.status(400).json({
                error: "Faltan campos obligatorios."
            });

        case "22007":
            return res.status(400).json({
                error: "Formato de fecha inválido."
            });

        case "22P02":
            return res.status(400).json({
                error: "Formato de datos inválido."
            });

        default:
            return res.status(500).json({
                error: "Error interno del servidor."
            });
    }
};

module.exports = manejarErrorBaseDatos;