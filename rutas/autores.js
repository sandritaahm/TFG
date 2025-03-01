const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../database'); // Asegúrate de que la conexión con la base de datos esté funcionando
const router = express.Router();

router.post('/registrar', async (req, res) => {
    // Log de los datos recibidos para depuración
    console.log('Datos recibidos:', req.body);

    // Desestructurar los datos del cuerpo de la solicitud
    const { nombre2: nombre, email2: email, password2: password } = req.body;

    try {
        // Validaciones básicas
        if (!nombre || !email || !password) {
            return res.status(400).send('Todos los campos son obligatorios');
        }

        // Verificar si el correo ya está registrado
        const queryCheckEmail = 'SELECT * FROM usuarios WHERE email = ?';
        db.query(queryCheckEmail, [email], async (err, results) => {
            if (err) {
                console.error('Error al verificar el correo:', err);
                return res.status(500).send('Error interno del servidor');
            }

            if (results.length > 0) {
                // Si el correo ya existe, devuelve un error
                return res.status(400).send('El correo ya está registrado');
            }

            // Encriptar la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Query para insertar el usuario en la base de datos
            const queryInsertUser = 'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)';
            db.query(queryInsertUser, [nombre, email, hashedPassword], (err, result) => {
                if (err) {
                    console.error('Error al registrar el usuario en la base de datos:', err);
                    return res.status(500).send('Error al registrar el usuario');
                }

                console.log('Usuario registrado con éxito');
                res.status(201).send('Usuario registrado con éxito');
            });
        });
    } catch (err) {
        console.error('Error al procesar el registro:', err);
        res.status(500).send('Error interno del servidor');
    }
});


router.post('/iniciar-sesion', (req, res) => {
    console.log('Datos recibidos en /iniciar-sesion:', req.body);

    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Correo y contraseña son requeridos' });
    }

    const cleanEmail = email.trim().toLowerCase(); // Limpiar y convertir el email a minúsculas
    const query = 'SELECT * FROM usuarios WHERE LOWER(email) = LOWER(?)';

    db.query(query, [cleanEmail], (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }

        console.log('Resultados de la consulta:', results);

        if (results.length === 0) {
            return res.status(400).json({ success: false, message: 'Correo no registrado' });
        }

        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error al comparar contraseñas:', err);
                return res.status(500).json({ success: false, message: 'Error interno del servidor' });
            }

            if (isMatch) {
                // Si las credenciales son correctas
                return res.status(200).json({ success: true, message: 'Inicio de sesión exitoso' });
            } else {
                // Si la contraseña no coincide
                return res.status(400).json({ success: false, message: 'Contraseña incorrecta' });
            }
        });
    });
});



module.exports = router;
