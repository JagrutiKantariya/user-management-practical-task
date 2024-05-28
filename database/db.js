const mongoose = require('mongoose')
const {DB_CONN_STR} = require('../config')

const databaseConnection = async() =>{
    mongoose.connect(DB_CONN_STR)
    const db = mongoose.connection
    db.on('error',(error)=>{
        console.error('Database connection error',error)
    })
    db.on('open',(error)=>{
        console.log('Database connected successfully')
    })
}

module.exports = databaseConnection