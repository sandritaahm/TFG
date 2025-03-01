document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registrationForm");
    const nombreInput = document.getElementById("registro-name");
    const emailInput = document.getElementById("registro-email");
    const passwordInput = document.getElementById("registro-password");
    const submitButton = document.getElementById("registroButton");

    // Variables para determinar si el usuario comenzó a escribir
    let isNameStart = false;
    let isEmailStart = false;
    let isPasswordStart = false;

    // Validar el nombre del usuario
    function validateNombreUsuario(showError = false) {
        const errorDiv = nombreInput.nextElementSibling;
        if (isNameStart && nombreInput.value.length < 6) {
            if (showError) {
                errorDiv.textContent = "El nombre debe tener al menos 6 caracteres.";
                nombreInput.classList.add("input-error");
            }
            return false;
        } else {
            errorDiv.textContent = "";
            nombreInput.classList.remove("input-error");
            return true;
        }
    }

    // Validar el correo electrónico
    function validateEmail(showError = false) {
        const errorDiv = emailInput.nextElementSibling;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (isEmailStart && !emailPattern.test(emailInput.value)) {
            if (showError) {
                errorDiv.textContent = "Por favor, introduce un correo electrónico válido.";
                emailInput.classList.add("input-error");
            }
            return false;
        } else {
            errorDiv.textContent = "";
            emailInput.classList.remove("input-error");
            return true;
        }
    }

    // Validar la contraseña
    function validatePassword(showError = false) {
        const errorDiv = document.getElementById("passwordError"); // Usar el ID específico
        const passwordPattern = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    
        if (isPasswordStart && !passwordPattern.test(passwordInput.value)) {
            if (showError) {
                errorDiv.textContent = "La contraseña debe tener al menos 8 caracteres, una mayúscula y un carácter especial.";
                passwordInput.classList.add("input-error");
            }
            return false;
        } else {
            errorDiv.textContent = "";
            passwordInput.classList.remove("input-error");
            return true;
        }
    }
    
    

    // Activar o desactivar el botón de envío
    function toggleSubmitButton() {
        const isNombreValid = validateNombreUsuario();
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();

        submitButton.disabled = !(isNombreValid && isEmailValid && isPasswordValid);
    }

    // Validar cada campo al salir o escribir
    nombreInput.addEventListener("blur", function () {
        isNameStart = true;
        validateNombreUsuario(true);
        toggleSubmitButton();
    });

    emailInput.addEventListener("blur", function () {
        isEmailStart = true;
        validateEmail(true);
        toggleSubmitButton();
    });

    passwordInput.addEventListener("blur", function () {
        isPasswordStart = true;
        validatePassword(true);
        toggleSubmitButton();
    });

    nombreInput.addEventListener("input", function () {
        isNameStart = true;
        toggleSubmitButton();
    });

    emailInput.addEventListener("input", function () {
        isEmailStart = true;
        toggleSubmitButton();
    });

    passwordInput.addEventListener("input", function () {
        isPasswordStart = true;
        toggleSubmitButton();
    });

    // Función para manejar el evento de presionar Enter
    function handleEnterPress(currentInput, nextInput) {
        currentInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                if (nextInput) {
                    nextInput.focus();
                } else {
                    // Si es el último campo (contraseña), valida y envía
                    const isNombreValid = validateNombreUsuario(true);
                    const isEmailValid = validateEmail(true);
                    const isPasswordValid = validatePassword(true);

                    if (isNombreValid && isEmailValid && isPasswordValid) {
                        form.submit(); // Enviar el formulario
                    }
                }
            }
        });
    }

    // Asignar la lógica de Enter a cada campo
    handleEnterPress(nombreInput, emailInput);
    handleEnterPress(emailInput, passwordInput);
    handleEnterPress(passwordInput, submitButton); 

    // Enviar formulario
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const isNombreValid = validateNombreUsuario(true);
        const isEmailValid = validateEmail(true);
        const isPasswordValid = validatePassword(true);

        if (isNombreValid && isEmailValid && isPasswordValid) {
            window.location.href = "login.html"; // Redirigir al inicio de sesión
        }
    });
});
