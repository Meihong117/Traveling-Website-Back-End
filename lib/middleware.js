const
    config = require('../config/config.js'),
    users = require('../app/models/users.model'),
    jwt = require('jsonwebtoken');
/**
 * authenticate based on token
 */
const isAuthenticated = function(req, res, next) {
    let token = req.get(config.get('authToken'));

    users.getIdFromToken(token, function(err, rows) {
        if (err || rows === null) {
            return res.status(401);
        }
        next();
    })
};

module.exports = {
    isAuthenticated: isAuthenticated
};
