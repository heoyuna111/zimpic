import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEstimateStore } from "../../store/estimateStore";
import FindMoverModal from "../modal/FindMoverModal";


function Header() {

  const navigate = useNavigate();
  const reset = useEstimateStore((s) => s.reset);

  const handleLogoClick = (e) => {
    e.preventDefault(); // NavLink 기본 이동 막고
    reset();            // 견적 상태 초기화
    navigate("/");      // 홈으로 이동
  };
  const [openModal, setOpenModal] = useState(false);


  return (
    <>
      <nav className="navbar bg-white border-bottom sticky-top py-3">
        <div className="inner">
          <div className="container-fluid d-flex align-items-center">
            {/* Logo */}
            <NavLink
              to="/"
              className="navbar-brand d-flex align-items-center m-0 p-0"
              onClick={handleLogoClick}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src="/logo_kr.svg"
                  alt="ZIMPIC"
                  style={{
                    height: "34px",
                    width: "auto",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>
            </NavLink>

            {/* Menu */}
            <div className="d-flex align-items-center gap-4 ms-auto">
              <NavLink to="/HomePage" className="header-navlink btn btn-link p-0 text-decoration-none text-dark small fw-semibold">
                견적 계산해보기
              </NavLink>
              <div
                className="header-navlink btn btn-link p-0 text-decoration-none text-dark small fw-semibold"
                style={{ cursor: "pointer" }}
                onClick={() => setOpenModal(true)}
              >
                내 주변 이사업체 찾기
              </div>

            </div>
          </div>
        </div>

        {/* 헤더 메뉴 hover 밑줄 효과용 CSS */}
        <style>{`
          .header-navlink{
            position: relative;
          }
          .header-navlink::after{
            content: "";
            position: absolute;
            left: 0;
            bottom: -6px;
            width: 0%;
            height: 2px;
            border-radius: 999px;
            background: var(--bs-primary);
            transition: width .18s ease;
          }
          .header-navlink:hover::after{
            width: 100%;
          }
        `}</style>
      </nav>
      <FindMoverModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
      />
      </>
  );



}

export default Header;
