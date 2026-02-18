import logging
logger = logging.getLogger(__name__)

from typing import Any, Dict, List, Optional
from django.db import transaction

from vision.models import VisionImage, VisionDetection
from policy.models import Furniture

from .file_path_utils import get_infer_path
from .model_inference import run_vision_inference
from .yolo_to_furniture import map_to_furniture

def _build_image_url(request, vision_image: VisionImage) -> str:
  """
  request가 있을 때 절대 URL 생성
  """
  # image.url은 MEDIA_URL 기반 상대 URL
  return request.build_absolute_uri(vision_image.image.url)


def _serialize_detection(vd: VisionDetection, furniture: Optional[Furniture]) -> Dict[str, Any]:
  """
  프론트에서 사용할 detection 응답 형태로 변환
  """
  bbox = None
  if (
    vd.bbox_x is not None and vd.bbox_y is not None
    and vd.bbox_w is not None and vd.bbox_h is not None
  ):
    bbox = {
      "x": float(vd.bbox_x),
      "y": float(vd.bbox_y),
      "w": float(vd.bbox_w),
      "h": float(vd.bbox_h),
    }

  return {
    "detection_id": vd.id,
    "furniture_id": furniture.id if furniture else None,
    "name_kr": getattr(furniture, "name_kr", None),
    "name_en": getattr(furniture, "name_en", None),
    "category": getattr(furniture, "category", None),
    "confidence": float(vd.confidence) if vd.confidence is not None else None,
    "bbox": bbox,
    "description": getattr(furniture, "description", None),
    "reference_model": getattr(furniture, "reference_model", None),
    "reference_url": getattr(furniture, "reference_url", None),
    "guide_size_cm": {
      "width_cm": furniture.width_cm,
      "depth_cm": furniture.depth_cm,
      "height_cm": furniture.height_cm,
      } if (
        furniture.width_cm is not None
        and furniture.depth_cm is not None
        and furniture.height_cm is not None
      ) else None,
    "needs_disassembly": getattr(furniture, "needs_disassembly_default", False),
  }


@transaction.atomic
def process_rooms_upload(
  *,
  request,
  rooms: List[Dict[str, Any]],
  files: List[Any],
) -> Dict[str, Any]:
  """
  1. rooms + files를 요청 받아서 VisionImage DB저장
  2. YOLO 모델 추론
  3. YOLO결과 + 가구 정보 VisionDetection 저장 및 응답
  """
  results: List[Dict[str, Any]] = []



  # json rooms 하나씩 읽기
  for room in rooms:
    
    # 1. rooms + files를 요청 받아서
    #    VisionImage DB저장

    room_type = room.get("room_type")
    file_index = room.get("file_index")
    sort_order = room.get("sort_order", 0)

    # 값 없을 경우 에러 처리
    if not room_type or file_index is None:
      raise ValueError("each room requires room_type, file_index")

    # file_index 검증 + 인덱스 순서대로 파일 선택
    try:
      file_index = int(file_index)
    except Exception:
      raise ValueError(f"file_index must be int. got={file_index}")

    # file_index가 음수거나 파일 개수와 맞지 않을 경우 에러 처리
    if file_index < 0 or file_index >= len(files):
      raise ValueError(f"file_index out of range: {file_index} (files={len(files)})")

    uploaded = files[file_index]

    # VisionImage 객체 생성 및 DB저장, 이미지 파일 저장
    # image = models.ImageField() -> ImageField는 create로 save()하면 경로(vision/) 및 suffix추가하여 파일명 변경, 이미지 파일을 media에 저장 해줌
    vision_image = VisionImage.objects.create(
      room_type=room_type,
      image=uploaded, # 파일로도 저장 됨
      image_file_name=getattr(uploaded, "name", "") or "",
      sort_order=sort_order,
    )

    # image_url 생성
    image_url = _build_image_url(request, vision_image)


    # 2. 모델 추론

    with get_infer_path(vision_image.image) as infer_path:
      detections = run_vision_inference(infer_path)


    # 3. YOLO결과 + 가구 정보
    #    VisionDetection 저장 및 응답

    resp_dets: List[Dict[str, Any]] = []

    # yolo결과 하나씩 꺼내기
    for det in detections:
      yolo_id = det.get("yolo_id")

      raw_class = det.get("yolo_class")
      yolo_class = str(raw_class) if raw_class is not None else None
      
      confidence = det.get("confidence")
      bbox = det.get("bbox") or {}

      # YOLO class id로 furniture yolo_id 찾기
      furniture = map_to_furniture(yolo_id)
      if furniture is None:
        logger.error(
          "Data mismatch: YOLO class has no corresponding Furniture (yolo_id=%s, class=%s)",
          yolo_id,
          yolo_class,
        )
        continue

      # DB 저장
      vd = VisionDetection.objects.create(
        vision_image=vision_image,
        yolo_id=yolo_id,
        yolo_class=yolo_class,
        furniture=furniture,
        confidence=confidence,
        bbox_x=bbox.get("x"),
        bbox_y=bbox.get("y"),
        bbox_w=bbox.get("w"),
        bbox_h=bbox.get("h"),
      )

      # 응답 결과에 추가
      resp_dets.append(_serialize_detection(vd, furniture))


      ### 에어컨의 경우 실외기 데이터 가져오기 ###
      # 실외기 이름 정의 (벽걸이용/스탠드용)
      outdoor_name_en = None   
      if yolo_id == 0 :   # 0 = air_conditioner_wall
        outdoor_name_en = "ac_outdoor_wall"
      elif yolo_id == 1 : # 1 = air_conditioner_stand
        outdoor_name_en = "ac_outdoor_stand"
      
      # 실외기 이름이 있으면 Furniture에서 실외기 정보 가져오기
      # 실외기는 yolo_id가 없으므로 yolo_id null중에서 가져옴
      if outdoor_name_en :
        outdoor_furniture = Furniture.objects.filter(
          yolo_id__isnull = True,
          name_en = outdoor_name_en,
        ).first()

        # 실외기 정보 가져왔으면
        if outdoor_furniture :
          outdoor_vd = VisionDetection.objects.create(
            vision_image=vision_image,
            yolo_id=None,
            yolo_class=outdoor_name_en,
            furniture=outdoor_furniture,
            confidence=None,
            bbox_x=None,
            bbox_y=None,
            bbox_w=None,
            bbox_h=None,
          )

          # 응답 결과에 실외기 추가
          resp_dets.append(_serialize_detection(outdoor_vd, outdoor_furniture))

    results.append(
      {
        "vision_image_id": vision_image.id,
        "room_type": vision_image.room_type,
        "image_url": image_url,
        "detections": resp_dets,
      }
    )

  return {"results": results}
