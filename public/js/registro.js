
    // Resto del código para manejar el envío del formulario
    document.getElementById("registrationForm").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevenir que el formulario se envíe normalmente

        // Crear un objeto con los datos del formulario
        const formData = new FormData(this);

        // Convertir los datos del formulario a un objeto
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        // Enviar los datos al servidor
        fetch('/autores/registrar', {
            method: 'POST',
            body: new URLSearchParams(data),
        })
        .then(response => response.text())
        .then(data => {
            console.log('Respuesta del servidor:', data);
            alert(data);  // Muestra el mensaje del servidor en una alerta
        })
        .catch(error => {
            console.error('Error al enviar los datos:', error);
            alert('Hubo un error al registrar el usuario.');
        });
    });
    document.addEventListener("DOMContentLoaded", function () {
        const passwordInput = document.getElementById("registro-password");
        const togglePasswordButton = document.getElementById("toggleRegistroPassword");
    
        togglePasswordButton.addEventListener("click", function () {
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                togglePasswordButton.textContent = "Ocultar";
            } else {
                passwordInput.type = "password";
                togglePasswordButton.textContent = "Mostrar";
            }
        });
    });
    


