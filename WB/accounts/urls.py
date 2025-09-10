# WB/accounts/urls.py
from django.urls import path
from django.contrib.auth.views import LoginView, LogoutView
from .forms import PrettyAuthForm
from . import views

urlpatterns = [
    path(
        "login/",
        LoginView.as_view(
            template_name="accounts/aut.html",
            authentication_form=PrettyAuthForm,
            redirect_authenticated_user=True,
        ),
        name="login",
    ),
    path("logout/", LogoutView.as_view(next_page="/"), name="logout"),
    path("register/", views.register, name="register"),
]
