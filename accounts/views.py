from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import login
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
from .models import CodingQuestion

def register(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)

        if form.is_valid():
            form.save()
            messages.success(request, "Account created successfully!")
            return redirect("login")
    else:
        form = UserCreationForm()

    return render(request, "accounts/register.html", {"form": form})


def login_view(request):
    if request.method == "POST":
        form = AuthenticationForm(request, data=request.POST)

        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect("home")
    else:
        form = AuthenticationForm()

    return render(request, "accounts/login.html", {"form": form})

@login_required
def home(request):
    return render(request,"accounts/home.html")

@login_required
def logout_view(request):
    if request.method == "POST":

        logout(request)
        return redirect("login")
    return redirect("home")


@login_required
def coding(request):

    difficulty = request.GET.get("difficulty", "Easy")

    if difficulty not in ["Easy", "Medium", "Hard"]:
        difficulty = "Easy"

    questions = CodingQuestion.objects.filter(
        difficulty=difficulty
    )

    return render(request, "accounts/coding.html", {
        "questions": questions,
        "selected_difficulty": difficulty,
    })


@login_required
def add_question(request):
    if request.method == "POST":
        title = request.POST.get("title")
        description = request.POST.get("description")
        difficulty = request.POST.get("difficulty")

        if title and description and difficulty:
            question = CodingQuestion(
                title=title,
                description=description,
                difficulty=difficulty
            )
            question.save()

            messages.success(request, "Question added successfully!")
            return redirect("coding")

        messages.error(request, "Please fill all fields.")

    return render(request, "accounts/add_question.html")


@login_required
def edit_question(request, id):
    question = CodingQuestion.objects.get(id=id)

    if request.method == "POST":
        question.title = request.POST.get("title")
        question.description = request.POST.get("description")
        question.difficulty = request.POST.get("difficulty")

        question.save()

        messages.success(request, "Question updated successfully!")
        return redirect("coding")

    return render(request, "accounts/edit_question.html", {
        "question": question
    })    