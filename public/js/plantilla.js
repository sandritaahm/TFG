document.addEventListener("DOMContentLoaded", function () {
    const fichaForm = document.getElementById("ficha-form");
    const addQuestionButton = document.getElementById("add-question");
    const questionsContainer = document.getElementById("questions-container");
    const successModal = document.getElementById("success-modal");
    const modalOverlay = document.getElementById("modal-overlay");
    const closeModalButton = document.getElementById("close-modal");
    const fichaButtonsContainer = document.getElementById("ficha-buttons-container");
    const exitButton = document.getElementById("exit-button");
    const saveChangesButton = document.getElementById("save-changes-button");  // Nuevo botón de guardar cambios
    
    let questions = [];
    let editingFichaIndex = null; // Para almacenar el índice de la ficha que estamos editando


    // Mostrar las fichas guardadas al cargar la página
    updateFichaButtons();

    // Botón de cancelar edición
    const cancelEditButton = document.getElementById("cancel-edit-button");

    // Evento para cancelar la edición
    cancelEditButton.addEventListener("click", function () {
    cancelEdit();
    });

    // Función para cancelar la edición
    function cancelEdit() {
        resetForm(); // Limpiar el formulario y salir del modo edición
        editingFichaIndex = null; // Resetear el índice de edición
        cancelEditButton.style.display = "none"; // Ocultar el botón de cancelar
    }

    addQuestionButton.addEventListener("click", function () {
        addQuestion();
    });

    fichaForm.addEventListener("submit", function (event) {
        event.preventDefault();
        if (editingFichaIndex !== null) {
            updateFicha();  // Guardar cambios si estamos editando
        } else {
            saveFicha();  // Guardar una nueva ficha
        }
    });

    closeModalButton.addEventListener("click", function () {
        closeModal();
    });

    exitButton.addEventListener("click", function () {
        window.location.href = "index.html"; // Volver a la página principal
    });

    saveChangesButton.addEventListener("click", function () {
        updateFicha(); // Guardar cambios si estamos editando
    });

  // Función para agregar preguntas
  function addQuestion() {
    const questionIndex = questions.length;
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("question-container");

    questionDiv.innerHTML = `
        <div class="question-header">
            <button type="button" class="toggle-question">➕</button>
            <label>Pregunta ${questionIndex + 1}</label>
        </div>
        <div class="question-content">
            <hr>
            <label>Pregunta:</label>
            <input type="text" class="question-text" placeholder="Escribe la pregunta" required>

            <label>Imagen (opcional):</label>
            <input type="file" class="question-image-input" accept="image/*">
            <div class="image-preview"></div>

            <label>Tipo de respuesta:</label>
            <select class="answer-type">
                <option value="" selected disabled>Selecciona un tipo</option>
                <option value="text">Texto</option>
                <option value="multiple-choice">Opción múltiple</option>
                <option value="checkbox-multiple">Checkboxes</option>
                <option value="range">Rango</option>
            </select>

            <div class="answer-container"></div>

            <button type="button" class="remove-question">Eliminar Pregunta</button>
        </div>
    `;

    // Manejo de plegado/desplegado
    const toggleButton = questionDiv.querySelector(".toggle-question");
    const questionContent = questionDiv.querySelector(".question-content");

    toggleButton.addEventListener("click", function () {
        if (questionContent.style.display === "none") {
            questionContent.style.display = "block";
            toggleButton.textContent = "➖"; // Ícono para ocultar
        } else {
            questionContent.style.display = "none";
            toggleButton.textContent = "➕"; // Ícono para mostrar
        }
    });

    // Inicialmente ocultar el contenido de la pregunta
    questionContent.style.display = "none";

    // Manejo de imagen
    const imageInput = questionDiv.querySelector(".question-image-input");
    const imagePreview = questionDiv.querySelector(".image-preview");

    imageInput.addEventListener("change", function () {
        const file = imageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" width="100" alt="Imagen de la pregunta">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // Actualizar contenedor de respuestas cuando cambia el tipo
    questionDiv.querySelector(".answer-type").addEventListener("change", function () {
        updateAnswerContainer(questionDiv);
    });

    // Eliminar pregunta
    questionDiv.querySelector(".remove-question").addEventListener("click", function () {
        questionsContainer.removeChild(questionDiv);
        questions = questions.filter((_, index) => index !== questionIndex);
    });

    questionsContainer.appendChild(questionDiv);
    questions.push(questionDiv);
}



// Actualizamos la opción del select para que tenga "Checkboxes" en lugar de "Opción múltiple"
function updateAnswerContainer(questionDiv) {
    const answerContainer = questionDiv.querySelector(".answer-container");
    const answerType = questionDiv.querySelector(".answer-type").value;
    answerContainer.innerHTML = ""; // Limpiar contenido previo

    if (answerType === "text") {
        answerContainer.innerHTML = `
            <label>Respuesta Correcta:</label>
            <input type="text" class="correct-answer" placeholder="Escribe la respuesta correcta" required>
        `;
    } else if (answerType === "multiple-choice") {  // "Opción múltiple" - radio buttons, solo una respuesta correcta
        answerContainer.innerHTML = `
            <label>Opciones:</label>
            <div class="options-container"></div>
            <button type="button" class="add-option">Añadir opción</button>
        `;

        const optionsContainer = answerContainer.querySelector(".options-container");
        const addOptionButton = answerContainer.querySelector(".add-option");

        addOptionButton.addEventListener("click", function () {
            const optionDiv = document.createElement("div");
            // Usamos radio buttons para opción múltiple
            optionDiv.innerHTML = `
                <input type="text" class="option-text" placeholder="Escribe una opción" required>
                <input type="radio" name="correct-option-${questions.indexOf(questionDiv)}">
                <button type="button" class="remove-option">X</button>
            `;
            optionsContainer.appendChild(optionDiv);

            // Eliminar opción
            optionDiv.querySelector(".remove-option").addEventListener("click", function () {
                optionsContainer.removeChild(optionDiv);
            });
        });
    } else if (answerType === "checkbox-multiple") {  // "Checkboxes" - checkboxes, varias respuestas correctas
        answerContainer.innerHTML = `
            <label>Opciones:</label>
            <div class="options-container"></div>
            <button type="button" class="add-option">Añadir opción</button>
        `;

        const optionsContainer = answerContainer.querySelector(".options-container");
        const addOptionButton = answerContainer.querySelector(".add-option");

        addOptionButton.addEventListener("click", function () {
            const optionDiv = document.createElement("div");
            // Usamos checkboxes para selection múltiple
            optionDiv.innerHTML = `
                <input type="text" class="option-text" placeholder="Escribe una opción" required>
                <input type="checkbox" name="correct-option-${questions.indexOf(questionDiv)}">
                <button type="button" class="remove-option">X</button>
            `;
            optionsContainer.appendChild(optionDiv);

            // Eliminar opción
            optionDiv.querySelector(".remove-option").addEventListener("click", function () {
                optionsContainer.removeChild(optionDiv);
            });
        });
    } else if (answerType === "range") {
        answerContainer.innerHTML = `
            <label>Selecciona un valor correcto (1 a 10):</label>
            <input type="range" class="range-answer" min="1" max="10" step="1" value="5">
            <span class="range-value">5</span>
        `;
        const rangeInput = answerContainer.querySelector(".range-answer");
        const rangeValue = answerContainer.querySelector(".range-value");

        rangeInput.addEventListener("input", function () {
            rangeValue.textContent = rangeInput.value;
        });
    }
}

// Al guardar las respuestas, asegurarnos que solo una respuesta es correcta en opción múltiple
function saveFicha() {
    const fichaName = document.getElementById("ficha-name").value.trim();
    const nivel = document.getElementById("nivel").value;
    const hasTimer = document.getElementById("enable-timer").checked;

    if (fichaName === "") {
        alert("Por favor, ingresa un nombre para la ficha.");
        return;
    }

    let fichaData = {
        name: fichaName,
        nivel: nivel,
        hasTimer: hasTimer,
        questions: []
    };

    // Seleccionamos los contenedores de preguntas
    document.querySelectorAll(".question-container").forEach((questionContainer) => {
        const questionText = questionContainer.querySelector(".question-text").value;
        const answerType = questionContainer.querySelector(".answer-type").value;
        let correctAnswer = null;
        let options = [];
        let correctAnswers = [];
        let questionImage = null;

        // Guardar imagen en Base64 si existe
        const imageInput = questionContainer.querySelector(".question-image-input");
        if (imageInput.files.length > 0) {
            const file = imageInput.files[0];
            const reader = new FileReader();
            reader.onload = function (e) {
                questionImage = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        if (answerType === "text") {
            correctAnswer = questionContainer.querySelector(".correct-answer").value;
        } else if (answerType === "multiple-choice" || answerType === "checkbox-multiple") {
            const optionInputs = questionContainer.querySelectorAll(".option-text");
            const optionChoices = questionContainer.querySelectorAll(`input[type='${answerType === "multiple-choice" ? "radio" : "checkbox"}']`);

            optionInputs.forEach((input, index) => {
                options.push(input.value);
                if (optionChoices[index].checked) {
                    correctAnswers.push(input.value);
                }
            });

            if (answerType === "multiple-choice") {
                correctAnswer = correctAnswers.length > 0 ? correctAnswers[0] : null;
            } else {
                correctAnswer = correctAnswers;
            }
        }

        fichaData.questions.push({ questionText, answerType, options, correctAnswer, questionImage });
    });

    let existingTemplates = JSON.parse(localStorage.getItem("savedTemplates")) || [];

    if (editingFichaIndex !== null) {
        existingTemplates[editingFichaIndex] = fichaData;
    } else {
        existingTemplates.push(fichaData);
    }

    localStorage.setItem("savedTemplates", JSON.stringify(existingTemplates));

    resetForm();
    updateFichaButtons();
}

// Agregar funcionalidad de mostrar y ocultar preguntas al cargar las preguntas guardadas
document.querySelectorAll(".question-container").forEach((questionContainer) => {
    const toggleButton = document.createElement("button");
    toggleButton.textContent = "➕";
    toggleButton.classList.add("toggle-question");

    const questionHeader = questionContainer.querySelector(".question-header");
    questionHeader.insertBefore(toggleButton, questionHeader.firstChild);

    const questionContent = questionContainer.querySelector(".question-content");
    questionContent.style.display = "none"; // Ocultar inicialmente

    toggleButton.addEventListener("click", function () {
        if (questionContent.style.display === "none") {
            questionContent.style.display = "block";
            toggleButton.textContent = "➖";
        } else {
            questionContent.style.display = "none";
            toggleButton.textContent = "➕";
        }
    });
});


// Función para actualizar la ficha existente 
function updateFicha() {
    const fichaName = document.getElementById("ficha-name").value.trim();
    const nivel = document.getElementById("nivel").value;
    const hasTimer = document.getElementById("enable-timer").checked;

    if (fichaName === "") {
        alert("Por favor, ingresa un nombre para la ficha.");
        return;
    }

    let fichaData = {
        name: fichaName,
        nivel: nivel,
        hasTimer: hasTimer,
        questions: []
    };

    document.querySelectorAll(".question-container").forEach((questionContainer) => {
        const questionText = questionContainer.querySelector(".question-text").value;
        const answerType = questionContainer.querySelector(".answer-type").value;
        let correctAnswer = null;
        let options = [];
        let correctAnswers = [];
        let questionImage = null;

        const imageInput = questionContainer.querySelector(".question-image-input");
        if (imageInput.files.length > 0) {
            const file = imageInput.files[0];
            const reader = new FileReader();
            reader.onload = function (e) {
                questionImage = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        if (answerType === "text") {
            correctAnswer = questionContainer.querySelector(".correct-answer").value;
        } else if (answerType === "multiple-choice" || answerType === "checkbox-multiple") {
            const optionInputs = questionContainer.querySelectorAll(".option-text");
            const optionChoices = questionContainer.querySelectorAll(`input[type='${answerType === "multiple-choice" ? "radio" : "checkbox"}']`);

            optionInputs.forEach((input, index) => {
                options.push(input.value);
                if (optionChoices[index].checked) {
                    correctAnswers.push(input.value);
                }
            });

            if (answerType === "multiple-choice") {
                correctAnswer = correctAnswers.length > 0 ? correctAnswers[0] : null;
            } else {
                correctAnswer = correctAnswers;
            }
        }

        fichaData.questions.push({ questionText, answerType, options, correctAnswer, questionImage });
    });

    let existingTemplates = JSON.parse(localStorage.getItem("savedTemplates")) || [];
    existingTemplates[editingFichaIndex] = fichaData;

    localStorage.setItem("savedTemplates", JSON.stringify(existingTemplates));

    resetForm();
    updateFichaButtons();
}

// Agregar funcionalidad de mostrar y ocultar preguntas al actualizar fichas
document.querySelectorAll(".question-container").forEach((questionContainer) => {
    const toggleButton = document.createElement("button");
    toggleButton.textContent = "➕";
    toggleButton.classList.add("toggle-question");

    const questionHeader = questionContainer.querySelector(".question-header");
    questionHeader.insertBefore(toggleButton, questionHeader.firstChild);

    const questionContent = questionContainer.querySelector(".question-content");
    questionContent.style.display = "none"; // Ocultar inicialmente

    toggleButton.addEventListener("click", function () {
        if (questionContent.style.display === "none") {
            questionContent.style.display = "block";
            toggleButton.textContent = "➖";
        } else {
            questionContent.style.display = "none";
            toggleButton.textContent = "➕";
        }
    });
});


    // Función para resetear el formulario
    function resetForm() {
        fichaForm.reset();
        questionsContainer.innerHTML = "";
        questions = [];
        editingFichaIndex = null; // Resetear el índice de edición
    }

    // Función para mostrar las fichas guardadas con los botones
    function updateFichaButtons() {
        fichaButtonsContainer.innerHTML = "";

        // Estilos para organizar las fichas en una cuadrícula de 3 columnas
        fichaButtonsContainer.style.display = "grid";
        fichaButtonsContainer.style.gridTemplateColumns = "repeat(3, 1fr)";
        fichaButtonsContainer.style.gap = "15px";
        fichaButtonsContainer.style.padding = "10px";

        const templates = JSON.parse(localStorage.getItem("savedTemplates")) || [];

        templates.forEach((ficha, index) => {
            const fichaItem = document.createElement("div");
            fichaItem.classList.add("ficha-item");

            fichaItem.style.display = "flex";
            fichaItem.style.flexDirection = "column";
            fichaItem.style.alignItems = "center";
            fichaItem.style.border = "1px solid #ddd";
            fichaItem.style.borderRadius = "8px";
            fichaItem.style.padding = "10px";
            fichaItem.style.backgroundColor = "#f9f9f9";
            fichaItem.style.boxShadow = "2px 2px 5px rgba(0, 0, 0, 0.1)";

            const fichaButton = document.createElement("button");
            fichaButton.classList.add("ficha-button");
            fichaButton.textContent = ficha.name || "Ficha sin nombre";
            fichaButton.style.width = "100%";
            fichaButton.style.padding = "10px";
            fichaButton.style.border = "none";
            fichaButton.style.borderRadius = "5px";
            fichaButton.style.backgroundColor = "#3498db";
            fichaButton.style.color = "white";
            fichaButton.style.cursor = "pointer";
            fichaButton.style.textAlign = "center";
            fichaButton.style.fontSize = "16px";
            fichaButton.style.marginBottom = "8px";

            fichaButton.addEventListener("click", function () {
                alert(`Pregunta: ${ficha.questions[0].questionText}`);
            });

            // Botones de editar y eliminar
            const buttonsGroup = document.createElement("div");
            buttonsGroup.style.display = "flex";
            buttonsGroup.style.justifyContent = "space-between";
            buttonsGroup.style.width = "100%";

            // Botón de editar (verde)
            const editButton = document.createElement("button");
            editButton.textContent = "Editar";
            editButton.style.flex = "1";
            editButton.style.marginRight = "5px";
            editButton.style.backgroundColor = "green"; // Color verde
            editButton.style.border = "none";
            editButton.style.borderRadius = "5px";
            editButton.style.color = "white";
            editButton.addEventListener("click", function () {
                // Cargar los datos de la ficha para editar
                loadFichaForEditing(index);
            });

            // Botón de eliminar (rojo)
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Eliminar";
            deleteButton.style.flex = "1";
            deleteButton.style.marginLeft = "5px";
            deleteButton.style.backgroundColor = "red"; // Color rojo
            deleteButton.style.border = "none";
            deleteButton.style.borderRadius = "5px";
            deleteButton.style.color = "white";
            deleteButton.addEventListener("click", function () {
                deleteFicha(index);
            });

            buttonsGroup.appendChild(editButton);
            buttonsGroup.appendChild(deleteButton);
            fichaItem.appendChild(fichaButton);
            fichaItem.appendChild(buttonsGroup);
            fichaButtonsContainer.appendChild(fichaItem);
        });
    }

    // Función para eliminar la ficha
    function deleteFicha(index) {
        // Obtener las fichas guardadas desde localStorage
        let existingTemplates = JSON.parse(localStorage.getItem("savedTemplates")) || [];
        
        // Eliminar la ficha del array de fichas
        existingTemplates.splice(index, 1);

        // Guardar de nuevo las fichas sin la eliminada
        localStorage.setItem("savedTemplates", JSON.stringify(existingTemplates));

        // Actualizar los botones
        updateFichaButtons();
    }

    function loadFichaForEditing(index) {
        let existingTemplates = JSON.parse(localStorage.getItem("savedTemplates")) || [];
        const fichaToEdit = existingTemplates[index];
    
        // Establecer los valores del formulario con los datos de la ficha
        document.getElementById("ficha-name").value = fichaToEdit.name;
        document.getElementById("nivel").value = fichaToEdit.nivel;
        document.getElementById("enable-timer").checked = fichaToEdit.hasTimer;
    
        // Limpiar preguntas existentes en el formulario y agregar las preguntas de la ficha
        questionsContainer.innerHTML = "";
        questions = [];
        editingFichaIndex = index; // Guardar el índice de la ficha que estamos editando
    
        // Agregar las preguntas de la ficha al formulario
        fichaToEdit.questions.forEach((question, questionIndex) => {
            // Crear el contenedor principal de la pregunta
            const questionContainer = document.createElement("div");
            questionContainer.classList.add("question-container");
    
            // Crear el encabezado de la pregunta con el botón y el texto centrado
            const questionHeader = document.createElement("div");
            questionHeader.classList.add("question-header");
    
            // Botón para plegar/desplegar
            const toggleButton = document.createElement("button");
            toggleButton.textContent = "➕";
            toggleButton.classList.add("toggle-question");
    
            // Texto de la pregunta centrado
            const questionTitle = document.createElement("span");
            questionTitle.classList.add("question-title");
            questionTitle.textContent = `Pregunta ${questionIndex + 1}`;
    
            // Agregar elementos al encabezado
            questionHeader.appendChild(toggleButton);
            questionHeader.appendChild(questionTitle);
    
            // Contenedor de contenido de la pregunta
            const questionContent = document.createElement("div");
            questionContent.classList.add("question-content");
            questionContent.style.display = "none"; // Ocultar inicialmente
    
            questionContent.innerHTML = `
                <hr>
                <label>Pregunta:</label>
                <input type="text" class="question-text" placeholder="Escribe la pregunta" value="${question.questionText}" required>
    
                <label>Imagen (opcional):</label>
                <input type="file" class="question-image-input" accept="image/*">
                <div class="image-preview">${question.questionImage ? `<img src="${question.questionImage}" width="100" alt="Imagen de la pregunta">` : ""}</div>
    
                <label>Tipo de respuesta:</label>
                <select class="answer-type">
                    <option value="text" ${question.answerType === "text" ? "selected" : ""}>Texto</option>
                    <option value="multiple-choice" ${question.answerType === "multiple-choice" ? "selected" : ""}>Opción múltiple</option>
                    <option value="checkbox-multiple" ${question.answerType === "checkbox-multiple" ? "selected" : ""}>Selección múltiple</option>
                    <option value="range" ${question.answerType === "range" ? "selected" : ""}>Rango</option>
                </select>
    
                <div class="answer-container"></div>
                <button type="button" class="remove-question">Eliminar Pregunta</button>
            `;
    
            // Funcionalidad para plegar/desplegar
            toggleButton.addEventListener("click", function () {
                if (questionContent.style.display === "none") {
                    questionContent.style.display = "block";
                    toggleButton.textContent = "➖";
                } else {
                    questionContent.style.display = "none";
                    toggleButton.textContent = "➕";
                }
            });
    
            // Manejo de imagen
            const imageInput = questionContent.querySelector(".question-image-input");
            const imagePreview = questionContent.querySelector(".image-preview");
    
            imageInput.addEventListener("change", function () {
                const file = imageInput.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        imagePreview.innerHTML = `<img src="${e.target.result}" width="100" alt="Imagen de la pregunta">`;
                    };
                    reader.readAsDataURL(file);
                }
            });
    
            // Actualizar contenedor de respuestas
            updateAnswerContainer(questionContent);
    
            // Si es de opción múltiple o selección múltiple, agregar las opciones
            if (question.answerType === "multiple-choice" || question.answerType === "checkbox-multiple") {
                const answerContainer = questionContent.querySelector(".answer-container");
                const optionsContainer = document.createElement("div");
                optionsContainer.classList.add("options-container");
    
                question.options.forEach((option, optionIndex) => {
                    const optionDiv = document.createElement("div");
    
                    optionDiv.innerHTML = `
                        <input type="text" class="option-text" value="${option}" required>
                        <input type="${question.answerType === 'multiple-choice' ? 'radio' : 'checkbox'}"
                               name="question-${questionIndex}"  
                               value="${option}"
                               ${question.answerType === 'multiple-choice' ? (question.correctAnswer === option ? "checked" : "") : (question.correctAnswer.includes(option) ? "checked" : "")}>
                        <button type="button" class="remove-option">X</button>
                    `;
    
                    optionsContainer.appendChild(optionDiv);
    
                    // Eliminar opción
                    optionDiv.querySelector(".remove-option").addEventListener("click", function () {
                        optionsContainer.removeChild(optionDiv);
                    });
                });
    
                answerContainer.appendChild(optionsContainer);
            }
    
            // Si es una pregunta de rango, establecer el valor
            if (question.answerType === "range") {
                questionContent.querySelector(".range-answer").value = question.correctAnswer;
                questionContent.querySelector(".range-value").textContent = question.correctAnswer;
            }
    
            // Eliminar pregunta
            questionContent.querySelector(".remove-question").addEventListener("click", function () {
                questionsContainer.removeChild(questionContainer);
                questions = questions.filter((_, i) => i !== questions.indexOf(questionContent));
            });
    
            // Añadir el encabezado y contenido al contenedor de la pregunta
            questionContainer.appendChild(questionHeader);
            questionContainer.appendChild(questionContent);
            questionsContainer.appendChild(questionContainer);
            questions.push(questionContainer);
        });
    
        // Mostrar el botón de cancelar edición
        cancelEditButton.style.display = "inline-block";
    }
    
    
    
    // Inicializar la vista con las fichas guardadas
    updateFichaButtons();
});
