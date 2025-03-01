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
                timerIcon.textContent = " ⏱";
                timerIcon.style.marginLeft = "10px";
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

        if (!ficha.questions || ficha.questions.length === 0) {
            fichaContainer.innerHTML = "<p>No hay preguntas en esta ficha.</p>";
            fichaListContainer.appendChild(fichaContainer);
            return;
        }

        ficha.questions.forEach((pregunta, index) => {
            const questionElement = document.createElement("div");
            questionElement.classList.add("question");
            questionElement.id = `pregunta-container-${index}`; // Se asigna ID único
            questionElement.textContent = `${index + 1}) ${pregunta.questionText || "Pregunta sin texto"}`;
            fichaContainer.appendChild(questionElement);

            if (pregunta.imagen) {
                const imageElement = document.createElement("img");
                imageElement.src = pregunta.imagen;
                imageElement.alt = "Imagen de la pregunta";
                imageElement.style.maxWidth = "200px";
                fichaContainer.appendChild(imageElement);
            }

            if (pregunta.answerType === "multiple-choice" || pregunta.answerType === "checkbox-multiple") {
                renderMultipleChoice(pregunta, fichaContainer);
            } else if (pregunta.answerType === "range") {
                renderRange(pregunta, fichaContainer);
            } else {
                renderTextInput(pregunta, fichaContainer);
            }
        });

        if (ficha.hasTimer) {
            const timerContainerFicha = document.createElement("div");
            timerContainerFicha.id = "ficha-timer";
            timerContainerFicha.style.fontSize = "1.5em";
            timerContainerFicha.style.fontWeight = "bold";
            timerContainerFicha.style.marginBottom = "10px";
            timerContainerFicha.style.color = "red";
            fichaContainer.appendChild(timerContainerFicha);
            startTimer(timerContainerFicha);
        }

        const submitButton = document.createElement("button");
        submitButton.textContent = "Enviar Respuestas";
        submitButton.addEventListener("click", function () {
            clearInterval(timer);
            validarRespuestas(ficha);
        });

        fichaContainer.appendChild(submitButton);
        fichaListContainer.appendChild(fichaContainer);
    }

    function startTimer(timerContainerFicha) {
        timeRemaining = 120;
        timerContainerFicha.textContent = `Tiempo restante: ${timeRemaining} segundos`;

        timer = setInterval(() => {
            timeRemaining--;
            timerContainerFicha.textContent = `Tiempo restante: ${timeRemaining} segundos`;

            if (timeRemaining <= 0) {
                clearInterval(timer);
                alert("Tiempo agotado.");
            }
        }, 1000);
    }

    function validarRespuestas(ficha) {
        let respuestasCorrectas = 0;

        ficha.questions.forEach((pregunta, index) => {
            const preguntaContainer = document.getElementById(`pregunta-container-${index}`); // ID único

            let respuestaAlumno = null;
            if (pregunta.answerType === "multiple-choice" || pregunta.answerType === "checkbox-multiple") {
                const opciones = document.querySelectorAll(`input[name="pregunta-${pregunta.id}"]:checked`);
                respuestaAlumno = Array.from(opciones).map(opcion => opcion.value);
            } else if (pregunta.answerType === "range") {
                const rangoInput = document.getElementById(`pregunta-${pregunta.id}-range`);
                respuestaAlumno = rangoInput ? parseInt(rangoInput.value) : null;
            } else {
                const inputTexto = document.getElementById(`pregunta-${pregunta.id}`);
                respuestaAlumno = inputTexto ? inputTexto.value.trim().toLowerCase() : "";
            }

            const esCorrecta = compararRespuestas(respuestaAlumno, pregunta.correctAnswer, pregunta.answerType);

            if (esCorrecta) {
                preguntaContainer.style.backgroundColor = "#d4edda"; // Verde claro
                preguntaContainer.style.border = "2px solid #28a745"; // Verde
                respuestasCorrectas++;
            } else {
                preguntaContainer.style.backgroundColor = "#f8d7da"; // Rojo claro
                preguntaContainer.style.border = "2px solid #dc3545"; // Rojo
            }
        });

        alert(`Respuestas correctas: ${respuestasCorrectas} de ${ficha.questions.length}`);
    }

    function compararRespuestas(respuestaAlumno, respuestaCorrecta, tipoPregunta) {
        if (tipoPregunta === "checkbox-multiple") {
            return Array.isArray(respuestaAlumno) && Array.isArray(respuestaCorrecta) &&
                   respuestaAlumno.length === respuestaCorrecta.length &&
                   respuestaAlumno.every(respuesta => respuestaCorrecta.includes(respuesta));
        }
        return respuestaAlumno == respuestaCorrecta;
    }

    function renderMultipleChoice(pregunta, container) {
        const optionsContainer = document.createElement("div");
        optionsContainer.classList.add("options");
    
        pregunta.options.forEach((opcion, index) => {
            const optionContainer = document.createElement("div");
            optionContainer.classList.add("option");
    
            const optionInput = document.createElement("input");
            optionInput.setAttribute("type", pregunta.answerType === "multiple-choice" ? "radio" : "checkbox");
            
            if (pregunta.answerType === "multiple-choice") {
                optionInput.setAttribute("name", `pregunta-${pregunta.id}`); // 'name' único para selección única
            } else {
                optionInput.setAttribute("name", `pregunta-${pregunta.id}-${index}`); // 'name' único para cada checkbox
            }
            
            optionInput.setAttribute("value", opcion);
    
            const optionLabel = document.createElement("label");
            optionLabel.textContent = opcion;
    
            optionContainer.appendChild(optionInput);
            optionContainer.appendChild(optionLabel);
            optionsContainer.appendChild(optionContainer);
        });
    
        container.appendChild(optionsContainer);
    }
    
    function renderRange(pregunta, container) {
        const rangeContainer = document.createElement("div");
        rangeContainer.classList.add("range-container");

        const rangeInput = document.createElement("input");
        rangeInput.type = "range";
        rangeInput.min = 1;
        rangeInput.max = 10;
        rangeInput.value = 5;
        rangeInput.id = `pregunta-${pregunta.id}-range`;

        const rangeValue = document.createElement("span");
        rangeValue.textContent = `Valor seleccionado: ${rangeInput.value}`;

        rangeInput.addEventListener("input", () => {
            rangeValue.textContent = `Valor seleccionado: ${rangeInput.value}`;
        });

        rangeContainer.appendChild(rangeInput);
        rangeContainer.appendChild(rangeValue);
        container.appendChild(rangeContainer);
    }

    function renderTextInput(pregunta, container) {
        const textInput = document.createElement("input");
        textInput.type = "text";
        textInput.placeholder = "Escribe tu respuesta";
        textInput.id = `pregunta-${pregunta.id}`;
        container.appendChild(textInput);
    }

    btnInfantil.addEventListener("click", () => mostrarFichasPorNivel("Infantil"));
    btnPrimaria.addEventListener("click", () => mostrarFichasPorNivel("Primaria"));
    exitButton.addEventListener("click", () => window.location.href = "index.html");
});
