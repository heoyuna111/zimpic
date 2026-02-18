import os
import tempfile
from contextlib import contextmanager
//
@contextmanager
def get_infer_path(image_fieldfile):
  """
  모델 추론할 이미지 경로 찾기
  1. 로컬이면 .path 사용
  2. S3면 .path 사용 불가능, 임시 파일로 내려 받아서 사용
     -> 모델 추론 후 임시파일 삭제
  return: run_vision_inference에 넘길 수 있는 로컬 파일 경로
  """
  # 참고
  # with + yield(contextmanager)는
  # 임시파일 같은 자원을 쓰는 동안만 안전하게 열어두고,
  # 쓰자마자 무조건 정리하기 위해 사용하는 패턴

  # 로컬 스토리지(FileSystemStorage)면 path 사용 가능
  if hasattr(image_fieldfile, "path"):
    yield image_fieldfile.path
    return

  # 원격 스토리지(S3 등): 임시 파일로 저장
  name = getattr(image_fieldfile, "name", "") or "image"
  _, ext = os.path.splitext(name)
  suffix = ext if ext else ".jpg"

  tmp = tempfile.NamedTemporaryFile(suffix=suffix, delete=False)
  tmp_path = tmp.name

  try:
    with image_fieldfile.open("rb") as fsrc:
      tmp.write(fsrc.read())
    tmp.close()
    yield tmp_path
  finally:
    try:
      os.remove(tmp_path)
    except OSError:
      pass
