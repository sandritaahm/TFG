document.addEventListener("DOMContentLoaded", function () {
    const fichaListContainer = document.getElementById("ficha-list-container");
    const nivelSelection = document.getElementById("nivel-selection");
    const btnInfantil = document.getElementById("nivel-infantil");
    const btnPrimaria = document.getElementById("nivel-primaria");
    const exitButton = document.getElementById("exit-button");
    let timer;
    let timeRemaining = 120;
    const templates = JSON.parse(localStorage.getItem("savedTemplates")) || [];

    function mostrarFichasPorNivel(nivel) {
        fichaListContainer.innerHTML = "";
        fichaListContainer.style.display = "block";
        nivelSelection.style.display = "none";

        const fichasFiltradas = templates.filter(ficha => ficha.nivel === nivel);

        if (fichasFiltradas.length === 0) {
            fichaListContainer.innerHTML = "<p>No hay fichas para este nivel.</p>";
            return;
        }

        fichasFiltradas.forEach((ficha) => {
            const fichaButton = document.createElement("button");
            fichaButton.classList.add("ficha-button");
            fichaButton.textContent = ficha.name || "Ficha sin nombre";

            if (ficha.hasTimer) {
                const timerIcon = document.createElement("span");
                timerIcon.innerHTML = "⏳";
                timerIcon.style.marginLeft = "8px";
                fichaButton.appendChild(timerIcon);
            }

            fichaButton.addEventListener("click", function () {
                mostrarPreguntasFicha(ficha);
            });
            fichaListContainer.appendChild(fichaButton);
        });
    }


    function mostrarPreguntasFicha(ficha) {
        fichaListContainer.innerHTML = "";
        const fichaContainer = document.createElement("div");
        fichaContainer.classList.add("ficha-container");

        if (ficha.hasTimer) {
            const timerContainer = document.createElement("div");
            timerContainer.classList.add("timer-container");
            timerContainer.innerHTML = `<p style="font-size: 28px; font-weight: bold; color: red; background-color: yellow; padding: 10px; border-radius: 10px; text-align: center;">⏳ Tiempo restante: <span id="timer">${timeRemaining}</span> segundos</p>`;
            fichaContainer.prepend(timerContainer);

            clearInterval(timer);
            timeRemaining = 120;
            
            timer = setInterval(function () {
                timeRemaining--;
                document.getElementById("timer").textContent = timeRemaining;
            
                if (timeRemaining <= 0) {
                    clearInterval(timer);
                    mostrarModal("Tiempo agotado", "¿Quieres continuar donde lo dejaste?", ficha, true);
                }
            }, 1000);

            
            
        }


        ficha.questions.forEach((pregunta, index) => {
            const questionContainer = document.createElement("div");
            questionContainer.classList.add("question-container");

            const questionElement = document.createElement("div");
            questionElement.classList.add("question");
            questionElement.id = `pregunta-container-${index}`;
            questionElement.innerHTML = `<p>${index + 1}) ${pregunta.questionText || "Pregunta sin texto"}</p>`;

            if (pregunta.questionImage) {
                const imageElement = document.createElement("img");
                imageElement.src = pregunta.questionImage;
                imageElement.alt = "Imagen de la pregunta";
                imageElement.style.maxWidth = "200px";
                questionElement.appendChild(imageElement);
            }

            if (pregunta.answerType === "multiple-choice" || pregunta.answerType === "checkbox-multiple") {
                renderMultipleChoice(pregunta, questionElement, index);
            } else if (pregunta.answerType === "range") {
                renderRange(pregunta, questionElement, index);
            } else {
                renderTextInput(pregunta, questionElement, index);
            }

            questionContainer.appendChild(questionElement);
            fichaContainer.appendChild(questionContainer);
        });

        const submitButton = document.createElement("button");
        submitButton.textContent = "Enviar Respuestas";
        submitButton.addEventListener("click", function () {
            clearInterval(timer);
            validarRespuestas(ficha);
        });

        fichaContainer.appendChild(submitButton);
        fichaListContainer.appendChild(fichaContainer);
    }

    function validarRespuestas(ficha) {
        let todasCorrectas = true;
        let respuestasIncorrectas = 0;
    
        ficha.questions.forEach((pregunta, index) => {
            const preguntaContainer = document.getElementById(`pregunta-container-${index}`);
            let respuestaAlumno;
    
            if (pregunta.answerType === "multiple-choice" || pregunta.answerType === "checkbox-multiple") {
                const opciones = document.querySelectorAll(`input[name="pregunta-${index}"]:checked`);
                respuestaAlumno = Array.from(opciones).map(opcion => opcion.value);
            } else if (pregunta.answerType === "range") {
                const rangoInput = document.getElementById(`pregunta-${index}-range`);
                respuestaAlumno = rangoInput ? parseInt(rangoInput.value) : null;
            } else {
                const inputTexto = document.getElementById(`pregunta-${index}`);
                respuestaAlumno = inputTexto ? inputTexto.value : "";
            }
    
            const esCorrecta = compararRespuestas(respuestaAlumno, pregunta.correctAnswer, pregunta.answerType);
    
            if (esCorrecta) {
                preguntaContainer.style.backgroundColor = "#d4edda";
                preguntaContainer.style.border = "2px solid #28a745";
            } else {
                preguntaContainer.style.backgroundColor = "#f8d7da";
                preguntaContainer.style.border = "2px solid #dc3545";
                todasCorrectas = false;
                respuestasIncorrectas++;  // Contar respuestas incorrectas
            }
        });
    
        if (todasCorrectas && timeRemaining > 0) {
            mostrarModal("¡Enhorabuena!", "Ficha superada 🎉", null);
        } else {
            mostrarModal("Ficha no superada", `Has tenido ${respuestasIncorrectas} respuestas incorrectas. ¿Quieres intentarlo de nuevo?`, ficha);
        }
    }
    
    function mostrarModal(titulo, mensaje, ficha, continuar = false) { 
        const modalOverlay = document.createElement("div");
        modalOverlay.classList.add("modal-overlay");
    
        const modalContainer = document.createElement("div");
        modalContainer.classList.add("modal");
    
        // Icono superior, 🎉 para "¡Enhorabuena!", ⏳ para "Tiempo agotado", ❌ para "Ficha no superada"
        const modalIcon = document.createElement("div");
        modalIcon.classList.add("modal-icon");
        modalIcon.style.fontSize = "50px"; // Aumenta el tamaño del icono superior
        modalIcon.innerHTML = titulo.includes("¡Enhorabuena!") ? "🎉" : titulo.includes("agotado") ? "⏳" : "❌";
    
        const modalTitle = document.createElement("h2");
        modalTitle.textContent = titulo;
        modalTitle.classList.add("modal-title");
    
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("modal-buttons");
    
        // Si el modal es "¡Enhorabuena!", solo mostramos el botón de "✅" para ir a alumno.html
        if (titulo.includes("¡Enhorabuena!")) {
            const okButton = document.createElement("button");
            okButton.innerHTML = "<span style='font-size: 30px;'>✅</span>"; // Icono más grande
            okButton.classList.add("modal-button");
            okButton.style.backgroundColor = "white";
            okButton.style.border = "2px solid black";
            okButton.style.color = "black";
            okButton.style.padding = "15px";
            okButton.style.borderRadius = "10px";
            okButton.style.fontSize = "24px";
            okButton.style.cursor = "pointer";
            okButton.style.boxShadow = "2px 2px 5px rgba(0, 0, 0, 0.3)";
    
            okButton.onclick = function () {
                document.body.removeChild(modalOverlay);
                window.location.href = "alumno.html"; // Redirige a la pantalla de alumno.html
            };
    
            buttonContainer.appendChild(okButton);
        } else {
            // Si es "Ficha no superada", cambiamos el botón ❌ por "🔙" (volver atrás)
            const retryButton = document.createElement("button");
            retryButton.innerHTML = "<span style='font-size: 30px;'>🔄</span>"; // Icono más grande
            retryButton.classList.add("modal-button");
            retryButton.style.backgroundColor = "white";
            retryButton.style.border = "2px solid black";
            retryButton.style.color = "black";
            retryButton.style.padding = "15px";
            retryButton.style.borderRadius = "10px";
            retryButton.style.fontSize = "24px";
            retryButton.style.cursor = "pointer";
            retryButton.style.boxShadow = "2px 2px 5px rgba(0, 0, 0, 0.3)";
    
            retryButton.onclick = function () {
                document.body.removeChild(modalOverlay);
                reiniciarFicha(ficha);
            };
    
            const backButton = document.createElement("button");
            backButton.innerHTML = "<span style='font-size: 30px;'>🔙</span>"; // Icono más grande
            backButton.classList.add("modal-button");
            backButton.style.backgroundColor = "white";
            backButton.style.border = "2px solid black";
            backButton.style.color = "black";
            backButton.style.padding = "15px";
            backButton.style.borderRadius = "10px";
            backButton.style.fontSize = "24px";
            backButton.style.cursor = "pointer";
            backButton.style.boxShadow = "2px 2px 5px rgba(0, 0, 0, 0.3)";
    
            backButton.onclick = function () {
                document.body.removeChild(modalOverlay);
                window.location.href = "alumno.html"; // Redirige a la pantalla de alumno.html
            };
    
            buttonContainer.appendChild(retryButton);
            buttonContainer.appendChild(backButton);
        }
    
        modalContainer.appendChild(modalIcon);
        modalContainer.appendChild(modalTitle);
        modalContainer.appendChild(buttonContainer);
        modalOverlay.appendChild(modalContainer);
        document.body.appendChild(modalOverlay);
    }
        
    
    function reiniciarFicha(ficha) {
        timeRemaining = 120; // Reiniciar el tiempo
        clearInterval(timer);
        
        timer = setInterval(function () {
            timeRemaining--;
            document.getElementById("timer").textContent = timeRemaining;
    
            if (timeRemaining <= 0) {
                clearInterval(timer);
                mostrarModal("Tiempo agotado", "¿Quieres intentarlo de nuevo?", ficha);
            }
        }, 1000);
    
        mostrarPreguntasFicha(ficha); // Volver a mostrar la ficha desde cero
    }
    
    function continuarFicha(ficha) {
        timeRemaining = 120; // Reiniciar el temporizador a 120 segundos
        clearInterval(timer); // Detener el temporizador actual
    
        // Reiniciar el temporizador desde 120 segundos
        timer = setInterval(function () {
            timeRemaining--;
            document.getElementById("timer").textContent = timeRemaining;
    
            if (timeRemaining <= 0) {
                clearInterval(timer);
                mostrarModal("Tiempo agotado", "¿Quieres intentarlo de nuevo?", ficha);
            }
        }, 1000);
    
        // No se llama a `mostrarPreguntasFicha(ficha)` para evitar reiniciar las respuestas
    }
    
    
    

    function compararRespuestas(respuestaAlumno, respuestaCorrecta, tipoPregunta) {
        if (tipoPregunta === "checkbox-multiple") {
            // Asegurar que ambas respuestas sean arrays y comparar sin importar el orden
            if (!Array.isArray(respuestaAlumno) || !Array.isArray(respuestaCorrecta)) {
                return false;
            }
            const alumnoSet = new Set(respuestaAlumno.map(String));
            const correctaSet = new Set(respuestaCorrecta.map(String));
            return alumnoSet.size === correctaSet.size && [...alumnoSet].every(val => correctaSet.has(val));
        } else if (tipoPregunta === "multiple-choice") {
            // Convertir ambas respuestas a String para evitar problemas de tipo
            return String(respuestaAlumno).trim() === String(respuestaCorrecta).trim();
        } else if (tipoPregunta === "text") {
            const normalizarTexto = (texto) => texto.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
            // Convertir números a palabras si es necesario
            const textoNumerico = convertirNumeroAPalabra(respuestaAlumno);
            const respuestaCorrectaTexto = convertirNumeroAPalabra(respuestaCorrecta);
    
            return normalizarTexto(textoNumerico) === normalizarTexto(respuestaCorrectaTexto);
        } else if (tipoPregunta === "range") {
            return Math.abs(parseInt(respuestaAlumno) - parseInt(respuestaCorrecta)) <= 1; // Permitir margen de error ±1
        }
        return false;
    }
    

    function convertirNumeroAPalabra(valor) {
        const numerosPalabras = {
            "1": "uno", "2": "dos", "3": "tres", "4": "cuatro", "5": "cinco",
            "6": "seis", "7": "siete", "8": "ocho", "9": "nueve", "10": "diez"
        };
        return numerosPalabras[valor] || valor;
    }

    function renderMultipleChoice(pregunta, container, index) {
        const optionsContainer = document.createElement("div");
        optionsContainer.classList.add("options-container");

        pregunta.options.forEach(opcion => {
            const label = document.createElement("label");
            const input = document.createElement("input");
            input.type = pregunta.answerType === "multiple-choice" ? "radio" : "checkbox";
            input.name = `pregunta-${index}`;
            input.value = opcion;

            label.appendChild(input);
            label.appendChild(document.createTextNode(opcion));
            optionsContainer.appendChild(label);
        });

        container.appendChild(optionsContainer);
    }

    function renderRange(pregunta, container, index) {
        const rangeInput = document.createElement("input");
        rangeInput.type = "range";
        rangeInput.min = 1;
        rangeInput.max = 10;
        rangeInput.value = 5;
        rangeInput.id = `pregunta-${index}-range`;
        container.appendChild(rangeInput);
    }

    function renderTextInput(pregunta, container, index) {
        const textInput = document.createElement("input");
        textInput.type = "text";
        textInput.placeholder = "Escribe tu respuesta";
        textInput.id = `pregunta-${index}`;
        container.appendChild(textInput);
    }

    btnInfantil.addEventListener("click", () => mostrarFichasPorNivel("Infantil"));
    btnPrimaria.addEventListener("click", () => mostrarFichasPorNivel("Primaria"));
    exitButton.addEventListener("click", () => window.location.href = "index.html");
});


document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Evita que el formulario se envíe automáticamente

        // Buscar el botón correcto basado en su clase
        const submitButton = document.querySelector(".submit-button");
        if (submitButton) {
            submitButton.click();
        }
    }
});
