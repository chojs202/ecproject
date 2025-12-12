// src/App.jsx
import './App.css';
import React, {
  useEffect,
  useState,
  useContext,
  lazy,
  Suspense,
} from 'react';
import { ScrollToTop } from './ScrollToTop';
import { Navbar } from './Components/Navbar/Navbar';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import LoadingPage from './Components/LoadingPage/LoadingPage';
import { Footer } from './Components/Footer/Footer';
import men_banner from './Components/Assets/men_banner.png';
import women_banner from './Components/Assets/women_banner.png';
import kid_banner from './Components/Assets/kid_banner.png';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './Components/PageTransition/PageTransition';
import { ShopContext } from './Context/ShopContext';
import { HelmetProvider } from "react-helmet-async";

// ===============================
// 🔹 페이지 / 주요 화면 lazy 로딩
// ===============================
const Shop = lazy(() =>
  import('./Pages/Shop').then((m) => ({ default: m.Shop }))
);

const ShopCategory = lazy(() =>
  import('./Pages/ShopCategory').then((m) => ({ default: m.ShopCategory }))
);

const Product = lazy(() =>
  import('./Pages/Product').then((m) => ({ default: m.Product }))
);

const Cart = lazy(() =>
  import('./Pages/Cart').then((m) => ({ default: m.Cart }))
);

const Login = lazy(() =>
  import('./Pages/Login').then((m) => ({ default: m.Login }))
);

const Signup = lazy(() =>
  import('./Pages/SignUp').then((m) => ({ default: m.Signup }))
);

const EditUser = lazy(() => import('./Components/EditUser/EditUser'));
const ChangePassword = lazy(() =>
  import('./Components/ChangePassword/ChangePassword')
);
const Checkout = lazy(() => import('./Components/Checkout/Checkout'));
const OrderHistory = lazy(() =>
  import('./Components/OrderHistory/OrderHistory')
);
const OrderSuccess = lazy(() =>
  import('./Components/OrderSuccess/OrderSuccess')
);
const SearchPage = lazy(() => import('./Components/Search/SearchPage'));
const Like = lazy(() => import('./Components/Like/Like'));

// ===============================
// 🔹 라우트 + 페이지 트랜지션
// ===============================
function AnimatedRoutes() {
  const location = useLocation();

  // 배너 미리 로딩 (기존 기능 유지)
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
        <Route
          path="/"
          element={
            <PageTransition>
              <Shop />
            </PageTransition>
          }
        />
        <Route
          path="/men"
          element={
            <PageTransition>
              <ShopCategory banner={men_banner} category="men" />
            </PageTransition>
          }
        />
        <Route
          path="/women"
          element={
            <PageTransition>
              <ShopCategory banner={women_banner} category="women" />
            </PageTransition>
          }
        />
        <Route
          path="/kid"
          element={
            <PageTransition>
              <ShopCategory banner={kid_banner} category="kid" />
            </PageTransition>
          }
        />
        <Route
          path="/:category/product/:productId"
          element={
            <PageTransition>
              <Product />
            </PageTransition>
          }
        />
        <Route
          path="/cart"
          element={
            <PageTransition>
              <Cart />
            </PageTransition>
          }
        />
        <Route
          path="/login"
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />
        <Route
          path="/signup"
          element={
            <PageTransition>
              <Signup />
            </PageTransition>
          }
        />
        <Route
          path="/edituser"
          element={
            <PageTransition>
              <EditUser />
            </PageTransition>
          }
        />
        <Route
          path="/changepassword"
          element={
            <PageTransition>
              <ChangePassword />
            </PageTransition>
          }
        />
        <Route
          path="/checkout"
          element={
            <PageTransition>
              <Checkout />
            </PageTransition>
          }
        />
        <Route
          path="/order-success"
          element={
            <PageTransition>
              <OrderSuccess />
            </PageTransition>
          }
        />
        <Route
          path="/orders"
          element={
            <PageTransition>
              <OrderHistory />
            </PageTransition>
          }
        />
        <Route
          path="/search"
          element={
            <PageTransition>
              <SearchPage />
            </PageTransition>
          }
        />
        <Route
          path="/like"
          element={
            <PageTransition>
              <Like />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

// 🔹 라우트 lazy 로딩 중에만 보여줄 fallback
function RouteFallback() {
  return (
    <div className="route-fallback">
      <div className="route-fallback-spinner" />
    </div>
  );
}

// ===============================
// 🔹 App (인트로 로딩 + 레이아웃)
// ===============================
function App() {
  const { initialLoadStatus } = useContext(ShopContext); // "loading" | "success" | "error"

  const [showIntro, setShowIntro] = useState(() => {
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro') === 'true';
    return !hasSeenIntro;
  });

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval;

    if (showIntro && initialLoadStatus === 'loading') {
      setProgress(0);

      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 1;
        });
      }, 40);
    }

    if (initialLoadStatus === 'success' || initialLoadStatus === 'error') {
      setProgress(100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [initialLoadStatus, showIntro]);

  useEffect(() => {
    if (!showIntro) return;
    if (initialLoadStatus === 'loading') return;

    if (initialLoadStatus === 'error') {
      setShowIntro(false);
      sessionStorage.setItem('hasSeenIntro', 'true');
      return;
    }

    if (initialLoadStatus === 'success') {
      const timer = setTimeout(() => {
        setShowIntro(false);
        sessionStorage.setItem('hasSeenIntro', 'true');
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [showIntro, initialLoadStatus]);

  return (
     <HelmetProvider>
      <BrowserRouter>
        {/* ✅ 인트로(로딩) 오버레이 — 기존 그대로 */}
        <AnimatePresence>
          {showIntro && <LoadingPage progress={progress} />}
        </AnimatePresence>
    
        <ScrollToTop />
        <Navbar />
    
        {/* ✅ main 레이아웃은 항상 유지 */}
        <main className="app-main">
          {/* ✅ 이 안에서만 lazy 라우트 교체 */}
          <Suspense fallback={<RouteFallback />}>
            <AnimatedRoutes />
          </Suspense>
        </main>
    
        <Footer />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
