const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1090459568Raxez",
    database: "pms_hotel_db",
    port: 3306
});

db.connect((error) =>{
    if (error){
        console.log("Error al conectando a MySQL:", error);
        return;
    }
    console.log("Conectado a MySQL correctamente");
});

module.exports = db;