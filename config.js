require('dotenv').config()
const configSchema = {
    PORT : process.env.PORT,
    DB_CONN_STR : process.env.DB_CONN_STR
}

module.exports = configSchema