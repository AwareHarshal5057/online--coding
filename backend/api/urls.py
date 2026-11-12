
from django.urls import path
from . import views

urlpatterns = [
    # Home API
    path('', views.home_api, name='home_api'),

    # Authentication APIs
    path('register/', views.register_api, name='register_api'),
    path('login/', views.login_api, name='login_api'),

    # Questions APIs
    path('questions/', views.questions_api, name='questions_api'),

    path(
        'questions/<int:pk>/',
        views.question_detail_api,
        name='question_detail_api'
    ),
]
