
console.log("Questions JS loaded successfully!");

const API_URL = "http://127.0.0.1:8000/api/questions/";

const questionsList = document.getElementById("questionsList");
const difficultyFilter = document.getElementById("difficulty");
const apiMessage = document.getElementById("apiMessage");

const openAddQuestion = document.getElementById("openAddQuestion");
const questionDialog = document.getElementById("questionDialog");
const closeQuestionDialog = document.getElementById("closeQuestionDialog");

const questionForm = document.getElementById("questionForm");
const dialogTitle = document.getElementById("dialogTitle");

const questionId = document.getElementById("questionId");
const questionTitle = document.getElementById("questionTitle");
const questionDescription = document.getElementById("questionDescription");
const questionDifficulty = document.getElementById("questionDifficulty");
const sampleInput = document.getElementById("sampleInput");
const sampleOutput = document.getElementById("sampleOutput");

const csrfToken = document.querySelector(
    '#csrfTokenForm [name="csrfmiddlewaretoken"]'
)?.value;

let allQuestions = [];


// Show message
function showMessage(message) {
    apiMessage.textContent = message;
    apiMessage.hidden = false;
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


// Load questions from backend
async function loadQuestions() {
    try {
        questionsList.innerHTML = "<p>Loading questions...</p>";

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to load questions");
        }

        allQuestions = await response.json();

        renderQuestions();

    } catch (error) {
        console.error("Error:", error);

        questionsList.innerHTML = "<p>Failed to load questions.</p>";
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

                    <form method="POST"
                          action="${questionsList.dataset.submitUrl}">

                        <input
                            type="hidden"
                            name="csrfmiddlewaretoken"
                            value="${escapeHTML(csrfToken)}"
                        >

                        <input
                            type="hidden"
                            name="question_id"
                            value="${id}"
                        >

                        <input
                            type="hidden"
                            name="difficulty"
                            value="${difficulty}"
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


// Open Add Question Dialog
openAddQuestion.addEventListener("click", function () {

    questionForm.reset();

    questionId.value = "";

    dialogTitle.textContent = "Add New Question";

    questionDialog.showModal();

});


// Close Dialog
closeQuestionDialog.addEventListener("click", function () {

    questionDialog.close();

});


// Edit and Delete Questions
questionsList.addEventListener("click", async function (event) {

    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);

    const action = button.dataset.action;

    if (action === "edit") {

        const question = allQuestions.find(function (item) {
            return item.id === id;
        });

        if (!question) return;

        questionId.value = question.id;
        questionTitle.value = question.title;
        questionDescription.value = question.description;
        questionDifficulty.value = question.difficulty;
        sampleInput.value = question.sample_input;
        sampleOutput.value = question.sample_output;

        dialogTitle.textContent = "Edit Question";

        questionDialog.showModal();

    }


    if (action === "delete") {

        const confirmed = confirm(
            "Are you sure you want to delete this question?"
        );

        if (!confirmed) return;

        try {

            const response = await fetch(`${API_URL}${id}/`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error("Question deletion failed");
            }

            showMessage("Question deleted successfully!");

            await loadQuestions();

        } catch (error) {

            console.error(error);

            showMessage("Unable to delete question.");

        }

    }

});


// Add and Update Question
questionForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const id = questionId.value;

    const questionData = {

        title: questionTitle.value.trim(),

        description: questionDescription.value.trim(),

        difficulty: questionDifficulty.value,

        sample_input: sampleInput.value.trim(),

        sample_output: sampleOutput.value.trim()

    };

    const url = id ? `${API_URL}${id}/` : API_URL;

    const method = id ? "PUT" : "POST";

    try {

        const response = await fetch(url, {

            method: method,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(questionData)

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(JSON.stringify(data));
        }

        questionDialog.close();

        questionForm.reset();

        questionId.value = "";

        showMessage(
            id
                ? "Question updated successfully!"
                : "Question added successfully!"
        );

        await loadQuestions();

    } catch (error) {

        console.error(error);

        showMessage("Unable to save question. Check the entered details.");

    }

});


// Difficulty Filter
difficultyFilter.addEventListener("change", function () {

    renderQuestions();

});


// Initial API Call
loadQuestions();

console.log("NEW JAVASCRIPT CODE RUNNING!");