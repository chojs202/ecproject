import { useContext, useState } from 'react';
import './CartItems.css';
import { ShopContext } from '../../Context/ShopContext';
import { useNavigate } from 'react-router-dom';

export const CartItems = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    guestCart,
    all_product,
    addFromCart,
    removeFromCart,
    removeItemCompletely,
    applyPromoCode,
    discountPercent,
    promoApplied,
    isLoggedIn
  } = useContext(ShopContext);

  const [inputCode, setInputCode] = useState("");
  const [selectedItems, setSelectedItems] = useState({});

  // 로그인 상태에 따라 카트 선택
  const cart = isLoggedIn ? cartItems : guestCart;

  const totalItemCount = Object.values(cart).reduce((acc, sizes) => {
    return acc + Object.values(sizes).filter(qty => qty > 0).length;
  }, 0);

  const selectedKeys = Object.keys(selectedItems).filter(key => selectedItems[key]);

  const selectedSubtotal = selectedKeys.reduce((acc, itemKey) => {
    const [idStr, size] = itemKey.split("-");
    const id = Number(idStr);
    const product = all_product.find(p => p.id === id);
    if (!product?.new_price) return acc; // ✅ 추가: product.new_price가 없으면 건너뛰기
  
    const qty = cart[id]?.[size] || 0;
    if (qty <= 0) return acc;
    return acc + product.new_price * qty;
  }, 0);


  // 할인 비율 (0 ~ 1)
  const discountRatio = promoApplied ? (discountPercent || 0) / 100 : 0; // ✅ NaN 방지

  // 선택된 아이템 기준 할인액/총액
  const selectedDiscount = promoApplied ? selectedSubtotal * discountRatio : 0;
  const selectedTotal = selectedSubtotal - selectedDiscount;

  // 퍼센트는 그대로 표시
 const shownDiscountPercent = promoApplied ? discountPercent : 0;

  const handleApplyPromo = () => {
    if (!inputCode) return alert("Please enter a promo code");
    if (!localStorage.getItem('auth-token')) return alert("Login required");

    applyPromoCode(inputCode, (success, message) => alert(message));
    setInputCode("");
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      alert("You must be logged in to proceed to checkout");
      navigate("/login");
      return;
    }
    if (selectedKeys.length === 0) {
      alert("Please select items to purchase");
      return;
    }

    navigate("/checkout", { state: { selectedKeys } });
    setSelectedItems({});
  };

  return (
    <div className="cartitems-container">

      {/* --------------------- All Select 체크박스 + 삭제 버튼 --------------------- */}
      <div className="cartitems-header-row">
        <label className="cartitem-all-select">
          <input
            type="checkbox"
            checked={selectedKeys.length === totalItemCount && totalItemCount > 0}
            onChange={(e) => {
              if (e.target.checked) {
                const allSelected = {};
                Object.keys(cart).forEach(itemId => {
                  const sizes = cart[itemId];
                  Object.keys(sizes).forEach(size => {
                    if (sizes[size] > 0) {
                      allSelected[`${itemId}-${size}`] = true;
                    }
                  });
                });
                setSelectedItems(allSelected);
              } else {
                setSelectedItems({});
              }
            }}
          />
          All Select
        </label>

        <button
          className="delete-selected-btn"
          disabled={selectedKeys.length === 0}
          onClick={() => {
            selectedKeys.forEach(itemKey => {
              const [idStr, size] = itemKey.split("-");
              removeItemCompletely({ id: Number(idStr), size });
            });
            setSelectedItems({});
          }}
        >
          Delete Selected
        </button>
      </div>

      <hr />

      {/* --------------------- 상품 리스트 --------------------- */}
      {Object.keys(cart).map(itemId => {
        const product = all_product.find(p => p.id === Number(itemId));
        if (!product) return null;
        const itemSizes = cart[itemId];

        return Object.keys(itemSizes).map(size => {
          const quantity = itemSizes[size];
          if (quantity <= 0) return null;
          const itemKey = `${product.id}-${size}`;

          return (
            <div key={itemKey} className="cartitems-row">
              <input
                type="checkbox"
                id={`cartitem-${itemKey}`}
                className="cartitem-checkbox"
                checked={!!selectedItems[itemKey]}
                onChange={(e) =>
                  setSelectedItems(prev => ({ ...prev, [itemKey]: e.target.checked }))
                }
              />

              <div className="cartitem-info">
                <img src={product.image[0]} alt="" className="cartitem-img" />
                <div className="cartitem-text">
                  <p className="cartitem-name">{product.name}</p>
                  <p className="cartitem-price">${product.new_price.toFixed(2)}</p>
                  <p className="cartitem-size">Size: {size}</p>
                </div>
              </div>

              <div className="cartitem-actions">
                <button onClick={() => removeFromCart({id: product.id, size})}>-</button>
                <span>{quantity}</span>
                <button onClick={() => addFromCart({id: product.id, size})}>+</button>
              </div>
            </div>
          );
        });
      })}

      {/* --------------------- 하단 합계 --------------------- */}
      <div className="cartitems-footer">
        <div className="cartitems-total-container">
          <h1>Cart Totals</h1>

          <div className="cartitems-total-row">
            <p>SubTotal</p>
            <p>${selectedSubtotal.toFixed(2)}</p>
          </div>

          {promoApplied && (
            <div className="cartitems-total-row">
              <p>Discount ({shownDiscountPercent}%)</p>
              <p>- ${selectedDiscount.toFixed(2)}</p>
            </div>
          )}
          
          <div className="cartitems-total-row">
            <p>Shipping Fee</p>
            <p>Free</p>
          </div>

          <div className="cartitems-total-row">
            <h3>Total</h3>
            <h3>${(selectedTotal || 0).toFixed(2)}</h3>
          </div>

          <button onClick={handleCheckout}>PROCEED TO CHECKOUT</button>
        </div>

        <div className="cartitems-promo">
          <p>If you have a promo code, enter it here</p>
          <div className="cartitems-promo-box">
            <input
              type="text"
              placeholder="Only available when logged in"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleApplyPromo(); } }}
            />
            <button onClick={handleApplyPromo}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};
