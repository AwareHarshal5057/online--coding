from django.contrib import admin
from .models import Profile,CodingQuestion

admin.site.register(Profile)




@admin.register(CodingQuestion)
class CodingQuestionAdmin(admin.ModelAdmin):
    list_display = ('title', 'difficulty', 'created_at')
    list_filter = ('difficulty',)
    search_fields = ('title', 'description')
