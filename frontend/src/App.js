import './App.css';
import { ScrollToTop } from './ScrollToTop';
import { Navbar } from './Components/Navbar/Navbar';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Shop } from './Pages/Shop';
import { ShopCategory } from './Pages/ShopCategory';
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

function AnimatedRoutes() {
  const location = useLocation();

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
  return (
      <BrowserRouter>
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
