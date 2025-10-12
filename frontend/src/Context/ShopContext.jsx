import { createContext, useEffect, useReducer, useCallback, useRef, useState } from "react";
import { API } from "../config";


export const ShopContext = createContext(null);



const initialState = {
  isLoggedIn: !!localStorage.getItem("auth-token"),
  cartItems: JSON.parse(localStorage.getItem("cartItems") || "{}"),
  guestCart: JSON.parse(localStorage.getItem("guestCartItems") || "{}"),
  promoCode: "",
  discount: 0,
  promoApplied: false,
  likedProducts: [], // 추가: 찜 목록
};

function reducer(state, action) {
  switch (action.type) {
    case "LOGOUT":
      localStorage.removeItem("auth-token");
      localStorage.removeItem("discount");
      localStorage.removeItem("promoApplied");
      localStorage.removeItem("promoCode");
      localStorage.removeItem("hasMerged");
      localStorage.removeItem("cartItems");
      localStorage.removeItem("guestCartItems");
      return {
        ...state,
        isLoggedIn: false,
        cartItems: {},
        discount: 0,
        promoApplied: false,
        promoCode: "",
        likedProducts: [], // 로그아웃 시 초기화
      };
    case "SET_CART":
      return { ...state, cartItems: action.payload };
    case "SET_GUEST_CART":
      localStorage.setItem("guestCartItems", JSON.stringify(action.payload));
      return { ...state, guestCart: action.payload };
    case "SET_PROMO":
      return {
        ...state,
        discountPercent: action.discountPercent, // ✅ 퍼센트는 이쪽으로
        discount: action.discountAmount || 0, 
        promoApplied: action.promoApplied,
        promoCode: action.promoCode,
      };
    case "SET_LOGIN":
      return { ...state, isLoggedIn: action.payload };
    case "SET_LIKED_PRODUCTS":
      return { ...state, likedProducts: action.payload }; // 찜 목록 업데이트
    default:
      return state;
    }
  }
  

const ShopContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { isLoggedIn, cartItems, guestCart, promoCode, discount, promoApplied, likedProducts } = state;

  const [all_product, setAll_Product] = useState([]);
  const hasMerged = useRef(false);
  const updateQueue = useRef(Promise.resolve());

  // --------------------- 비회원용 임시 ID ---------------------
  useEffect(() => {
    let guestId = localStorage.getItem("guestId");
    if (!guestId) {
      guestId = crypto.randomUUID();
      localStorage.setItem("guestId", guestId);
    }
  }, []);

  // --------------------- updateCartDB 큐 + 재시도 ---------------------
  const updateCartDB = (updatedCart, retryCount = 3, retryDelay = 500) => {
    updateQueue.current = updateQueue.current.then(async () => {
      for (let attempt = 1; attempt <= retryCount; attempt++) {
        try {
          const token = localStorage.getItem("auth-token");
          if (!token) return;

          await fetch(`${API}/updatecart`, {
            method: "POST",
            headers: { "auth-token": token, "Content-Type": "application/json" },
            body: JSON.stringify(updatedCart),
          });

          localStorage.setItem("cartItems", JSON.stringify(updatedCart));
          break;
        } catch (err) {
          console.error(`Failed to update cart (attempt ${attempt}):`, err);
          if (attempt < retryCount) await new Promise((res) => setTimeout(res, retryDelay));
        }
      }
    });
    return updateQueue.current;
  };

  // --------------------- 비회원 카트 업데이트 ---------------------
  const updateGuestCart = (updatedCart) => {
    dispatch({ type: "SET_GUEST_CART", payload: updatedCart });
  };

  // --------------------- 비회원 → 로그인 카트 병합 ---------------------
  const mergeLocalCartToServer = async () => {
    const token = localStorage.getItem("auth-token");
    const hasMergedFlag = localStorage.getItem("hasMerged") === "true";
    if (!token || hasMerged.current || hasMergedFlag) return;

    try {
      const serverRes = await fetch(`${API}/getcart`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "auth-token": token },
      });
      const serverData = await serverRes.json();
      const serverCart = serverData?.cartData || {};

      const mergedCart = { ...serverCart };
      for (const id in guestCart) {
        if (!mergedCart[id]) mergedCart[id] = {};
        for (const size in guestCart[id]) {
          mergedCart[id][size] = (mergedCart[id][size] || 0) + guestCart[id][size];
        }
      }

      dispatch({ type: "SET_CART", payload: mergedCart });
      await updateCartDB(mergedCart);

      dispatch({ type: "SET_GUEST_CART", payload: {} });
      localStorage.removeItem("guestCartItems");

      hasMerged.current = true;
      localStorage.setItem("hasMerged", "true");
    } catch (err) {
      console.error("Failed to merge carts:", err);
    }
  };

  
  // --------------------- 로컬스토리지에서 쿠폰 상태 복원 ---------------------
    useEffect(() => {
    const storedPromoApplied = localStorage.getItem("promoApplied") === "true";
    const storedDiscount = localStorage.getItem("discountPercent");
    const storedPromoCode = localStorage.getItem("promoCode");

    if (storedPromoApplied && storedDiscount) {
      dispatch({
        type: "SET_PROMO",
        discountPercent: Number(storedDiscount),
        promoApplied: true,
        promoCode: storedPromoCode || "",
      });
    }
  }, []);

  // --------------------- 초기 데이터 로딩 ---------------------

  useEffect(() => {
    fetch(`${API}/allproducts`)
      .then((res) => res.json())
      .then((data) => setAll_Product(data));

    const token = localStorage.getItem("auth-token");
    dispatch({ type: "SET_LOGIN", payload: !!token });
    
    if (token) mergeLocalCartToServer();
    if (token) fetchLikedProducts(); // 찜 목록 불러오기
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  // --------------------- 장바구니 조작 ---------------------
  function addToCart({ id, size }) {
    if (isLoggedIn) {
      const prevItem = cartItems[id] || {};
      const prevQty = prevItem[size] || 0;
      const newCart = { ...cartItems, [id]: { ...prevItem, [size]: prevQty + 1 } };
      dispatch({ type: "SET_CART", payload: newCart });
      updateCartDB(newCart);
    } else {
      const prevItem = guestCart[id] || {};
      const prevQty = prevItem[size] || 0;
      const newCart = { ...guestCart, [id]: { ...prevItem, [size]: prevQty + 1 } };
      updateGuestCart(newCart);
    }
  }

  const removeFromCart = ({ id, size }) => {
    if (isLoggedIn) {
      const prevItem = cartItems[id] || {};
      const prevQty = prevItem[size] || 0;
      if (prevQty <= 0) return;
      const newQty = prevQty - 1;
      const newItem = { ...prevItem, [size]: newQty };
      if (newQty <= 0) delete newItem[size];
      const newCart = { ...cartItems, [id]: newItem };
      if (!newCart[id] || Object.keys(newCart[id]).length === 0) delete newCart[id];
      dispatch({ type: "SET_CART", payload: newCart });
      updateCartDB(newCart);
    } else {
      const prevItem = guestCart[id] || {};
      const prevQty = prevItem[size] || 0;
      if (prevQty <= 0) return;
      const newQty = prevQty - 1;
      const newItem = { ...prevItem, [size]: newQty };
      if (newQty <= 0) delete newItem[size];
      const newCart = { ...guestCart, [id]: newItem };
      if (!newCart[id] || Object.keys(newCart[id]).length === 0) delete newCart[id];
      updateGuestCart(newCart);
    }
  };

  const removeItemCompletely = ({ id, size }) => {
    if (isLoggedIn) {
      if (!cartItems[id] || !cartItems[id][size]) return;
      const updated = { ...cartItems };
      delete updated[id][size];
      if (Object.keys(updated[id]).length === 0) delete updated[id];
      dispatch({ type: "SET_CART", payload: updated });
      updateCartDB(updated);
    } else {
      if (!guestCart[id] || !guestCart[id][size]) return;
      const updated = { ...guestCart };
      delete updated[id][size];
      if (Object.keys(updated[id]).length === 0) delete updated[id];
      updateGuestCart(updated);
    }
  };

  const addFromCart = ({ id, size }) => addToCart({ id, size });

  // --------------------- 장바구니 계산 ---------------------
  const getTotalCartAmount = useCallback(() => {
    const cart = isLoggedIn ? cartItems : guestCart;
    let totalAmount = 0;
    for (const item in cart) {
      const sizes = cart[item];
      for (const sz in sizes) {
        const itemInfo = all_product.find((p) => p.id === Number(item));
        if (itemInfo) totalAmount += itemInfo.new_price * sizes[sz];
      }
    }
    return totalAmount;
  }, [cartItems, guestCart, all_product, isLoggedIn]);

  const getTotalCartAmountWithDiscount = useCallback(() => {
    const total = getTotalCartAmount();
    const discountRatio = promoApplied ? (state.discountPercent || 0) / 100 : 0;
    return total - total * discountRatio;
  }, [getTotalCartAmount, promoApplied, state.discountPercent]);

  const getTotalCartItems = () => {
    const cart = isLoggedIn ? cartItems : guestCart;
    let totalItem = 0;
    for (const item in cart) {
      const sizes = cart[item];
      for (const sz in sizes) totalItem += sizes[sz];
    }
    return totalItem;
  };

  // --------------------- 기존 기능: applyPromoCode, clearCart, searchProducts ---------------------
  const applyPromoCode = async (code, callback) => {
    const token = localStorage.getItem("auth-token");
    if (!token) return callback?.(false, "Please login");
    if (!code) return callback?.(false, "Enter code");
    if (promoApplied && promoCode === code) return callback?.(false, "Promo already applied");

    const cartTotal = getTotalCartAmount();

    try {
      const response = await fetch(`${API}/applypromo`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "auth-token": token },
        body: JSON.stringify({ code, cartTotal }),
      });
      const data = await response.json();

      if (data.success) {
       dispatch({
          type: "SET_PROMO",
          discountPercent: data.discountPercent, // 예: 10
          promoApplied: true,
          promoCode: code
        });
        localStorage.setItem("discountPercent", data.discountPercent);
        
        localStorage.setItem("promoApplied", "true");
        localStorage.setItem("promoCode", code);
        callback?.(true, "Promo applied");
      } else {
        dispatch({ type: "SET_PROMO", discount: 0, promoApplied: false, promoCode: "" });
        localStorage.removeItem("discount");
        localStorage.removeItem("promoApplied");
        localStorage.removeItem("promoCode");
        callback?.(false, data.message);
      }
    } catch (err) {
      console.error(err);
      callback?.(false, "Failed to apply promo");
    }
  };

  const clearCart = async () => {
    dispatch({ type: "SET_CART", payload: {} });
    dispatch({ type: "SET_GUEST_CART", payload: {} });
    localStorage.removeItem("cartItems");
    localStorage.removeItem("guestCartItems");
    const token = localStorage.getItem("auth-token");
    if (token) {
      try {
        await fetch(`${API}/updatecart`, {
          method: "POST",
          headers: { "auth-token": token, "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
      } catch (err) {
        console.error("Failed to clear cart in DB:", err);
      }
    }
  };

  const searchProducts = async (keyword) => {
    if (!keyword) return [];
    try {
      const res = await fetch(`${API}/search?q=${encodeURIComponent(keyword)}`);
      const data = await res.json();
      if (data.success) return data.products || [];
      return [];
    } catch (err) {
      console.error("Failed to search products:", err);
      return [];
    }
  };

  // --------------------- 추가: 찜(Like) 기능 ---------------------
  const fetchLikedProducts = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await fetch(`${API}/likes`, {
        headers: { "auth-token": localStorage.getItem("auth-token") },
      });
      const data = await res.json();
      if (data.success) dispatch({ type: "SET_LIKED_PRODUCTS", payload: data.products });
    } catch (err) {
      console.error("Failed to fetch liked products:", err);
    }
  };

  const toggleLike = async (productId) => {
    if (!isLoggedIn) return;
    try {
      const res = await fetch(`${API}/products/${productId}/like`, {
        method: "POST",
        headers: { "auth-token": localStorage.getItem("auth-token") },
      });
      const data = await res.json();
      if (data.success) fetchLikedProducts();
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  const isProductLiked = (productId) => {
    return likedProducts.some(product => product.id === productId);
  };

  // --------------------- Context 값 ---------------------
  const contextValue = {
    cartItems,
    guestCart,
    addToCart,
    removeFromCart,
    removeItemCompletely,
    addFromCart,
    getTotalCartAmount,
    getTotalCartAmountWithDiscount,
    getTotalCartItems,
    all_product,
    promoCode,
    discount,
    discountPercent: state.discountPercent || 0, // ✅ 추가
    promoApplied,
    isLoggedIn,
    logout: () => dispatch({ type: "LOGOUT" }),
    mergeLocalCartToServer,
    applyPromoCode,
    clearCart,
    searchProducts,
    likedProducts,
    fetchLikedProducts,
    toggleLike,
    isProductLiked,
    dispatch
  };

  return <ShopContext.Provider value={contextValue}>{children}</ShopContext.Provider>;
};

export default ShopContextProvider;
