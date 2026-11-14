
console.log("Questions JS loaded successfully!");

const API_URL = "http://127.0.0.1:8000/api/questions/";
const SUBMISSIONS_URL = "http://127.0.0.1:8000/api/submissions/";

const questionsList = document.getElementById("questionsList");
const difficultyFilter = document.getElementById("difficultyFilter");
const apiMessage = document.getElementById("apiMessage");

const addQuestionBtn = document.getElementById("addQuestionBtn");
const questionDialog = document.getElementById("questionDialog");
const closeDialogBtn = document.getElementById("closeDialogBtn");
const cancelDialogBtn = document.getElementById("cancelDialogBtn");

const questionForm = document.getElementById("questionForm");
const dialogTitle = document.getElementById("dialogTitle");

const questionId = document.getElementById("questionId");
const questionTitle = document.getElementById("questionTitle");
const questionDescription = document.getElementById("questionDescription");
const questionDifficulty = document.getElementById("questionDifficulty");
const sampleInput = document.getElementById("sampleInput");
const sampleOutput = document.getElementById("sampleOutput");

let allQuestions = [];
let messageTimer;


// Get authentication token
function getToken() {
    return localStorage.getItem("authToken");
}


// Show message
function showMessage(message, type = "success") {

    apiMessage.textContent = message;
    apiMessage.hidden = false;

    apiMessage.classList.remove("success", "error");
    apiMessage.classList.add(type);

    clearTimeout(messageTimer);

    messageTimer = setTimeout(function () {
        apiMessage.hidden = true;
    }, 5000);
}


// Escape HTML
function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, function (character) {

        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[character];

    });
}


// API response handling
async function getResponseData(response) {

    const text = await response.text();

    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch {
        return { message: text };
    }
}


// Load questions from backend
async function loadQuestions() {

    try {

        questionsList.innerHTML = "<p>Loading questions...</p>";

        const response = await fetch(API_URL);

        const data = await getResponseData(response);

        if (!response.ok) {
            throw new Error("Unable to load questions.");
        }

        allQuestions = Array.isArray(data) ? data : data.results || [];

        renderQuestions();

    } catch (error) {

        console.error("Questions Error:", error);

        questionsList.innerHTML = "<p>Failed to load questions.</p>";

        showMessage(error.message, "error");
    }
}


// Display questions
function renderQuestions() {

    const selectedDifficulty = difficultyFilter.value;

    const filteredQuestions = allQuestions.filter(function (question) {

        return selectedDifficulty === "All" ||
            question.difficulty === selectedDifficulty;

    });

    if (filteredQuestions.length === 0) {

        questionsList.innerHTML = `
            <div class="empty-questions">
                <h3>No Questions Available</h3>
                <p>There are no questions for this difficulty level.</p>
            </div>
        `;

        return;
    }

    questionsList.innerHTML = filteredQuestions.map(function (question) {

        const id = Number(question.id);
        const difficulty = escapeHTML(question.difficulty);

        const safeDifficulty = ["Easy", "Medium", "Hard"].includes(difficulty)
            ? difficulty.toLowerCase()
            : "easy";

        return `
            <div class="coding-question-card">

                <div class="question-content">

                    <h3>${escapeHTML(question.title)}</h3>

                    <p>${escapeHTML(question.description)}</p>

                    <span class="difficulty-badge difficulty-${safeDifficulty}">
                        ${difficulty}
                    </span>

                    <p>
                        <strong>Sample Input:</strong>
                        ${escapeHTML(question.sample_input)}
                    </p>

                    <p>
                        <strong>Sample Output:</strong>
                        ${escapeHTML(question.sample_output)}
                    </p>

                </div>

                <div class="question-actions">

                    <button
                        type="button"
                        class="edit-question-btn"
                        data-action="edit"
                        data-id="${id}">
                        Edit
                    </button>

                    <button
                        type="button"
                        class="delete-question-btn"
                        data-action="delete"
                        data-id="${id}">
                        Delete
                    </button>

                </div>

                <div class="python-editor">

                    <h3>Write Your Python Code</h3>

                    <form class="code-submit-form">

                        <input
                            type="hidden"
                            name="question_id"
                            value="${id}"
                        >

                        <textarea
                            name="submitted_code"
                            class="python-code-input"
                            placeholder="# Write your Python code here..."
                            required></textarea>

                        <button type="submit" class="submit-code-btn">
                            Submit Code
                        </button>

                    </form>

                </div>

            </div>
        `;

    }).join("");

}


// Submit Code to Backend
questionsList.addEventListener("submit", async function (event) {

    if (!event.target.matches(".code-submit-form")) {
        return;
    }

    event.preventDefault();

    const form = event.target;

    const submitButton = form.querySelector(".submit-code-btn");
    const textarea = form.querySelector("textarea");

    const id = form.querySelector(
        'input[name="question_id"]'
    ).value;

    const submittedCode = textarea.value.trim();
    const token = getToken();

    if (!token) {
        showMessage("Please login again.", "error");
        window.location.href = "/accounts/login/";
        return;
    }

    if (!submittedCode) {
        showMessage("Please write your Python code first.", "error");
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    try {

        const response = await fetch(SUBMISSIONS_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}`
            },

            body: JSON.stringify({
                question: Number(id),
                submitted_code: submittedCode
            })

        });

        const data = await getResponseData(response);

        if (!response.ok) {
            throw new Error(
                data.detail ||
                data.error ||
                data.message ||
                "Code submission failed."
            );
        }

        showMessage(
            "Your code has been submitted successfully!",
            "success"
        );

        textarea.value = "";

    } catch (error) {

        console.error("Submission Error:", error);

        showMessage(error.message, "error");

    } finally {

        submitButton.disabled = false;
        submitButton.textContent = "Submit Code";

    }

});


// Open Add Question Dialog
addQuestionBtn.addEventListener("click", function () {

    questionForm.reset();

    questionId.value = "";

    dialogTitle.textContent = "Add New Question";

    questionDialog.showModal();

});


// Close Dialog
function closeQuestionDialog() {
    questionDialog.close();
}

closeDialogBtn.addEventListener("click", closeQuestionDialog);

cancelDialogBtn.addEventListener("click", closeQuestionDialog);


// Edit and Delete Questions
questionsList.addEventListener("click", async function (event) {

    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const id = Number(button.dataset.id);
    const action = button.dataset.action;

    const token = getToken();

    if (!token) {
        showMessage("Please login again.", "error");
        window.location.href = "/accounts/login/";
        return;
    }


    // Edit Question
    if (action === "edit") {

        const question = allQuestions.find(function (item) {
            return Number(item.id) === id;
        });

        if (!question) {
            return;
        }

        questionId.value = question.id;
        questionTitle.value = question.title;
        questionDescription.value = question.description;
        questionDifficulty.value = question.difficulty;
        sampleInput.value = question.sample_input;
        sampleOutput.value = question.sample_output;

        dialogTitle.textContent = "Edit Question";

        questionDialog.showModal();

    }


    // Delete Question
    if (action === "delete") {

        const confirmed = confirm(
            "Are you sure you want to delete this question?"
        );

        if (!confirmed) {
            return;
        }

        button.disabled = true;

        try {

            const response = await fetch(`${API_URL}${id}/`, {

                method: "DELETE",

                headers: {
                    "Authorization": `Token ${token}`
                }

            });

            if (!response.ok) {
                throw new Error("Question deletion failed.");
            }

            showMessage("Question deleted successfully!", "success");

            await loadQuestions();

        } catch (error) {

            console.error("Delete Error:", error);

            showMessage(error.message, "error");

            button.disabled = false;

        }

    }

});


// Add and Update Question
questionForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const token = getToken();

    if (!token) {
        showMessage("Please login again.", "error");
        window.location.href = "/accounts/login/";
        return;
    }

    const id = questionId.value;

    const questionData = {

        title: questionTitle.value.trim(),

        description: questionDescription.value.trim(),

        difficulty: questionDifficulty.value,

        sample_input: sampleInput.value.trim(),

        sample_output: sampleOutput.value.trim()

    };

    const url = id ? `${API_URL}${id}/` : API_URL;

    const method = id ? "PATCH" : "POST";

    const saveButton = document.getElementById("saveQuestionBtn");

    saveButton.disabled = true;
    saveButton.textContent = "Saving...";

    try {

        const response = await fetch(url, {

            method: method,

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}`
            },

            body: JSON.stringify(questionData)

        });

        const data = await getResponseData(response);

        if (!response.ok) {

            throw new Error(
                JSON.stringify(data)
            );

        }

        questionDialog.close();

        questionForm.reset();

        questionId.value = "";

        showMessage(
            id
                ? "Question updated successfully!"
                : "Question added successfully!",
            "success"
        );

        await loadQuestions();

    } catch (error) {

        console.error("Save Question Error:", error);

        showMessage(error.message, "error");

    } finally {

        saveButton.disabled = false;
        saveButton.textContent = "Save Question";

    }

});


// Difficulty Filter
difficultyFilter.addEventListener("change", function () {
    renderQuestions();
});


// Initial API Call
loadQuestions();

console.log("NEW QUESTIONS JAVASCRIPT RUNNING!");
