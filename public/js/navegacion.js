document.addEventListener("DOMContentLoaded", () => {
    const alumno = document.getElementById("alumno");
    const profesor = document.getElementById("profesor");
    const registroLink = document.getElementById("registroLink");
    const loginButton = document.getElementById("loginButton");
    const registroButton = document.getElementById("registroButton");

    if (alumno) {
        alumno.addEventListener("click", () => {
            window.location.href = "/html/alumno.html";
        });
    }


    if (profesor) {
        profesor.addEventListener("click", () => {
            window.location.href = "/html/login.html";
        });
    }

    if (registroLink) {
        registroLink.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "/html/registro.html";
        });
    }

    if (loginButton) {
        loginButton.addEventListener("click", () => {
            window.location.href = "/html/plantilla.html";
        });
    }

    if (registroButton) {
        registroButton.addEventListener("click", () => {
            window.location.href = "/html/login.html";
        });
    }
});
