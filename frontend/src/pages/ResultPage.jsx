// src/pages/ResultPage.jsx
import { useNavigate } from "react-router-dom";
import StepIndicator from "../components/layout/StepIndicator";
import { useEstimateStore } from "../store/estimateStore";
import { useEffect, useMemo, useRef } from "react";

import ResultSummaryBox from "../components/estimate/result/ResultSummaryBox";
import SelectedInfoTable from "../components/estimate/result/SelectedInfoTable";
import RoomItemsSummary from "../components/estimate/result/RoomItemsSummary";
import PriceBreakdown from "../components/estimate/result/PriceBreakdown";
import ResultFooterActions from "../components/estimate/result/ResultFooterActions";

// 3D 카드
import TruckLoad3D from "../components/estimate/result/TruckLoad3D";

// pdf 로직
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ResultPage() {
  const navigate = useNavigate();

  const reset = useEstimateStore((s) => s.reset);
  const basicInfo = useEstimateStore((s) => s.basicInfo);
  const rooms = useEstimateStore((s) => s.rooms);
  const moveInfo = useEstimateStore((s) => s.moveInfo);
  const result = useEstimateStore((s) => s.result);
  const analysisByRoom = useEstimateStore((s) => s.analysisByRoom);

  const handlePrev = () => navigate("/AddressPage");
  const pdfRef = useRef(null);


  // 요약정보 
  const summary = result?.summary ?? null;
  //실제 금액 계산의 근거
  const pricing = result?.pricing ?? null;

  const totalPrice = pricing?.total_amount ?? 0;
  const distanceKm = Number(summary?.distance_km ?? 0);

  const moveTypeText =
    basicInfo.moveType === "packing" ? "포장 이사" : "일반 이사";
  const sizeText = `${basicInfo.size}평`;

  // 서버 sections: 단일 진실
  const pricingSections = useMemo(() => pricing?.sections ?? [], [pricing]);

  // 서버가 준 special_item_count 우선 사용
  const specialItemCount =
    typeof summary?.special_item_count === "number"
      ? summary.special_item_count
      : null;

  // 선택 정보 아래에 보여줄 "특수 섹션 라인 설명"
  const specialLines = useMemo(() => {
    const specialSection = pricingSections.find((s) => s.key === "SPECIAL");
    const lines = specialSection?.lines ?? [];
    return lines.map((l) => l?.description).filter(Boolean);
  }, [pricingSections]);

  // 특수가구 id set
  const specialFurnitureIdSet = useMemo(() => {
    const specialSection = pricingSections.find((s) => s.key === "SPECIAL");
    const ids = (specialSection?.lines ?? [])
      .map((l) => Number(l?.furniture_id))
      .filter((v) => Number.isFinite(v));
    return new Set(ids);
  }, [pricingSections]);

  // 분해/조립 체크된 아이템 목록(프론트 선택 기준)
  const disassemblyNames = useMemo(() => {
    const names = [];
    Object.values(analysisByRoom ?? {}).forEach((arr) => {
      (arr ?? [])
        .filter((i) => i?.checked)
        .filter((i) => i?.needsDisassembly)
        .forEach((i) => {
          const c = i.count ?? 1;
          for (let k = 0; k < c; k++) names.push(i.name);
        });
    });
    return [...new Set(names)];
  }, [analysisByRoom]);

  // 사다리차 문구도 서버 sections 기준으로만
  const ladderText = useMemo(() => {
    const ladderSection = pricingSections.find((s) => s.key === "LADDER");
    if (!ladderSection) return "정보 없음";

    const amount = Number(ladderSection?.amount ?? 0);
    if (amount <= 0) return "미사용";

    const lines = ladderSection?.lines ?? [];
    const scopes = new Set(lines.map((l) => l?.scope).filter(Boolean));
    const hasOrigin = scopes.has("ORIGIN");
    const hasDest = scopes.has("DEST");

    if (hasOrigin && hasDest) return "출발지/도착지 모두 사용";
    if (hasOrigin)
      return summary?.dest_address
        ? "출발지 사용"
        : "출발지 사용 (도착지 미정)";
    if (hasDest) return "도착지 사용";
    return summary?.dest_address ? "사용" : "사용 (도착지 미정)";
  }, [pricingSections, summary?.dest_address]);

  const vehicleText = useMemo(() => {
    const plan = summary?.truck_plan ?? [];
    if (!plan.length) return "트럭 정보 없음";
    return plan.map((t) => `${t.truck_type}×${t.truck_count}`).join(" + ");
  }, [summary]);

  const roomSummaries = useMemo(() => {
    const boxesCount = Number(summary?.boxes_count ?? 0);
    const boxSpec = summary?.box;

    return rooms.map((room) => {
      const items = (analysisByRoom?.[room.id] ?? []).filter((i) => i.checked);

      const grouped = {};
      items.forEach((i) => {
        const w = i.width ?? 300;
        const h = i.height ?? 200;
        const d = i.depth ?? 100;

        const dis = i.needsDisassembly ? 1 : 0;
        const fid = i.furnitureId ?? i.furniture_id ?? null;

        // 같은 이름이라도 크기/분해 옵션 다르면 다른 줄로 보임
        const key = `${i.name}|${w}x${h}x${d}|dis:${dis}|fid:${fid ?? "none"}`;

        if (!grouped[key]) {
          grouped[key] = {
            key,
            name: i.name,
            count: 0,
            width: w,
            height: h,
            depth: d,
            needsDisassembly: !!i.needsDisassembly,
            furnitureId: fid,
          };
        }
        grouped[key].count += i.count ?? 1;
      });

      // ✅ 박스는 한 번만(첫 방에) 추가
      if (room.sortOrder === 0 || room.id === rooms[0]?.id) {
        if (boxesCount > 0 && boxSpec) {
          const bw = Number(boxSpec.packed_w_cm ?? boxSpec.w_cm ?? 0);
          const bd = Number(boxSpec.packed_d_cm ?? boxSpec.d_cm ?? 0);
          const bh = Number(boxSpec.packed_h_cm ?? boxSpec.h_cm ?? 0);

          const boxKey = `이사 박스(5호)|${bw}x${bh}x${bd}|dis:0|fid:${boxSpec.furniture_id}`;

          grouped[boxKey] = {
            key: boxKey,
            name: boxSpec.name_kr ?? "이사 박스",
            count: boxesCount,
            width: bw,
            height: bh,
            depth: bd,
            needsDisassembly: false,
            furnitureId: boxSpec.furniture_id,
            isBox: true,
          };
        }
      }

      // 전체 짐 개수
      const totalCount = Object.values(grouped).reduce(
        (sum, g) => sum + g.count,
        0
      );

      return {
        roomId: room.id,
        roomType: room.type,
        items,
        grouped,
        totalCount,
        firstImageFile: room.images?.[0]?.file ?? null,
      };
    });
    }, [rooms, analysisByRoom]);


  const totalItemCount = useMemo(() => {
    return roomSummaries.reduce((sum, r) => sum + r.totalCount, 0);
  }, [roomSummaries]);

  const totalSpecialCount = useMemo(() => {
    if (specialItemCount != null) return specialItemCount;
    const specialSection = pricingSections.find((s) => s.key === "SPECIAL");
    return (specialSection?.lines ?? []).length;
  }, [pricingSections, specialItemCount]);

  // 방 썸네일
  const thumbUrls = useMemo(() => {
    const map = new Map();
    roomSummaries.forEach((r) => {
      if (r.firstImageFile) {
        map.set(r.roomId, URL.createObjectURL(r.firstImageFile));
      }
    });
    return map;
  }, [roomSummaries]);

  useEffect(() => {
    return () => {
      thumbUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [thumbUrls]);

  if (!result) {
    return (
      <div className="container-fluid my-4 text-center">
        <p>결과 데이터가 없습니다.</p>
        <button
          className="btn btn-outline-primary"
          onClick={() => navigate("/HomePage")}
        >
          처음으로
        </button>
      </div>
    );
  }

  const handleSavePdf = async () => {
    if (!pdfRef.current) return;

    const canvas = await html2canvas(pdfRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("이사_견적서.pdf");
  };

  return (
    <div className="container my-4">
      <div className="card shadow-sm p-4">
        <StepIndicator currentStep={4} />

        <div ref={pdfRef}>
          <div className="mb-4">
            <h3 className="fw-bold mb-2">이사 비용 계산 결과</h3>
            <p className="text-muted mb-3">
              입력하신 정보를 바탕으로 예상 이사 비용을 계산했습니다. 실제 비용은
              업체 견적에 따라 달라질 수 있습니다.
            </p>

            <div className="card mb-4">
              <div className="card-header bg-white fw-bold">트럭 적재 시뮬레이션(3D)</div>
              <div className="card-body">
                <TruckLoad3D result={result} />
                <div className="text-muted small mt-2">
                  참고: 실제 적재는 현장 조건에 따라 달라질 수 있어요.
                </div>
              </div>
            </div>

            <ResultSummaryBox totalPrice={totalPrice} />

            <SelectedInfoTable
              moveTypeText={moveTypeText}
              sizeText={sizeText}
              moveInfo={moveInfo}
              distanceKm={distanceKm}
              ladderText={ladderText}
              totalSpecialCount={totalSpecialCount}
              totalItemCount={totalItemCount}
              specialLines={specialLines}
              disassemblyNames={disassemblyNames}
              boxesCount={summary?.boxes_count}
              boxesDescription={summary?.boxes_description}
            />
          </div>

          <RoomItemsSummary
            roomSummaries={roomSummaries}
            thumbUrls={thumbUrls}
            vehicleText={vehicleText}
            specialFurnitureIdSet={specialFurnitureIdSet}
          />

          {/* 서버 sections만으로 렌더 */}
          <PriceBreakdown sections={pricingSections} totalPrice={totalPrice} />
        </div>

        <ResultFooterActions
          onPrev={handlePrev}
          onSave={handleSavePdf}
          onResetToHome={() => {
            reset();
            navigate("/HomePage");
          }}
        />
      </div>
    </div>
  );
}
