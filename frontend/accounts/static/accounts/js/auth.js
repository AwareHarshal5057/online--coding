
console.log("Authentication JS loaded successfully!");

// Check login token
const token = localStorage.getItem("authToken");

// If token is missing, redirect to login page
if (!token) {

    console.log("User is not logged in.");

    localStorage.removeItem("user");

    window.location.replace("/accounts/login/");

} else {

    console.log("User is authenticated.");

}
        