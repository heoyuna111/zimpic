import React, { useEffect, useState } from "react";
import "./FindMoverModal.css";

function FindMoverModal({ isOpen, onClose }) {
  const [currentPosition, setCurrentPosition] = useState(null);

  // 현재 위치 변경 버튼 클릭 시 카카오 주소 검색 팝업
  const onChangeLocation = () => {
    new window.daum.Postcode({
      oncomplete: (data) => {
        const address = (data.roadAddress || data.address || "").trim();

        // 좌표 정보가 필요 ->  geocoder로 변환
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(address, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const { y, x } = result[0];
            setCurrentPosition({ lat: parseFloat(y), lng: parseFloat(x) });
          }
        });
      },
    }).open();
  };

  // 모달이 닫히면 다시 '물리적 현재 위치 기반'
  const handleClose = () => {
    setCurrentPosition(null); // 선택 위치 초기화
    onClose();                // 부모에서 받은 모달 닫기 함수
  };



  // 지도 그리고 마커 표시
  useEffect(() => {
    if (!isOpen) return;

    const container = document.getElementById("map");
    if (!container) return;

    const map = new window.kakao.maps.Map(container, {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780),
      level: 5,
    });

    // 내 위치
    const drawMap = (lat, lng) => {
      const myPosition = new window.kakao.maps.LatLng(lat, lng);
      map.setCenter(myPosition);

      new window.kakao.maps.CustomOverlay({
        position: myPosition,
        content: '<div style="width:16px; height:16px; background:red; border-radius:50%; border:2px solid white;"></div>',
        map,
        yAnchor: 0.5,
      });

      new window.kakao.maps.Circle({
        map,
        center: myPosition,
        radius: 1000,
        strokeWeight: 2,
        strokeColor: "#68ddec",
        fillColor: "#6ebff5",
        fillOpacity: 0.2,
      });

      // 키워드 이사업체 표시
      const ps = new window.kakao.maps.services.Places();
      const keywords = ["이사", "포장이사", "용달"];
      let lastOpenedWindow = null;

      keywords.forEach((kw) => {
        ps.keywordSearch(
          kw,
          (data, status) => {
            if (status !== window.kakao.maps.services.Status.OK) return;

            data.forEach((place) => {
              const placeLatLng = new window.kakao.maps.LatLng(place.y, place.x);
              const marker = new window.kakao.maps.Marker({
                map,
                position: placeLatLng,
                title: place.place_name,
              });

              const hoverWindow = new window.kakao.maps.InfoWindow({
                content: `<div style="padding:5px;">${place.place_name}</div>`,
              });

              const clickWindow = new window.kakao.maps.InfoWindow({
                content: `<div style="padding:5px; min-width:250px; word-break:break-all;">
                  <strong>${place.place_name}</strong><br/>
                  ${place.road_address_name || place.address_name || "주소 없음"}
                </div>`,
                removable: true,
              });

              window.kakao.maps.event.addListener(marker, "mouseover", () => hoverWindow.open(map, marker));
              window.kakao.maps.event.addListener(marker, "mouseout", () => hoverWindow.close());
              window.kakao.maps.event.addListener(marker, "click", () => {
                if (lastOpenedWindow) lastOpenedWindow.close();
                clickWindow.open(map, marker);
                lastOpenedWindow = clickWindow;
              });
            });
          },
          { location: myPosition, radius: 1000 }
        );
      });
    };

    if (currentPosition) {
      drawMap(currentPosition.lat, currentPosition.lng);
    } else {
      navigator.geolocation.getCurrentPosition((pos) => {
        drawMap(pos.coords.latitude, pos.coords.longitude);
      });
    }
  }, [isOpen, currentPosition]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h5>내 주변 이사업체 찾기</h5>
        <div id="map" style={{ width: "100%", height: "500px" }}></div>
        <div className="modal-buttons">
          <button className="location-btn" onClick={onChangeLocation}>
            현재 위치 변경
          </button>
          <button className="close-btn" onClick={handleClose}>
            닫기
          </button>
        </div>

      </div>
    </div>
  );
}

export default FindMoverModal;
