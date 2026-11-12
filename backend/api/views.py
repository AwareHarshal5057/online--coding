
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    QuestionSerializer
)
from .models import Question
from rest_framework.authtoken.models import Token

# Home API
@api_view(['GET'])
def home_api(request):

    data = {
        "message": "welcome to online coding practice api",
        "status": "success"
    }

    return Response(data)


# Register API
@api_view(['POST'])
def register_api(request):

    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()

        return Response(
            {
                "message": "Registration successful!",
                "user": serializer.data
            },
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# Login API
@api_view(['POST'])
def login_api(request):
    serializer = LoginSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.validated_data['user']

        # Generate or get existing token
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            "message": "Login successful!",
            "token": token.key,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        }, status=status.HTTP_200_OK)

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )

# Questions API - GET and POST
@api_view(['GET', 'POST'])
def questions_api(request):

    if request.method == 'GET':

        questions = Question.objects.all()

        serializer = QuestionSerializer(questions, many=True)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    elif request.method == 'POST':

        serializer = QuestionSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# Single Question API - GET, PUT, PATCH and DELETE
@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def question_detail_api(request, pk):

    try:
        question = Question.objects.get(pk=pk)

    except Question.DoesNotExist:
        return Response(
            {"error": "Question not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':

        serializer = QuestionSerializer(question)

        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:

        serializer = QuestionSerializer(
            question,
            data=request.data,
            partial=(request.method == 'PATCH')
        )

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    elif request.method == 'DELETE':

        question.delete()

        return Response(
            {"message": "Question deleted successfully"},
            status=status.HTTP_200_OK
        )
