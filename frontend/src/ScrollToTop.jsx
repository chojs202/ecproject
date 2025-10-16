import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // or "instant" for immediate jump
    });
  }, [pathname]); // ✅ 경로가 바뀔 때마다 실행

  return null; // 화면에 아무것도 렌더하지 않음
};
