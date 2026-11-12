
const API_URL = "http://127.0.0.1:8000/api/register/";

const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");

registerForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const username = document.getElementById("id_username").value.trim();
    const email = document.getElementById("id_email").value.trim();
    const password = document.getElementById("id_password").value;
    const password2 = document.getElementById("id_password2").value;

    // Check password
    if (password !== password2) {
        registerMessage.textContent = "Passwords do not match!";
        registerMessage.hidden = false;
        return;
    }

    const userData = {
        username: username,
        email: email,
        password: password
    };

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(userData)

        });

        const data = await response.json();

        if (!response.ok) {

            const errors = Object.entries(data)
                .map(([field, messages]) => {
                    return `${field}: ${
                        Array.isArray(messages) ? messages.join(", ") : messages
                    }`;
                })
                .join(" | ");

            throw new Error(errors || "Registration failed.");

        }

        registerMessage.textContent = "Registration successful!";
        registerMessage.hidden = false;

        registerForm.reset();

        console.log("Register API Response:", data);

    } catch (error) {

        registerMessage.textContent = error.message;
        registerMessage.hidden = false;

        console.error("Register Error:", error);

    }

});