# WB/accounts/forms.py
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm

class PrettyAuthForm(AuthenticationForm):
    """Логин: поля получают id/placeholder/autocomplete под твой JS и CSS."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["username"].widget.attrs.update({
            "id": "login-username",
            "placeholder": "Логин",
            "autocomplete": "username",
            # Класс не обязателен: твой CSS таргетит .fi input
        })
        self.fields["password"].widget.attrs.update({
            "id": "login-password",
            "placeholder": "Пароль",
            "autocomplete": "current-password",
        })

class PrettyRegisterForm(UserCreationForm):
    """Регистрация: те же атрибуты + id для фокуса вкладки."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["username"].widget.attrs.update({
            "id": "su-username",
            "placeholder": "Логин",
            "autocomplete": "username",
        })
        self.fields["password1"].widget.attrs.update({
            "id": "su-password1",
            "placeholder": "Пароль",
            "autocomplete": "new-password",
        })
        self.fields["password2"].widget.attrs.update({
            "id": "su-password2",
            "placeholder": "Повтор пароля",
            "autocomplete": "new-password",
        })
