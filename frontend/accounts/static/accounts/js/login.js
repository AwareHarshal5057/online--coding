
console.log("Login JS loaded successfully!");

const API_URL = "http://127.0.0.1:8000/api/login/";

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const loginButton = loginForm.querySelector('button[type="submit"]');

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("id_username").value.trim();
    const password = document.getElementById("id_password").value;

    loginMessage.hidden = false;
    loginMessage.textContent = "Please wait...";
    loginButton.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.non_field_errors?.[0] ||
                data.detail ||
                "Invalid username or password."
            );
        }

        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        loginMessage.textContent =
            "Login successful! Opening Coding Page...";

        window.location.replace("/accounts/coding/");

    } catch (error) {
        console.error("Login Error:", error);
        loginMessage.textContent = error.message;
        loginButton.disabled = false;
    }
});
