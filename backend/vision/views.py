import json

from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from vision.services.pipeline import process_rooms_upload

class VisionUploadAPIView(APIView):
  parser_classes = [MultiPartParser, FormParser]

  rooms_param = openapi.Parameter(
    name="rooms",
    in_=openapi.IN_FORM,
    type=openapi.TYPE_STRING,
    required=True,
    description=(
      "JSON 문자열"
      "\n예시: [{\"room_type\":\"LIVING\",\"file_index\":0,\"sort_order\":1}]"
      "\nfile_index는 form-data files의 배열 인덱스 (0부터)"
    ),
  )

  @swagger_auto_schema(
    tags=["Vision"],
    manual_parameters=[rooms_param],
    consumes=["multipart/form-data"],
    responses={
      201: openapi.Response(
        description="업로드 결과",
        examples={
          "application/json": {
            "results": [
              {
                "vision_image_id": 1,
                "room_type": "LIVING",
                "image_url": "https://...",
                "detections": [
                  {
                    "detection_id": 1001,
                    "furniture_id": 5,
                    "name_kr": "소파(소형)",
                    "name_en": "sofa_sm",
                    "category": "GENERAL_FURNITURE",
                    "confidence": 0.92,
                    "bbox": {"x": 0.48, "y": 0.75, "w": 0.31, "h": 0.22},
                    "guide_size_cm": {"w": 300, "d": 100, "h": 200},
                    "needs_disassembly": False
                  }
                ]
              }
            ]
          }
        },
      )
    },
  )
  
  def post(self, request):
    # json rooms 파싱
    rooms_raw = request.data.get("rooms")
    if not rooms_raw:
      return Response({"detail": "rooms is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
      rooms = json.loads(rooms_raw)
      if not isinstance(rooms, list):
        raise ValueError
    except Exception:
      return Response({"detail": "rooms must be a JSON list string"}, status=status.HTTP_400_BAD_REQUEST)
    
    # files 파싱
    files = request.FILES.getlist("files")
    if not files:
      return Response({"detail": "files is required"}, status=status.HTTP_400_BAD_REQUEST)

    # 서비스 로직 호출
    try:
      payload = process_rooms_upload(
        request = request,
        rooms = rooms,
        files = files
      )
    except ValueError as e :
      return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(payload, status=status.HTTP_201_CREATED)
