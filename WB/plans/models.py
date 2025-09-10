from django.db import models

class Plan(models.Model):
    sku = models.CharField(max_length=64, unique=True, db_index=True)
    plan_per_week = models.PositiveIntegerField(default=0)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.sku} — {self.plan_per_week}"