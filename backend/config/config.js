require("dotenv").config();

const config = {
    jwt_s: process.env.JWT_SECRET || 'generatenewtoken',
    db_connect: process.env.MONGO,
    port: process.env.PORT || 5000,
    jwt_expiration: process.env.JWT_EXPIRATION || '1h',
    cookie_expiration: process.env.COOKIE_EXPIRATION_TIME || 7 * 24 * 60 * 60 * 1000,
}
module.exports = config;