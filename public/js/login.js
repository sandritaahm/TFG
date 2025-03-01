document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const togglePasswordButton = document.getElementById("toggleInicioPassword");

    // Deshabilitar el botón inicialmente
    loginButton.disabled = true;

    // Función para verificar las credenciales en el servidor
    async function checkLoginData() {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            return; // No hacer nada si los campos están vacíos
        }

        try {
            const response = await fetch('/autores/iniciar-sesion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (result.success) {
                emailError.textContent = '';
                passwordError.textContent = '';
                loginButton.disabled = false; // Habilitar el botón solo si los datos son correctos
            } else {
                // Mostrar errores específicos
                if (result.message === 'Correo no registrado') {
                    emailError.textContent = 'Este correo no está registrado.';
                } else if (result.message === 'Contraseña incorrecta') {
                    passwordError.textContent = 'Contraseña incorrecta.';
                }
                loginButton.disabled = true; // Asegurarse de deshabilitar el botón
            }
        } catch (error) {
            console.error('Error al verificar los datos:', error);
            alert('Hubo un problema al conectar con el servidor.');
        }
    }

    // Evento para verificar cuando se pierde el foco en los campos
    emailInput.addEventListener('blur', checkLoginData);
    passwordInput.addEventListener('blur', checkLoginData);

    // Limpiar errores y deshabilitar botón mientras se escriben datos
    emailInput.addEventListener('input', () => {
        emailError.textContent = '';
        loginButton.disabled = true;
    });

    passwordInput.addEventListener('input', () => {
        passwordError.textContent = '';
        loginButton.disabled = true;
    });

    // Función para manejar el evento de presionar Enter
    function handleEnterPress(currentInput, nextInput) {
        currentInput.addEventListener("keydown", async function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                if (nextInput) {
                    nextInput.focus(); // Enfocar al siguiente campo
                } else {
                    // Si está en el último campo, simular clic en el botón de inicio
                    const email = emailInput.value.trim();
                    const password = passwordInput.value.trim();

                    if (!email || !password) {
                        alert('Por favor, llena ambos campos antes de continuar.');
                        return;
                    }

                    try {
                        const response = await fetch('/autores/iniciar-sesion', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, password }),
                        });

                        const result = await response.json();

                        if (result.success) {
                            window.location.href = '/html/plantilla.html'; // Redirigir solo si es exitoso
                        } else {
                            if (result.message === 'Correo no registrado') {
                                emailError.textContent = 'Este correo no está registrado.';
                            } else if (result.message === 'Contraseña incorrecta') {
                                passwordError.textContent = 'Contraseña incorrecta.';
                            }
                        }
                    } catch (error) {
                        console.error('Error al procesar el inicio de sesión:', error);
                        alert('Hubo un problema al conectar con el servidor.');
                    }
                }
            }
        });
    }

    // Asignar la lógica de Enter entre los campos
    handleEnterPress(emailInput, passwordInput); // De email a contraseña
    handleEnterPress(passwordInput, null); // De contraseña al botón de inicio de sesión

    // Manejar el envío del formulario
    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevenir comportamiento predeterminado del formulario
    
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
    
        try {
            const response = await fetch('/autores/iniciar-sesion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
    
            const result = await response.json();
    
            if (result.success) {
                window.location.href = '/html/plantilla.html'; // Redirigir solo si es exitoso
            } else {
                if (result.message === 'Correo no registrado') {
                    emailError.textContent = 'Este correo no está registrado.';
                } else if (result.message === 'Contraseña incorrecta') {
                    passwordError.textContent = 'Contraseña incorrecta.';
                }
            }
        } catch (error) {
            console.error('Error al procesar el inicio de sesión:', error);
            alert('Hubo un problema al conectar con el servidor.');
        }
    });

    // Mostrar y ocultar contraseña
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
