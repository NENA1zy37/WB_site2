from django.contrib import admin
from .models import Plan

@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ('sku', 'plan_per_week')
    search_fields = ('sku',)