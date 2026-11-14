
const LOGOUT_API = "http://127.0.0.1:8000/api/logout/";

const logoutForm = document.getElementById("logoutForm");

logoutForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const token = localStorage.getItem("authToken");

    if (!token) {
        localStorage.removeItem("user");
        window.location.href = "/accounts/login/";
        return;
    }

    try {
        const response = await fetch(LOGOUT_API, {
            method: "POST",
            headers: {
                "Authorization": `Token ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Logout failed. Please try again.");
        }

        // Clear authentication data
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");

        // Redirect to login page
        window.location.href = "/accounts/login/";

    } catch (error) {
        console.error("Logout Error:", error);
        alert(error.message);
    }
});
