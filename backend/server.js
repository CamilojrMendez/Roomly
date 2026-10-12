const express = require('express');
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("./db");

// Verificar la conexión a la base de datos
db.query("SELECT DATABASE() AS base_de_datos", (error, resultado) => {
    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log("Base de datos utilizada:", resultado[0].base_de_datos);
});
//

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "API de Roomly funcionando correctamente"
    });
});

// Endpoint para crear un nuevo usuario
app.post("/api/usuarios", async (req, res) => {
    const { nombre, correo, password } = req.body;

    if (!nombre || !correo || !password) {
        return res.status(400).json({
            mensaje: "Todos los campos son obligatorios"
        });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO usuarios (nombre, correo, password)
            VALUES (?, ?, ?)
        `;

        db.query(sql, [nombre, correo, passwordHash], (error, resultado) => {
            if (error) {
                console.error(error);

                return res.status(500).json({
                    mensaje: "Error al crear el usuario"
                });
            }

            res.status(201).json({
                mensaje: "Usuario creado correctamente",
                id: resultado.insertId
            });
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: "Error en el servidor"
        });
    }
});

// Endpoint para iniciar sesión
app.post("/api/login", async (req, res) => {
    const { correo, password } = req.body;

    // 1. Validar que vengan los datos
    if (!correo || !password) {
        return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    try {
        // 2. Buscar al usuario en la base de datos por su correo
        const sql = "SELECT * FROM usuarios WHERE correo = ?";
        db.query(sql, [correo], async (error, resultados) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ mensaje: "Error en el servidor" });
            }

            // 3. Verificar si el usuario existe
            if (resultados.length === 0) {
                return res.status(401).json({ mensaje: "Correo o contraseña incorrectos" });
            }

            const usuario = resultados[0];

            // 4. Comparar la contraseña ingresada con el hash de la base de datos
            const contraseñaCorrecta = await bcrypt.compare(password, usuario.password);

            if (!contraseñaCorrecta) {
                return res.status(401).json({ mensaje: "Correo o contraseña incorrectos" });
            }

            // 5. Si todo está bien, dar acceso
            res.status(200).json({
                mensaje: "Inicio de sesión exitoso",
                usuario: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    correo: usuario.correo
                }
            });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
});


// Iniciar el servidor
app.listen(3001, () => {
    console.log("Servidor API ejecuntandose en http://localhost:3001"); 
});