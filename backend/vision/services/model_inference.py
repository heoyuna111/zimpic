from __future__ import annotations

from typing import Dict, List, Any, Optional
from functools import lru_cache

from django.conf import settings

try:
  from ultralytics import YOLO
except ImportError:
  YOLO = None

# 운영 서버 주의!
# Gunicorn 멀티프로세스(worker>1)에서는 각 worker마다 모델이 로딩되어 GPU 메모리를 중복 사용하게 됨.
# GPU 서버에서는 workers=1로 실행하여 모델 1개만 유지해야 함.
# 동시성까지 확보한 예: gunicorn config.wsgi:application --workers 1 --threads 4 --timeout 120

@lru_cache(maxsize=1)
def _get_model():
  if YOLO is None:
    raise RuntimeError("ultralytics가 설치되어 있지 않습니다. pip install ultralytics")
  
  model = YOLO(str(settings.VISION_MODEL_PATH))
  device = getattr(settings, "VISION_DEVICE", "cpu")
  model.to(device)
  return model


def run_vision_inference(file_path: str) -> List[Dict[str, Any]]:
  model = _get_model()

  imgsz = getattr(settings, "VISION_IMG_SIZE", 640)
  conf = getattr(settings, "VISION_CONF", 0.25)

  # save=False로 파일 생성 방지
  results = model.predict(
    source=file_path,
    imgsz=imgsz,
    conf=conf,
    save=False,
    verbose=False,
  )

  if not results:
    return []

  r0 = results[0]

  # 결과가 비어있을 수 있음
  if r0.boxes is None or len(r0.boxes) == 0:
    return []

  # 이미지 원본 크기 (픽셀)
  img_w, img_h = r0.orig_shape[1], r0.orig_shape[0]

  # class name 매핑
  names = r0.names  # dict: {class_id: "sofa_sm", ...}

  out: List[Dict[str, Any]] = []

  # boxes.xyxy: (N,4) 픽셀 좌표
  # boxes.cls: (N,) class id
  # boxes.conf: (N,) confidence
  xyxy = r0.boxes.xyxy
  cls = r0.boxes.cls
  confs = r0.boxes.conf

  # CPU로 옮겨서 파이썬 숫자로
  xyxy = xyxy.cpu().tolist()
  cls = cls.cpu().tolist()
  confs = confs.cpu().tolist()

  for (x1, y1, x2, y2), c, cf in zip(xyxy, cls, confs):
    class_id = int(c)
    class_name = names.get(class_id, str(class_id))

    # 픽셀 -> normalized xywh (0~1), center 기준
    w = max(0.0, x2 - x1)
    h = max(0.0, y2 - y1)
    cx = x1 + w / 2
    cy = y1 + h / 2

    out.append({
      "yolo_id": class_id,
      "yolo_class": class_name,
      "confidence": float(cf),
      "bbox": {
        "x": float(cx / img_w),
        "y": float(cy / img_h),
        "w": float(w / img_w),
        "h": float(h / img_h),
      },
    })

  return out
