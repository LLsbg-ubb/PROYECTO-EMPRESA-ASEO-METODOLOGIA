const authService = require("../services/auth.service");

const authController = {
    login: async (req, res) => {
        try {
            const respuesta = await authService.login(req.body);
            res.status(200).json(respuesta);
        } catch (err) {
            res.status(401).json({
                error: err.message
            });
        }
    }
};

module.exports = authController;