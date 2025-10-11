
import './App.css';
import { Navbar } from './Components/Navbar/Navbar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Shop } from './Pages/Shop';
import { ShopCategory } from './Pages/ShopCategory';
import { Product } from './Pages/Product';
import { Cart } from './Pages/Cart';
import { Login } from './Pages/Login';
import { Footer } from './Components/Footer/Footer';
import { Signup } from './Pages/SignUp';
import EditUser from './Components/EditUser/EditUser';
import men_banner from './Components/Assets/men_banner.png'
import women_banner from './Components/Assets/women_banner.png'
import kid_banner from './Components/Assets/kid_banner.png'
import ChangePassword from './Components/ChangePassword/ChangePassword';
import Checkout from './Components/Checkout/Checkout';
import OrderHistory  from './Components/OrderHistory/OrderHistory';
import OrderSuccess  from './Components/OrderSuccess/OrderSuccess';
import ShopContextProvider from './Context/ShopContext';
import SearchPage from './Components/Search/SearchPage';
import Like from './Components/Like/Like';

function App() {
  return (
    <ShopContextProvider>
      <BrowserRouter>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Shop/>}/>
          <Route path="/men" element={<ShopCategory banner={men_banner} category="men"/>}/>
          <Route path="/women" element={<ShopCategory banner={women_banner} category="women"/>}/>
          <Route path="/kid" element={<ShopCategory banner={kid_banner} category="kid"/>}/>
          <Route path="/product" element={<Product/>}>
            <Route path=":productId" element={<Product/>}/>
          </Route>
          <Route path="/cart" element={<Cart/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/signup" element={<Signup/>}/>
          <Route path="/edituser" element={<EditUser/>}/>
          <Route path="/changepassword" element={<ChangePassword/>}/>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/like" element={<Like />} />
        </Routes>
        <Footer/>
      </BrowserRouter>
    </ShopContextProvider>
  );
}

export default App;
