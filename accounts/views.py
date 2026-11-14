
from django.shortcuts import render, redirect


# Register Page
def register(request):
    return render(request, "accounts/register.html")


# Login Page
def login_view(request):
    return render(request, "accounts/login.html")


# Home Page
def home(request):
    return render(request, "accounts/home.html")


# Logout Page
def logout_view(request):
    return redirect("login")


# Coding Practice Page
def coding(request):

    difficulty = request.GET.get("difficulty", "Easy")

    if difficulty not in ["Easy", "Medium", "Hard", "All"]:
        difficulty = "Easy"

    return render(request, "accounts/coding.html", {
        "selected_difficulty": difficulty
    })


# Add Question Page
def add_question(request):
    return render(request, "accounts/add_question.html")


# Edit Question Page
def edit_question(request, id):
    return redirect("coding")


# Delete Question
def delete_question(request, id):
    return redirect("coding")
