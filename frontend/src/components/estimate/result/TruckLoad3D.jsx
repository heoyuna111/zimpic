import React, { useMemo, useRef, useEffect, useCallback, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Sky, ContactShadows, Environment } from "@react-three/drei";
// logic 분리된 것들
import { SCALE, TRUCK_PRESET } from "./logic/truckPreset";
import { toNumber, itemCbm, hash01 } from "./logic/packingUtils";
import { simplePack, splitItemsByTruckLoad } from "./logic/simplePack";
import { packWithBinPacking3D_MultiTry } from "./logic/binPacking";
// 드래그앤드롭용(유나)
import * as THREE from "three";


/* 환경/비주얼 컴포넌트 */
function DecorationTree({ position, scale = 1 }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 60, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[10, 15, 120, 8]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
      <mesh position={[0, 140, 0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[80, 0]} />
        <meshStandardMaterial color="#66bb6a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 200, 0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[60, 0]} />
        <meshStandardMaterial color="#81c784" roughness={0.8} />
      </mesh>
    </group>
  );
}

function House({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 150, 0]} receiveShadow>
        <boxGeometry args={[1400, 300, 600]} />
        <meshStandardMaterial color="#fff3e0" />
      </mesh>
      <mesh position={[0, 450, 0]} receiveShadow>
        <boxGeometry args={[1400, 300, 600]} />
        <meshStandardMaterial color="#ffe0b2" />
      </mesh>
      <mesh position={[0, 700, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <cylinderGeometry args={[0, 800, 300, 4]} />
        <meshStandardMaterial color="#3e2723" />
      </mesh>

      <mesh position={[0, 110, 301]} receiveShadow>
        <boxGeometry args={[120, 220, 10]} />
        <meshStandardMaterial color="#795548" />
      </mesh>
      <mesh position={[40, 110, 306]}>
        <sphereGeometry args={[5, 16, 16]} />
        <meshStandardMaterial color="#ffd700" metalness={0.8} />
      </mesh>

      <mesh position={[-350, 150, 301]}>
        <boxGeometry args={[160, 140, 10]} />
        <meshStandardMaterial color="#b3e5fc" />
      </mesh>
      <mesh position={[350, 150, 301]}>
        <boxGeometry args={[160, 140, 10]} />
        <meshStandardMaterial color="#b3e5fc" />
      </mesh>

      <mesh position={[-350, 450, 301]}>
        <boxGeometry args={[160, 140, 10]} />
        <meshStandardMaterial color="#b3e5fc" />
      </mesh>
      <mesh position={[0, 450, 301]}>
        <boxGeometry args={[160, 140, 10]} />
        <meshStandardMaterial color="#b3e5fc" />
      </mesh>
      <mesh position={[350, 450, 301]}>
        <boxGeometry args={[160, 140, 10]} />
        <meshStandardMaterial color="#b3e5fc" />
      </mesh>

      <mesh position={[0, 10, 380]} receiveShadow>
        <boxGeometry args={[400, 20, 160]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>
    </group>
  );
}

function Fence({ length = 1000 }) {
  const count = Math.floor(length / 70);
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} position={[-length / 2 + i * 70, 50, 0]} castShadow>
          <boxGeometry args={[10, 100, 5]} />
          <meshStandardMaterial color="#eeeeee" />
        </mesh>
      ))}
      <mesh position={[0, 80, 0]}>
        <boxGeometry args={[length, 8, 5]} />
        <meshStandardMaterial color="#eeeeee" />
      </mesh>
    </group>
  );
}

function Mailbox({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 60, 0]} castShadow>
        <cylinderGeometry args={[4, 4, 120]} />
        <meshStandardMaterial color="#424242" />
      </mesh>
      <mesh position={[0, 120, 0]} castShadow>
        <boxGeometry args={[35, 25, 50]} />
        <meshStandardMaterial color="#d32f2f" />
      </mesh>
    </group>
  );
}

function ResidentialEnvironment() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[5000, 1200]} />
        <meshStandardMaterial color="#78909c" roughness={0.9} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 10, -800]} receiveShadow>
        <planeGeometry args={[5000, 400]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.8} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 10, -610]} receiveShadow>
        <boxGeometry args={[5000, 20, 15]} />
        <meshStandardMaterial color="#bdbdbd" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, -2000]} receiveShadow>
        <planeGeometry args={[5000, 2000]} />
        <meshStandardMaterial color="#a5d6a7" roughness={1} />
      </mesh>

      <group position={[0, 0, -1100]}>
        <House position={[0, 0, 0]} />
        <group position={[-1600, 0, 0]}><House position={[0, 0, 0]} /></group>
        <group position={[1600, 0, 0]}><House position={[0, 0, 0]} /></group>
      </group>

      <group position={[0, 0, -950]}>
        <Fence length={5000} />
      </group>

      <Mailbox position={[300, 0, -900]} />

      <DecorationTree position={[-500, 0, -700]} scale={1.2} />
      <DecorationTree position={[500, 0, -700]} scale={1.1} />
      <DecorationTree position={[-400, 0, -1400]} scale={1.5} />
      <DecorationTree position={[600, 0, -1350]} scale={1.3} />
    </group>
  );
}

function Wheel({ x, y, z, r = 14, w = 10 }) {
  return (
    <group position={[x * SCALE, y * SCALE, z * SCALE]} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[r * SCALE, r * SCALE, w * SCALE, 32]} />
        <meshStandardMaterial color="#333" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.5 * SCALE, 0]}>
        <cylinderGeometry args={[r * 0.6 * SCALE, r * 0.6 * SCALE, w * 1.05 * SCALE, 16]} />
        <meshStandardMaterial color="#ddd" metalness={0.6} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.8 * SCALE, 0]}>
        <cylinderGeometry args={[r * 0.15 * SCALE, r * 0.15 * SCALE, w * 1.2 * SCALE, 8]} />
        <meshStandardMaterial color="#888" />
      </mesh>
    </group>
  );
}

function TruckShell({ truck, cabD, chassisH, bodyPaddingW, bodyPaddingD, bodyPaddingH, worldOffset }) {
  const TH = 2;
  const bedOuterW = truck.w + bodyPaddingW;
  const bedOuterD = truck.d + bodyPaddingD;
  const bedOuterH = truck.h + bodyPaddingH;
  const totalD = cabD + bedOuterD;
  const centerX = bedOuterW / 2;
  const cabW = bedOuterW * 0.92;
  const cabH = Math.max(130, truck.h * 0.65);
  const cabZ = cabD / 2;
  const chassisZ = totalD / 2;
  const bedZ = cabD + bedOuterD / 2;

  return (
    <group position={[worldOffset.x * SCALE, 0, worldOffset.z * SCALE]}>
      <mesh position={[centerX * SCALE, (chassisH / 2) * SCALE, chassisZ * SCALE]} receiveShadow>
        <boxGeometry args={[bedOuterW * SCALE, chassisH * SCALE, totalD * SCALE]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.8} />
      </mesh>

      <group position={[centerX * SCALE, (chassisH + cabH / 2) * SCALE, cabZ * SCALE]}>
        <mesh castShadow>
          <boxGeometry args={[cabW * SCALE, cabH * SCALE, cabD * SCALE]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
        <mesh position={[0, cabH * 0.15 * SCALE, -cabD * 0.51 * SCALE]}>
          <boxGeometry args={[cabW * 0.85 * SCALE, cabH * 0.4 * SCALE, 2 * SCALE]} />
          <meshStandardMaterial color="#34495e" roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[0, -cabH * 0.25 * SCALE, -cabD * 0.51 * SCALE]}>
          <boxGeometry args={[cabW * 0.7 * SCALE, cabH * 0.2 * SCALE, 2 * SCALE]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[-cabW * 0.35 * SCALE, -cabH * 0.35 * SCALE, -cabD * 0.52 * SCALE]}>
          <boxGeometry args={[cabW * 0.12 * SCALE, cabH * 0.08 * SCALE, 4 * SCALE]} />
          <meshStandardMaterial color="#f1c40f" emissive="#f1c40f" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[cabW * 0.35 * SCALE, -cabH * 0.35 * SCALE, -cabD * 0.52 * SCALE]}>
          <boxGeometry args={[cabW * 0.12 * SCALE, cabH * 0.08 * SCALE, 4 * SCALE]} />
          <meshStandardMaterial color="#f1c40f" emissive="#f1c40f" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[-cabW * 0.52 * SCALE, cabH * 0.1 * SCALE, -cabD * 0.3 * SCALE]}>
          <boxGeometry args={[4 * SCALE, cabH * 0.2 * SCALE, 8 * SCALE]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[cabW * 0.52 * SCALE, cabH * 0.1 * SCALE, -cabD * 0.3 * SCALE]}>
          <boxGeometry args={[4 * SCALE, cabH * 0.2 * SCALE, 8 * SCALE]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </group>

      <mesh position={[centerX * SCALE, chassisH * 0.5 * SCALE, 5 * SCALE]} castShadow>
        <boxGeometry args={[bedOuterW * SCALE, chassisH * 1.5 * SCALE, 15 * SCALE]} />
        <meshStandardMaterial color="#95a5a6" metalness={0.5} />
      </mesh>

      <group position={[centerX * SCALE, (chassisH + bedOuterH / 2) * SCALE, bedZ * SCALE]}>
        <mesh castShadow>
          <boxGeometry args={[bedOuterW * SCALE, bedOuterH * SCALE, bedOuterD * SCALE]} />
          <meshStandardMaterial color="#ecf0f1" transparent opacity={0.15} roughness={0.1} depthWrite={false} />
        </mesh>
        <mesh position={[0, (-bedOuterH / 2 + TH) * SCALE, 0]} receiveShadow>
          <boxGeometry args={[truck.w * SCALE, TH * SCALE, truck.d * SCALE]} />
          <meshStandardMaterial color="#bdc3c7" />
        </mesh>
      </group>

      {(() => {
        const wheelY = Math.max(7, chassisH - 2);
        const leftX = centerX - bedOuterW * 0.45;
        const rightX = centerX + bedOuterW * 0.45;
        const frontZ = Math.max(45, cabD * 0.5);
        const backZ = cabD + bedOuterD - Math.max(55, bedOuterD * 0.18);
        return (
          <>
            <Wheel x={leftX} y={wheelY} z={frontZ} />
            <Wheel x={rightX} y={wheelY} z={frontZ} />
            <Wheel x={leftX} y={wheelY} z={backZ} />
            <Wheel x={rightX} y={wheelY} z={backZ} />
          </>
        );
      })()}
    </group>
  );
}

/* 카메라/애니 */
function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function CameraPreset({ controlsRef, target, offset = [2.4, 3.2, 8.5], onceKey }) {
  const { camera } = useThree();
  const didRef = useRef(false);

  useEffect(() => {
    didRef.current = false;
  }, [onceKey]);

  useEffect(() => {
    if (didRef.current) return;
    if (!target || target.length !== 3) return;

    const [tx, ty, tz] = target;
    const [ox, oy, oz] = offset;

    camera.position.set(tx + ox, ty + oy, tz + oz);
    camera.lookAt(tx, ty, tz);
    camera.updateProjectionMatrix();

    if (controlsRef?.current) {
      controlsRef.current.target.set(tx, ty, tz);
      controlsRef.current.update();
    }
    didRef.current = true;
  }, [camera, controlsRef, target, offset]);

  return null;
}

function FallingBox({ p, zOffsetCm, yOffsetCm, xOffsetCm, worldOffset, onSelect, isSelected, onDragEnd, controlsRef, externalRef }) {
  const meshRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const lastIntersect = useRef(new THREE.Vector3());

  const colors = ["#e57373", "#81c784", "#64b5f6", "#ffd54f", "#ba68c8", "#4db6ac"];
  const overflowColor = "#ff5252";
  const colorIndex = useMemo(() => 
    String(p.id).split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % colors.length
  , [p.id]);

  // 초기 위치 계산
  // 1. 초기 위치 계산 (기존 로직 그대로 변수만 선언)
  const initialPos = useMemo(() => [
      (worldOffset.x + xOffsetCm + p.pos.x) * SCALE,
      (p.pos.y + yOffsetCm) * SCALE,
      (worldOffset.z + p.pos.z + zOffsetCm) * SCALE
    ], [p.pos, worldOffset, xOffsetCm, yOffsetCm, zOffsetCm]);

    // 2. ✨ 핵심: 리액트가 위치를 초기화하지 않도록 처음 한 번만 직접 꽂아줌
    useEffect(() => {
      if (meshRef.current) {
        meshRef.current.position.set(...initialPos);
      }
    }, []); // 의존성 배열 비움 (마운트 시 딱 1번 실행)

    useEffect(() => {
      if (meshRef.current && externalRef) externalRef(meshRef.current);
    }, [externalRef]);

  // 2. 드래그 로직 (useFrame 내부에서 안전하게 처리)
  useFrame((state) => {
    if (!isDragging || !meshRef.current) return;

    // 1. 박스의 현재 월드 좌표를 가져옵니다.
    const worldPos = new THREE.Vector3();
    meshRef.current.getWorldPosition(worldPos);

    // 2. 바닥 평면(Y=worldPos.y)을 생성합니다. 
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -worldPos.y);
    const targetPoint = new THREE.Vector3();

    // 3. 마우스 광선과 평면이 만나는 점을 계산합니다.
    if (state.raycaster.ray.intersectPlane(floorPlane, targetPoint)) {
      const localPos = meshRef.current.parent.worldToLocal(targetPoint.clone());
      meshRef.current.position.set(localPos.x, meshRef.current.position.y, localPos.z);
    }
  });

  return (
      <mesh
        ref={meshRef}
        /* position={initialPos}  <-- ❌ 이 부분을 과감히 지웁니다! */
        onPointerDown={(e) => {
          e.stopPropagation();
          if (onSelect) onSelect(meshRef.current, p.id); 
          if (controlsRef?.current) {
            controlsRef.current.enabled = false; // 👈 이동 중에는 회전 금지
          }
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          if (controlsRef?.current) {
            controlsRef.current.enabled = true; // 👈 손 떼면 즉시 회전 허용
          }
          if (onDragEnd) onDragEnd(p.id, meshRef.current);
        }}
      >

      <boxGeometry args={[p.w * SCALE, p.h * SCALE, p.d * SCALE]} />
      <meshStandardMaterial 
        color={p._overflow ? "#ff5252" : colors[colorIndex]} 
        transparent={p._overflow}
        opacity={p._overflow ? 0.6 : 1} // 미적재 시 더 투명하게 해서 구분을 확실히
        // ✨ 선택 시 시각적 피드백 (이중클릭 방지용)
        emissive={isSelected ? "#ffffff" : "#000000"}
        emissiveIntensity={isSelected ? 0.4 : 0}
      />
    </mesh>
  );
}

function TruckGroup({ tw, startY, freeze, controlsRef, onDragEnd, meshRefs, onSelect, selectedId }) {
  const tr = tw.truck;
  const preset = tw.preset;
  const CAB_D = preset.cabD;
  const CHASSIS_H = preset.chassisH;

  // 1. [상태 관리] 개별 박스의 상태를 유지하기 위해 localPlacements 사용
  const [localPlacements, setLocalPlacements] = React.useState(tw.placements);
  const groupRef = useRef();

  // 2. [실시간 계산] 라벨에 표시될 숫자들
  const overflowItems = localPlacements.filter(p => p._overflow);
  const inTruckCount = localPlacements.length - overflowItems.length;
  const displayPct = localPlacements.length > 0 
    ? Math.round((inTruckCount / localPlacements.length) * 100) 
    : 0;
  const displayOverflow = overflowItems.length;

  // 트럭이 -Math.PI / 2로 회전되어 있기 때문에, **로컬 Z축이 너비(W)**이고 **로컬 X축이 길이(D)**입니다. 이 기준이 명확해야 내외부를 인식합니다.
  // 3. [핸들러] 드래그가 끝났을 때의 판정 로직
  const handleDragEnd = useCallback((id, mesh) => {
    if (!mesh || !groupRef.current) return;

    // 1. 드래그가 끝난 박스의 로컬 좌표 가져오기
    const localX = mesh.position.x;
    const localZ = mesh.position.z;

    // 2. 판정 기준값 (트럭의 -90도 회전 고려)
    const halfW = (tr.w * SCALE) / 2;
    const halfD = (tr.d * SCALE) / 2;
    
    // 트럭 적재함의 시작점과 중심점 계산 (X축이 트럭의 길이 방향임)
    const bedStart = (preset.cabD + preset.bodyPaddingD / 2) * SCALE;
    const bedCenter = bedStart + halfD;

    // 3. 판정 로직
    // Z축(너비): 중심(0)으로부터 halfW 안에 있는가?
    const isInW = Math.abs(localZ) <= halfW;
    // X축(길이): bedCenter로부터 halfD 안에 있는가?
    const isInD = Math.abs(localX - bedCenter) <= halfD;
    
    const isInTruck = isInW && isInD;

    // 4. 상태 업데이트
    setLocalPlacements(prev => prev.map(box => 
      box.id === id ? { ...box, _overflow: !isInTruck } : box
    ));

    // 원본 데이터(scene)에 반영하여 메인 전광판 숫자 갱신
    const targetItem = tw.placements.find(p => p.id === id);
    if (targetItem) targetItem._overflow = !isInTruck;
    
    if (onDragEnd) onDragEnd(); 
  }, [tr, preset, tw.placements, onDragEnd]);

  // 트럭 흔들림(애니메이션) 로직
  const shakeY = useRef(0);
  const shakeVelocity = useRef(0);
  const handleLand = useCallback(() => { shakeVelocity.current = -20; }, []);

  const localWheelY = Math.max(7, CHASSIS_H - 2);
  const W_RADIUS = 14;
  const liftY = Math.max(0, W_RADIUS - localWheelY);

  useFrame((_, delta) => {
    if (freeze || !groupRef.current) return;
    const k = 120; const damp = 8; const mass = 1.5;
    const force = -k * shakeY.current;
    const accel = force / mass;
    shakeVelocity.current += accel * delta;
    shakeVelocity.current -= shakeVelocity.current * damp * delta;
    shakeY.current += shakeVelocity.current * delta;
    groupRef.current.position.y = (liftY + shakeY.current) * SCALE;
    groupRef.current.rotation.set(shakeY.current * 0.01, -Math.PI / 2, 0);
  });

  return (
    <group
      ref={groupRef}
      key={tr.id}
      position={[tw.worldOffset.x * SCALE, liftY * SCALE, tw.worldOffset.z * SCALE]}
      rotation={[0, -Math.PI / 2, 0]}
    >
      <TruckShell
        truck={tr} cabD={CAB_D} chassisH={CHASSIS_H}
        bodyPaddingW={preset.bodyPaddingW} bodyPaddingD={preset.bodyPaddingD} bodyPaddingH={preset.bodyPaddingH}
        worldOffset={{ x: 0, z: 0 }}
      />

      <Html
        position={[(0 + 55) * SCALE, (CHASSIS_H + tr.h + 44) * SCALE, (CAB_D * 0.25) * SCALE]}
        style={{ pointerEvents: "none", transform: "translate(-50%, -50%)" }}
      >
        <div style={{
          background: "rgba(0,0,0,0.75)", color: "#fff", padding: "4px 12px", borderRadius: 999,
          fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap"
        }}>
          <span style={{ opacity: 0.75 }}>{preset.label}</span>
          <span>적재율 {displayPct}%</span>
          {displayOverflow > 0 && <span style={{ color: "#ff5252" }}> ⚠ 미적재 {displayOverflow}개</span>}
        </div>
      </Html>

      {localPlacements.map((p) => (
        <FallingBox
          key={p.id}
          p={p}
          onSelect={onSelect}
          isSelected={selectedId === p.id}
          startY={startY}
          delaySec={p._delayJitter ?? 0}
          durationSec={0.5}
          zOffsetCm={CAB_D + preset.bodyPaddingD / 2}
          yOffsetCm={CHASSIS_H}
          xOffsetCm={preset.bodyPaddingW / 2}
          worldOffset={{ x: 0, z: 0 }}
          onLand={handleLand}
          freeze={freeze}
          onDragEnd={handleDragEnd} 
          controlsRef={controlsRef}
          externalRef={(el) => { if (el) meshRefs.current[p.id] = el; }}
        />
      ))}
    </group>
  );
}

/* 메인 */
export default function TruckLoad3D({ result }) {
  const controlsRef = useRef();
  // ---------------------------------------------------드래그앤드롭 유나 추가
  const meshRefs = useRef({});
  const [truckLoads, setTruckLoads] = useState([]); // 초기값 빈 배열
  // TruckLoad3D 내부
  const [selectedMesh, setSelectedMesh] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  

  // 📍 선택 함수 (아이디와 메쉬를 동시에 저장)
  const handleSelect = useCallback((mesh, id) => {
    if (!mesh) return;
    setSelectedMesh(mesh);
    setSelectedId(id);
    // 절대 여기서 target._overflow를 건드리지 마세요!
  }, []);

  const btnStyle = {
    width: 50, height: 50, fontSize: 20, cursor: "pointer",
    backgroundColor: "rgba(255,255,255,0.9)", border: "none", borderRadius: 8
  };
  // 📍 배경 클릭 시 선택 해제 및 컨트롤 복구 로직 강화
  const handleMissed = useCallback(() => {
    setSelectedMesh(null);
    setSelectedId(null);
    if (controlsRef.current) {
      controlsRef.current.enabled = true; // 👈 회전 막힘 방지 핵심!
    }
  }, []);
  // 📍 조이스틱 버튼 스타일 (더 깔끔하게)
  const btnBaseStyle = {
    width: "42px", height: "42px",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "18px",
    cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    transition: "all 0.1s"
  };


  // 트럭을 먼저 불러온 뒤
  const trucks = useMemo(() => {
    const plan = result?.summary?.truck_plan ?? [];
    const expanded = [];

    plan.forEach((t, i) => {
      const type = t?.truck_type ?? "5T";
      const preset = TRUCK_PRESET[type] ?? TRUCK_PRESET["5T"];
      const count = Math.max(1, Number(t?.truck_count ?? 1));

      for (let k = 0; k < count; k++) {
        expanded.push({
          id: `${type}-${i}-${k}`,
          type,
          preset,

          // ✅ 서버 치수
          w: Number(t?.inner_w_cm ?? 230),
          d: Number(t?.inner_d_cm ?? 620),
          h: Number(t?.inner_h_cm ?? 230),

          // ✅ 서버가 준 적재/용량 정보(표시용)
          loadCbm: Number(t?.load_cbm ?? 0),
          capacityCbm: Number(t?.capacity_cbm ?? 0),
          loadPct: Number(t?.load_factor_pct ?? 0),
        });
      }
    });

    return expanded.length
      ? expanded
      : [{ id: "5T-0-0", type: "5T", preset: TRUCK_PRESET["5T"], w: 230, d: 620, h: 230, loadCbm: 0, capacityCbm: 0, loadPct: 0 }];
  }, [result]);

  // 이후에 짐 리스트 가져옴
  const items = useMemo(() => {
    const roomItems = (result?.rooms ?? []).flatMap((r) => r.items ?? []);
    const boxSpec = result?.summary?.box;
    const boxCount = Number(result?.summary?.boxes_count ?? 0);

    const boxItems = Array(boxCount).fill(0).map((_, i) => ({
      item_id: `box-${i}`,
      furniture_id: boxSpec?.furniture_id,
      name_kr: "이사 박스 5호",
      packed_w_cm: boxSpec?.packed_w_cm,
      packed_d_cm: boxSpec?.packed_d_cm,
      packed_h_cm: boxSpec?.packed_h_cm,
      allowed_rotations: boxSpec?.allowed_rotations || ["WDH", "DWH"],
      stackable: boxSpec?.stackable ?? true,
      can_stack_on_top: boxSpec?.can_stack_on_top ?? true,
    }));

    // 기본은 "부피 큰 순" 휴리스틱
    return [...roomItems, ...boxItems]
      .map((it) => ({ ...it, _vol: itemCbm(it) }))
      .sort((a, b) => (b._vol ?? 0) - (a._vol ?? 0));
  }, [result]);

// 이후에 scene 정의(trucks + items = scene)
  const scene = useMemo(() => {
    const { buckets, remainder } = splitItemsByTruckLoad(items, trucks);
    const GAP_TRUCK = 850;
    const out = [];

    let overflowTotal = remainder.length;

    // ✅ 동시에 와다다 + 약간 지터
    const JITTER_SEC = 0.12;
    const withJitter = (arr, keyPrefix) =>
      arr.map((p, idx) => ({ ...p, _delayJitter: hash01(`${keyPrefix}-${p.id}-${idx}`) * JITTER_SEC }));

    for (let i = 0; i < trucks.length; i++) {
      const tr = trucks[i];
      const preset = tr.preset;

      const worldOffset = { x: (i - (trucks.length - 1) / 2) * GAP_TRUCK, z: 0 };

      /* ✅ 여기서 "실제 3D 적재" 계산:
         - bin-packing-3d 여러 번 시도
         - 결과를 겹침 0으로 정리(겹치면 주변 탐색 -> 그래도 안되면 미적재 처리)
      */
      const res = packWithBinPacking3D_MultiTry(buckets[i], tr, 9);
      const safePacked = res.packedPlacements;

      // 미적재(overflow) 시각화: 트럭 옆에 배치(겹침 상관 없음)
      const overflowOriginX = tr.w + preset.bodyPaddingW + 60;
      const overflowOriginZ = preset.cabD + 20;

      const overflowPlacements = simplePack(res.unfittedItems ?? [], tr, {
        overflow: true,
        respectBounds: false,
        gap: 8,
        originX: overflowOriginX,
        originZ: overflowOriginZ,
        originY: 0,
      });

      // overflowTotal은 "치수불가 remainder + (트럭에 못 넣은 unfitted)"
      overflowTotal += (res.unfittedItems?.length ?? 0);

      out.push({
        truck: tr,
        preset,
        worldOffset,
        placements: [
          ...withJitter(safePacked, `TRUCK-${tr.id}-IN`),
          ...withJitter(overflowPlacements, `TRUCK-${tr.id}-OF`),
        ],
        overflowCount: res.unfittedItems?.length ?? 0,
      });
    }

    // 치수 자체가 어떤 트럭에도 안 들어가는(remainder) 항목들
    let globalRemainderPlacements = [];
    if (remainder.length && out[0]) {
      const tr0 = out[0].truck;
      const preset0 = out[0].preset;

      const overflowOriginX = tr0.w + preset0.bodyPaddingW + 60;
      const overflowOriginZ = preset0.cabD + 360;

      globalRemainderPlacements = simplePack(remainder, tr0, {
        overflow: true,
        respectBounds: false,
        gap: 10,
        originX: overflowOriginX,
        originZ: overflowOriginZ,
        originY: 0,
      })
        .map((p) => ({ ...p, name: `치수불가: ${p.name}` }))
        .map((p, idx) => ({ ...p, _delayJitter: hash01(`GLOBAL-${p.id}-${idx}`) * JITTER_SEC }));
    }

    return { trucks: out, overflowTotal, globalRemainderPlacements };
  }, [items, trucks]);

  // 부피가 큰 변수들 / 이는 scene 이후에 필요함
  const maxTruckH = useMemo(() => Math.max(...trucks.map((t) => t.h)), [trucks]);
  const cameraTarget = useMemo(() => [-3, 1.2, 1.4], []);
  const startY = useMemo(() => maxTruckH + 10 + 220, [maxTruckH]);

  // TruckLoad3D.jsx 내부 checkTruckPlacement, 콜백 함수 드래그 판정 로직
  // TruckLoad3D.jsx 내부의 기존 checkTruckPlacement를 이 코드로 교체하세요.
  const checkTruckPlacement = useCallback(() => {
    if (!scene) return;

    // 1. 각 트럭 그룹(TruckGroup) 내부에서 이미 계산된 _overflow 상태를 기반으로 
    //    메인 전광판에 표시할 숫자(newTruckLoads)를 다시 집계합니다.
    const newTruckLoads = scene.trucks.map(tw => {
      const { truck, placements } = tw;
      
      // TruckGroup이 업데이트한 개별 박스의 _overflow 상태를 체크
      const overflowCount = placements.filter(p => p._overflow === true).length;
      const insideCount = placements.length - overflowCount;

      return {
        truckId: truck.id,
        // 실시간 적재율 계산
        loadPct: placements.length > 0 ? Math.round((insideCount / placements.length) * 100) : 0,
        overflowCount: overflowCount
      };
    });

    // 2. 상태를 업데이트하여 화면 상단의 '⚠️ 트럭에 못 실은 짐' 숫자를 바꿉니다.
    setTruckLoads(newTruckLoads);
  }, [scene]);

  // 버튼 클릭 시 상자 이동 함수
  // 📍 2. moveBox: 이동과 판정을 동시에 수행
  const moveBox = (direction) => {
    if (!selectedMesh || !selectedId) return;
    const STEP = 20 * SCALE; 

    // 방향 보정 (트럭이 -90도 회전되어 있으므로)
    // 화면 위(Up) -> 트럭 앞(X+), 화면 아래(Down) -> 트럭 뒤(X-)
    // 화면 왼쪽(Left) -> 트럭 왼쪽(Z-), 화면 오른쪽(Right) -> 트럭 오른쪽(Z+)
    if (direction === 'up')    selectedMesh.position.x += STEP; 
    if (direction === 'down')  selectedMesh.position.x -= STEP;
    if (direction === 'left')  selectedMesh.position.z -= STEP;
    if (direction === 'right') selectedMesh.position.z += STEP;
    // 층수 조절 추가 (3-1번 문제 해결용)
    if (direction === 'pageUp')   selectedMesh.position.y += STEP; 
    if (direction === 'pageDown') selectedMesh.position.y -= STEP;

    // 실시간 판정
    scene.trucks.forEach(tw => {
      const target = tw.placements.find(p => p.id === selectedId);
      if (target) {
        const { x, z } = selectedMesh.position;
        const tr = tw.truck;
        const pr = tw.preset;

        // 트럭 로컬 범위 내에 있는지 확인
        const isInX = x >= pr.cabD * SCALE && x <= (pr.cabD + tr.d) * SCALE;
        const isInZ = Math.abs(z) <= (tr.w / 2) * SCALE;

        target._overflow = !(isInX && isInZ);
      }
    });

    checkTruckPlacement(); // 전광판 갱신
  };

  // 실시간으로 미적재 합산
  const currentTotalOverflow = useMemo(() => {
    // 1. 각 트럭 내 박스들의 실시간 _overflow 합산
    const truckOverflow = scene.trucks.reduce((acc, tw) => 
      acc + tw.placements.filter(p => p._overflow).length, 0);
    
    // 2. 치수불가(globalRemainder) 박스들의 실시간 _overflow 합산
    const remainderOverflow = scene.globalRemainderPlacements.filter(p => p._overflow).length;
    
    return truckOverflow + remainderOverflow;
  }, [truckLoads, scene]);

  // scene를 사용하는 상태 및 이펙트를 배치
  const [placementsState, setPlacementsState] = useState([]);

  // 초기 데이터 로드 시 state 설정
  useEffect(() => {
    if (scene.trucks.length > 0) {
      // 모든 트럭의 placements를 하나로 관리하거나 트럭별로 관리
      setPlacementsState(scene.trucks[0].placements);
    }
  }, [scene]);

  // 짐의 상태를 업데이트하는 핸들러
  const handleBoxMove = useCallback((boxId, isInTruck) => {
    setPlacementsState(prev => prev.map(box => {
      if (box.id === boxId) {
        // 적재 상태(_overflow)와 이름 등을 변경
        return { ...box, _overflow: !isInTruck };
      }
      return box;
      }));
  }, []);


  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", maxHeight: 320, minHeight: 220, borderRadius: 12, overflow: "hidden", background: "#81d4fa", position: "relative" }}>
      
      {/* ⚠️ 트럭에 못 실은 짐 안내 (기존 유지) */}
      {scene.overflowTotal > 0 && (
        <div style={{ position: "absolute", top: 10, left: 10, zIndex: 2, background: "rgba(255,255,255,0.95)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10, padding: "6px 10px", fontSize: 12, fontWeight: 900, color: "#d32f2f" }}>
          ⚠️ 트럭에 못 실은 짐: {currentTotalOverflow}개
        </div>
      )}

      {/* 🕹️ 인형뽑기 컨트롤러 버튼 (Canvas 바깥에 배치) */}
      {selectedId && (
        <div style={{ 
          position: "absolute", bottom: "15px", left: "15px", // 👈 좌측 하단으로 이동
          zIndex: 1000,
          display: "flex", gap: "10px", alignItems: "flex-end",
          backgroundColor: "rgba(0,0,0,0.05)", padding: "10px", borderRadius: "15px"
        }}>
          {/* 수평/수직 이동 패드 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 42px)", gap: "4px" }}>
            <div /> 
            <button onClick={() => moveBox('up')} style={btnBaseStyle}>▲</button> 
            <div />
            <button onClick={() => moveBox('left')} style={btnBaseStyle}>◀</button>
            <button onClick={() => moveBox('down')} style={btnBaseStyle}>▼</button>
            <button onClick={() => moveBox('right')} style={btnBaseStyle}>▶</button>
          </div>

          {/* 높이 조절 패드 (따로 분리해서 덜 헷갈리게) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <button onClick={() => moveBox('pageUp')} style={{...btnBaseStyle, color: "#2196f3"}}>H▲</button>
            <button onClick={() => moveBox('pageDown')} style={{...btnBaseStyle, color: "#2196f3"}}>H▼</button>
          </div>
        </div>
      )}

      <Canvas shadows camera={{ fov: 40, near: 0.5, far: 4000, position: [30, 20, 30] }} onPointerMissed={handleMissed}>
        <CameraPreset controlsRef={controlsRef} target={cameraTarget} offset={[2.4, 3.2, 8.5]} onceKey={`${result?.estimate_id ?? "x"}-v3`} />
        <Sky sunPosition={[100, 50, 50]} turbidity={0.2} rayleigh={0.15} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[50, 150, 50]} intensity={1.8} castShadow />
        <Environment preset="park" />

        {/* 배경 환경 */}
        <group scale={[SCALE, SCALE, SCALE]}>
          <ResidentialEnvironment />
        </group>

        {/* 트럭들 */}
        {scene.trucks.map(tw => (
          <TruckGroup
            key={tw.truck.id}
            tw={tw}
            startY={startY}
            onDragEnd={checkTruckPlacement}
            onSelect={handleSelect} //선택 함수 전달
            selectedId={selectedId}
            controlsRef={controlsRef}
            meshRefs={meshRefs}
          />
        ))}

        {/* 나머지 짐들 */}
        {scene.globalRemainderPlacements.length > 0 && scene.trucks[0] && (() => {
          const tr0 = scene.trucks[0].truck;
          const preset0 = scene.trucks[0].preset;
  
          return (
            <group 
              position={[scene.trucks[0].worldOffset.x * SCALE, 0, scene.trucks[0].worldOffset.z * SCALE]} 
              rotation={[0, -Math.PI / 2, 0]}
            >
              {scene.globalRemainderPlacements.map((p) => (
                <FallingBox
                  key={`GLOBAL-${p.id}`}
                  p={p}
                  startY={startY}
                  isSelected={selectedId === p.id}
                  onSelect={setSelectedMesh}
                  onDragEnd={checkTruckPlacement}
                  controlsRef={controlsRef}
                  // 위치 계산을 위한 props 추가 (이게 빠져있었네요!)
                  zOffsetCm={preset0.cabD + preset0.bodyPaddingD / 2}
                  yOffsetCm={preset0.chassisH}
                  xOffsetCm={preset0.bodyPaddingW / 2}
                  worldOffset={{ x: 0, z: 0 }}
                  externalRef={(el) => { if (el) meshRefs.current[p.id] = el; }}
                />
              ))}
            </group>
          );
        })()}

        <ContactShadows position={[0, 0.1, 0]} opacity={0.6} scale={100} blur={2} far={4} color="#000" />
        <OrbitControls ref={controlsRef} makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} enablePan={false} />
      </Canvas>
    </div>
  );
}
