from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login

def register(request):
    next_url = request.GET.get('next') or request.POST.get('next') or '/'
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect(next_url)
    else:
        form = UserCreationForm()
    return render(request, "accounts/aut.html", {"form": form, "mode": "register", "next": next_url})

def login_view(request):
    next_url = request.GET.get('next') or '/'
    return render(request, "accounts/aut.html", {"mode": "login", "next": next_url})