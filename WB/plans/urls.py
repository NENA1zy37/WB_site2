from django.urls import path
from . import views
from .views import index
from django.urls import include

urlpatterns = [
    path("", index, name="index"),
    path('bdds/', views.bdds_page, name='bdds_page'),
    path('bdds/upload/', views.upload_plans, name='bdds_upload'),
    path('bdds/api/plans/', views.api_plans, name='bdds_api_plans'),
    path('bdds/api/facts/', views.wb_facts, name='bdds_api_facts'),
    path('bdds/api/facts/bucketed/', views.wb_facts_bucketed, name='bdds_api_facts_bucketed'),
    path("accounts/", include("accounts.urls")),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('unit/', views.unit_page, name='unit_page'),
    path('import-cost/', views.import_cost_form, name='import_cost_form'),
    path('api/import-cost/', views.import_cost_api, name='import_cost_api'),
]
