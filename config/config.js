const convict = require('convict');

let config = convict({
    authToken: {
        format: String,
        default: 'X-Authorization'
    },
    db: {
        host: { // host, rather than hostname, as mysql connection string uses 'host'
            format: String,
            default: "mysql3.csse.canterbury.ac.nz"
        },
        user: {
            format: String,
            default: ''
        },
        password: {
            format: String,
            default: ''
        },
        database: {
            format: String,
            default: ''
        },
        multipleStatements:{
            format: Boolean,
            default: true
        }
    }
});

module.exports = config;



