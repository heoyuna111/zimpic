# vision/services/yolo_to_furniture.py
from __future__ import annotations

from functools import lru_cache
from typing import Optional, Dict

from policy.models import Furniture


@lru_cache(maxsize=1)
def _build_yolo_id_map() -> Dict[int, Furniture]:
  """
  Furniture를 한 번만 읽어서 yolo_id -> Furniture 매핑 딕셔너리 생성.
  Furniture데이터 변경으로 캐시 초기화 필요 시 invalidate_furniture_cache()호출 필요
  """

  qs = Furniture.objects.all()
  mp: Dict[int, Furniture] = {}

  for f in qs:
    furniture_yolo_id = getattr(f, "yolo_id", None)
    if furniture_yolo_id is None:
      continue
    try:
      if int(furniture_yolo_id) in mp:
        continue
      mp[int(furniture_yolo_id)] = f
    except Exception:
      continue
  return mp


def map_to_furniture(yolo_class_id: int) -> Optional[Furniture]:
  """
  YOLO class id -> Furniture 매핑
  """
  if yolo_class_id is None:
    return None
  try:
    yolo_class_id = int(yolo_class_id)
  except Exception:
    return None

  mp = _build_yolo_id_map()
  return mp.get(yolo_class_id)


def invalidate_furniture_cache() -> None:
  """
  Furniture 데이터가 바뀌었을 때(관리자 수정/CSV 재로드 등) 캐시를 비우고 싶으면 호출
  """
  _build_yolo_id_map.cache_clear()
