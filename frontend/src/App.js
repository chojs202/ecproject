import './App.css';
import { useEffect, useState, useContext } from 'react';
import { ScrollToTop } from './ScrollToTop';
import { Navbar } from './Components/Navbar/Navbar';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Shop } from './Pages/Shop';
import { ShopCategory } from './Pages/ShopCategory';
import LoadingPage from './Components/LoadingPage/LoadingPage';
import { Product } from './Pages/Product';
import { Cart } from './Pages/Cart';
import { Login } from './Pages/Login';
import { Footer } from './Components/Footer/Footer';
import { Signup } from './Pages/SignUp';
import EditUser from './Components/EditUser/EditUser';
import men_banner from './Components/Assets/men_banner.png';
import women_banner from './Components/Assets/women_banner.png';
import kid_banner from './Components/Assets/kid_banner.png';
import ChangePassword from './Components/ChangePassword/ChangePassword';
import Checkout from './Components/Checkout/Checkout';
import OrderHistory from './Components/OrderHistory/OrderHistory';
import OrderSuccess from './Components/OrderSuccess/OrderSuccess';
import SearchPage from './Components/Search/SearchPage';
import Like from './Components/Like/Like';
import { AnimatePresence } from "framer-motion";
import PageTransition from './Components/PageTransition/PageTransition';
import { ShopContext } from './Context/ShopContext';

function AnimatedRoutes() {
  const location = useLocation();
   useEffect(() => {
    const images = [men_banner, women_banner, kid_banner];
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Shop /></PageTransition>} />
        <Route path="/men" element={<PageTransition><ShopCategory banner={men_banner} category="men" /></PageTransition>} />
        <Route path="/women" element={<PageTransition><ShopCategory banner={women_banner} category="women" /></PageTransition>} />
        <Route path="/kid" element={<PageTransition><ShopCategory banner={kid_banner} category="kid" /></PageTransition>} />
        <Route path="/product/:productId" element={<PageTransition><Product /></PageTransition>} />
        <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        <Route path="/edituser" element={<PageTransition><EditUser /></PageTransition>} />
        <Route path="/changepassword" element={<PageTransition><ChangePassword /></PageTransition>} />
        <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
        <Route path="/order-success" element={<PageTransition><OrderSuccess /></PageTransition>} />
        <Route path="/orders" element={<PageTransition><OrderHistory /></PageTransition>} />
        <Route path="/search" element={<PageTransition><SearchPage /></PageTransition>} />
        <Route path="/like" element={<PageTransition><Like /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const { initialLoadStatus } = useContext(ShopContext); // "loading" | "success" | "error"

  // ✅ 이 세션(탭)에서 인트로(로딩 화면)를 보여줄지 여부
  const [showIntro, setShowIntro] = useState(() => {
    const hasSeenIntro = sessionStorage.getItem("hasSeenIntro") === "true";
    // 한 번도 안 봤으면 true → 인트로 보여줌
    return !hasSeenIntro;
  });

  // ✅ 로딩 상태 + 인트로 상태에 따라 인트로 종료 타이밍 제어
  useEffect(() => {
    if (!showIntro) return; // 이미 인트로를 안 보여주는 상태면 더 볼 필요 없음

    // 1) 아직 초기 데이터 로딩 중이면 인트로 유지
    if (initialLoadStatus === "loading") return;

    // 2) 에러인 경우: 인트로는 바로 종료 (필요 시 에러용 UI는 라우트/페이지에서 처리)
    if (initialLoadStatus === "error") {
      setShowIntro(false);
      sessionStorage.setItem("hasSeenIntro", "true");
      return;
    }

    // 3) 성공인 경우: 살짝 딜레이 후 자연스럽게 인트로 종료
    if (initialLoadStatus === "success") {
      const timer = setTimeout(() => {
        setShowIntro(false);
        sessionStorage.setItem("hasSeenIntro", "true");
      }, 8000); // 0.8초 정도 여유

      return () => clearTimeout(timer);
    }
  }, [showIntro, initialLoadStatus]);

  return (
    <BrowserRouter>
      {/* ✅ 인트로(로딩) 오버레이: 첫 진입 + 초기 로딩 단계에서만 화면 전체 덮기 */}
      {showIntro && <LoadingPage />}

      <ScrollToTop />
      <Navbar />
      <main>
        <AnimatedRoutes />
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
