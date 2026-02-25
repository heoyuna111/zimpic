# ZIMPIC
---
## 담당 역할

#### Backend
- Multipart 이미지 수신 및 서버 내 파일·메타데이터 관리 로직 구현
- YOLO 모델 호출 및 이미지 내 객체 추론 결과 생성
- 추론 결과 정제 후 가구 데이터와 매핑하여 JSON 응답 구성
#### Frontend
- 카카오 맵 API를 활용한 위치 기반 이사업체 검색 기능 구현
#### Data Engineering
- 이미지 수집 및 OWLv2를 통한 라벨링 수행
- 객체 탐지 학습용 데이터셋 구축

---

## 🛠 기술 스택

- Back-end: Django, Django REST Framework, Django Admin
- Front-end: React, Axios, Three.js, Bootstrap
- Database: MySQL
- Machine Learning: OWLv2, YOLO11
- Tools & Collaboration: Swagger, Git, GitHub, Notion, Slack

---

## 🏗 시스템 아키텍처

<p align="center">
  <img src="./docs/짐픽_아키텍처.PNG" width="900"/>
</p>

---

## 📌 기능 설명

방 사진만 촬영하면 사진 속 가구를 분석하여 이사용응 자동으로 예측하는 서비스를 목표로 기획하였습니다.


