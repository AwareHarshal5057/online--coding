# from django.db import models


# class Profile(models.Model):
#     full_name = models.CharField(max_length=100)
#     bio = models.TextField(blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.full_name



# class CodingQuestion(models.Model):
#     DIFFICULTY_CHOICES = [
#         ('Easy', 'Easy'),
#         ('Medium', 'Medium'),
#         ('Hard', 'Hard'),
#     ]

#     title = models.CharField(max_length=200)
#     description = models.TextField()
#     difficulty = models.CharField(
#         max_length=10,
#         choices=DIFFICULTY_CHOICES,
#         default='Easy'
#     )
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.title



# class CodeSubmission(models.Model):
#     student = models.ForeignKey(
#         'auth.User',
#         on_delete=models.CASCADE
#     )

#     question = models.ForeignKey(
#         CodingQuestion,
#         on_delete=models.CASCADE
#     )

#     submitted_code = models.TextField()

#     submitted_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"{self.student.username} - {self.question.title}"
