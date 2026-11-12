
const API_URL = "http://127.0.0.1:8000/api/login/";

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("id_username").value.trim();
    const password = document.getElementById("id_password").value;

    const userData = {
        username: username,
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
            throw new Error(
                data.non_field_errors?.[0] ||
                data.detail ||
                "Invalid username or password."
            );
        }

        // Save token in browser
        localStorage.setItem("authToken", data.token);

        // Save user information
        localStorage.setItem("user", JSON.stringify(data.user));

        loginMessage.textContent = "Login successful!";
        loginMessage.hidden = false;

        console.log("Login API Response:", data);

    } catch (error) {
        loginMessage.textContent = error.message;
        loginMessage.hidden = false;

        console.error("Login Error:", error);
    }
});
