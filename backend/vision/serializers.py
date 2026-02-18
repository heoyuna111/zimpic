from rest_framework import serializers
from .models import VisionImage, VisionDetection

class VisionDetectionInputSerializer(serializers.ModelSerializer):
  class Meta:
    model = VisionDetection
    exclude = ("id", "vision_image", "created_at")


class VisionCreateSerializer(serializers.Serializer):
  image = serializers.DictField()
  detections = VisionDetectionInputSerializer(many=True)
