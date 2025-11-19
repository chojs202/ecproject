// src/Context/ShopContext.jsx
import {
  createContext,
  useEffect,
  useReducer,
  useCallback,
  useRef,
  useState,
} from "react";
import { API } from "../config";

export const ShopContext = createContext(null);

// ==============================
// ✅ 초기 상태
// ==============================
const initialState = {
  isLoggedIn: !!localStorage.getItem("auth-token"),
  cartItems: JSON.parse(localStorage.getItem("cartItems") || "{}"),       // 로그인 유저 카트
  guestCart: JSON.parse(localStorage.getItem("guestCartItems") || "{}"), // 비회원 카트
  promoCode: "",
  discount: 0,
  discountPercent: 0,
  promoApplied: false,
  likedProducts: [], // 찜 목록
};

// ==============================
// ✅ reducer
// ==============================
function reducer(state, action) {
  switch (action.type) {
    case "LOGOUT":
      localStorage.removeItem("auth-token");
      localStorage.removeItem("discountPercent");
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
        discountPercent: 0,
        promoApplied: false,
        promoCode: "",
        likedProducts: [],
      };

    case "SET_CART":
      return { ...state, cartItems: action.payload };

    case "SET_GUEST_CART":
      localStorage.setItem("guestCartItems", JSON.stringify(action.payload));
      return { ...state, guestCart: action.payload };

    case "SET_PROMO":
      return {
        ...state,
        discountPercent: action.discountPercent ?? 0,
        discount: action.discountAmount || 0,
        promoApplied: action.promoApplied,
        promoCode: action.promoCode,
      };

    case "SET_LOGIN":
      return { ...state, isLoggedIn: action.payload };

    case "SET_LIKED_PRODUCTS":
      return { ...state, likedProducts: action.payload };

    default:
      return state;
  }
}

// ==============================
// ✅ Provider
// ==============================
const ShopContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { isLoggedIn, cartItems, guestCart, promoCode, discount, promoApplied, likedProducts } = state;

  const [all_product, setAll_Product] = useState([]);
  const [initialLoadStatus, setInitialLoadStatus] = useState("loading");
  const hasMerged = useRef(false);
  const updateQueue = useRef(Promise.resolve());

  // ---------------------
  // 비회원용 임시 guestId
  // ---------------------
  useEffect(() => {
    let guestId = localStorage.getItem("guestId");
    if (!guestId) {
      guestId = crypto.randomUUID();
      localStorage.setItem("guestId", guestId);
    }
  }, []);

  // ---------------------
  // 서버 카트 동기화 (전체 PUT)
  // ---------------------
  const updateCartDB = (updatedCart, retryCount = 3, retryDelay = 500) => {
    updateQueue.current = updateQueue.current.then(async () => {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      for (let attempt = 1; attempt <= retryCount; attempt++) {
        try {
          await fetch(`${API}/api/cart`, {
            method: "PUT", // 🔵 전체 cartData 덮어쓰기
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedCart),
          });

          localStorage.setItem("cartItems", JSON.stringify(updatedCart));
          break;
        } catch (err) {
          console.error(`Failed to update cart (attempt ${attempt}):`, err);
          if (attempt < retryCount) {
            await new Promise((res) => setTimeout(res, retryDelay));
          }
        }
      }
    });

    return updateQueue.current;
  };

  // ---------------------
  // 비회원 카트 업데이트
  // ---------------------
  const updateGuestCart = (updatedCart) => {
    dispatch({ type: "SET_GUEST_CART", payload: updatedCart });
  };

  // ---------------------
  // 비회원 → 로그인 카트 병합
  // ---------------------
  const mergeLocalCartToServer = async () => {
    const token = localStorage.getItem("auth-token");
    const hasMergedFlag = localStorage.getItem("hasMerged") === "true";
    if (!token || hasMerged.current || hasMergedFlag) return;

    try {
      // 🔵 서버 카트 조회: GET /api/cart
      const serverRes = await fetch(`${API}/api/cart`, {
        method: "GET",
        headers: { "auth-token": token },
      });
      const serverData = await serverRes.json();
      const serverCart = serverData?.cartData || {};

      // 병합 (수량 합산)
      const mergedCart = { ...serverCart };
      for (const id in guestCart) {
        if (!mergedCart[id]) mergedCart[id] = {};
        for (const size in guestCart[id]) {
          mergedCart[id][size] =
            (mergedCart[id][size] || 0) + guestCart[id][size];
        }
      }

      // 서버에 반영 (전체 PUT)
      await updateCartDB(mergedCart);

      // 상태/로컬 정리
      dispatch({ type: "SET_CART", payload: mergedCart });
      dispatch({ type: "SET_GUEST_CART", payload: {} });
      localStorage.removeItem("guestCartItems");
      hasMerged.current = true;
      localStorage.setItem("hasMerged", "true");
    } catch (err) {
      console.error("Failed to merge carts:", err);
    }
  };

  // ---------------------
  // 쿠폰 상태 복원
  // ---------------------
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

  // ---------------------
  // 초기 데이터 로딩
  // ---------------------
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await fetch(`${API}/api/products`);
        const data = await res.json();

        if (data.success && Array.isArray(data.products)) {
          setAll_Product(data.products);
          setInitialLoadStatus("success");   // ✅ 정상 로딩 완료
        } else {
          console.error("🚫 상품 데이터 형식이 올바르지 않습니다:", data);
          setAll_Product([]);
          setInitialLoadStatus("error");     // ✅ 응답은 왔지만 형식이 이상한 경우
        }
      } catch (err) {
        console.error("❌ 상품 데이터를 불러오는 중 오류 발생:", err);
        setAll_Product([]);
        setInitialLoadStatus("error");       // ✅ 네트워크/서버 오류
      }
    };

    fetchAllProducts();

    const token = localStorage.getItem("auth-token");
    const isLogged = !!token;
    dispatch({ type: "SET_LOGIN", payload: isLogged });

    if (isLogged) {
      mergeLocalCartToServer();
      fetchLikedProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------
  // 장바구니 조작
  // ---------------------
  function addToCart({ id, size }) {
    if (isLoggedIn) {
      const prevItem = cartItems[id] || {};
      const prevQty = prevItem[size] || 0;
      const newCart = {
        ...cartItems,
        [id]: { ...prevItem, [size]: prevQty + 1 },
      };
      dispatch({ type: "SET_CART", payload: newCart });
      updateCartDB(newCart);
    } else {
      const prevItem = guestCart[id] || {};
      const prevQty = prevItem[size] || 0;
      const newCart = {
        ...guestCart,
        [id]: { ...prevItem, [size]: prevQty + 1 },
      };
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
      if (!newCart[id] || Object.keys(newCart[id]).length === 0) {
        delete newCart[id];
      }

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
      if (!newCart[id] || Object.keys(newCart[id]).length === 0) {
        delete newCart[id];
      }

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

  // ---------------------
  // 장바구니 계산
  // ---------------------
  const getTotalCartAmount = useCallback(() => {
    const cart = isLoggedIn ? cartItems : guestCart;
    let totalAmount = 0;

    for (const item in cart) {
      const sizes = cart[item];
      for (const sz in sizes) {
        // id 타입 불일치 방지용 String 비교
        const itemInfo = all_product.find(
          (p) => String(p.id) === String(item)
        );
        if (itemInfo) totalAmount += itemInfo.new_price * sizes[sz];
      }
    }
    return totalAmount;
  }, [cartItems, guestCart, all_product, isLoggedIn]);

  const getTotalCartAmountWithDiscount = useCallback(() => {
    const total = getTotalCartAmount();
    const discountRatio = promoApplied
      ? (state.discountPercent || 0) / 100
      : 0;
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

  // ---------------------
  // 쿠폰 적용
  // ---------------------
  const applyPromoCode = async (code, callback) => {
    const token = localStorage.getItem("auth-token");
    if (!token) return callback?.(false, "Please login");
    if (!code) return callback?.(false, "Enter code");
    if (promoApplied && promoCode === code) {
      return callback?.(false, "Promo already applied");
    }

    const cartTotal = getTotalCartAmount();

    try {
      const response = await fetch(`${API}/api/promos/applypromo`, {
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
          promoCode: code,
        });
        localStorage.setItem("discountPercent", data.discountPercent);
        localStorage.setItem("promoApplied", "true");
        localStorage.setItem("promoCode", code);
        callback?.(true, "Promo applied");
      } else {
        dispatch({
          type: "SET_PROMO",
          discountPercent: 0,
          promoApplied: false,
          promoCode: "",
        });
        localStorage.removeItem("discountPercent");
        localStorage.removeItem("promoApplied");
        localStorage.removeItem("promoCode");
        callback?.(false, data.message);
      }
    } catch (err) {
      console.error(err);
      callback?.(false, "Failed to apply promo");
    }
  };

  // ---------------------
  // 카트 전체 초기화 (주문 완료용)
  // ---------------------
  const clearCart = async () => {
    // 클라이언트 상태/로컬 먼저 초기화
    dispatch({ type: "SET_CART", payload: {} });
    dispatch({ type: "SET_GUEST_CART", payload: {} });
    localStorage.removeItem("cartItems");
    localStorage.removeItem("guestCartItems");

    const token = localStorage.getItem("auth-token");
    if (token) {
      try {
        // 서버 cartData도 빈 객체로 덮어쓰기
        await updateCartDB({});
      } catch (err) {
        console.error("Failed to clear cart in DB:", err);
      }
    }
  };

  // ---------------------
  // 상품 검색
  // ---------------------
  const searchProducts = async (keyword) => {
    if (!keyword) return [];
    try {
      const res = await fetch(
        `${API}/api/products/search?q=${encodeURIComponent(keyword)}`
      );
      const data = await res.json();
      if (data.success) return data.products || [];
      return [];
    } catch (err) {
      console.error("Failed to search products:", err);
      return [];
    }
  };

  // ---------------------
  // 찜(Like) 기능
  // ---------------------
  const fetchLikedProducts = async () => {
    const token = localStorage.getItem("auth-token");
    if (!isLoggedIn || !token) return;
    try {
      const res = await fetch(`${API}/api/likes/likes`, {
        headers: { "auth-token": token },
      });
      if (res.status === 401) {
        console.warn("Your login has expired.");
        dispatch({ type: "LOGOUT" });
        return;
      }
      const data = await res.json();
      if (data.success)
        dispatch({ type: "SET_LIKED_PRODUCTS", payload: data.products });
    } catch (err) {
      console.error("Failed to fetch liked products:", err);
    }
  };

  const toggleLike = async (productId) => {
    if (!isLoggedIn) return;
    try {
      const res = await fetch(`${API}/api/likes/products/${productId}/like`, {
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
    return likedProducts.some((product) => product.id === productId);
  };

  // ---------------------
  // Context 값
  // ---------------------
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
    discountPercent: state.discountPercent || 0,
    promoApplied,
    isLoggedIn,
    logout: () => {
      dispatch({ type: "LOGOUT" });
      localStorage.removeItem("likedProducts");
    },
    mergeLocalCartToServer,
    applyPromoCode,
    clearCart,
    searchProducts,
    likedProducts,
    fetchLikedProducts,
    toggleLike,
    isProductLiked,
    dispatch,
    initialLoadStatus,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
