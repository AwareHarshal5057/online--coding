
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.urls import reverse

from .models import CodingQuestion, CodeSubmission


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
    return render(request, "accounts/home.html")


@login_required
def logout_view(request):
    if request.method == "POST":
        logout(request)
        return redirect("login")

    return redirect("home")


@login_required
def coding(request):

    difficulty = request.GET.get(
        "difficulty",
        request.POST.get("difficulty", "Easy")
    )

    if difficulty not in ["Easy", "Medium", "Hard"]:
        difficulty = "Easy"

    if request.method == "POST":

        question_id = request.POST.get("question_id")
        submitted_code = request.POST.get("submitted_code")

        if not question_id or not submitted_code or not submitted_code.strip():
            messages.error(request, "Please write your Python code first.")

        else:
            question = get_object_or_404(
                CodingQuestion,
                id=question_id
            )

            CodeSubmission.objects.create(
                student=request.user,
                question=question,
                submitted_code=submitted_code
            )

            messages.success(
                request,
                "Your code has been submitted successfully!"
            )

        return redirect(
            f"{reverse('coding')}?difficulty={difficulty}"
        )

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
            CodingQuestion.objects.create(
                title=title,
                description=description,
                difficulty=difficulty
            )

            messages.success(request, "Question added successfully!")
            return redirect("coding")

        messages.error(request, "Please fill all fields.")

    return render(request, "accounts/add_question.html")


@login_required
def edit_question(request, id):
    question = get_object_or_404(CodingQuestion, id=id)

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


@login_required
def delete_question(request, id):
    question = get_object_or_404(CodingQuestion, id=id)

    if request.method == "POST":
        question.delete()
        messages.success(request, "Question deleted successfully!")

    return redirect("coding")
