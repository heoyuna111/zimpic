from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError

from .services.estimate_create import create_estimate

from .serializers import EstimateCreateSerializer, EstimateResponseSerializer


class EstimateCreateAPIView(APIView):
  def post(self, request):
    in_ser = EstimateCreateSerializer(data=request.data)
    in_ser.is_valid(raise_exception=True)

    estimate = create_estimate(in_ser.validated_data)
    out = EstimateResponseSerializer(estimate).data

    return Response(out, status=status.HTTP_201_CREATED)
