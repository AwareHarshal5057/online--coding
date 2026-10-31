
from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register, name="register"),
    path("login/", views.login_view, name="login"),
    path("home/",views.home,name="home"),
    path("logout/",views.logout_view,name="logout"),
    path("coding/", views.coding, name="coding"),
    path("add-question/", views.add_question, name="add_question"),
    path("edit-question/<int:id>/", views.edit_question, name="edit_question"),
]
