const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const autoresRoutes = require('./rutas/autores'); // Este es el archivo donde defines las rutas

const app = express();

dotenv.config();

// Middleware para parsear JSON y datos del formulario
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Esto sirve todos los archivos estáticos de la carpeta "public"

// Ruta para la página principal
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/index.html');
});

// Usar las rutas para manejar los endpoints de "autores"
app.use('/autores', autoresRoutes);

// Iniciar el servidor en el puerto configurado
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
