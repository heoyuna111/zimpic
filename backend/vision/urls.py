from django.urls import path
from .views import VisionUploadAPIView




urlpatterns = [
  path("", VisionUploadAPIView.as_view()),
]
