import React, { useContext, useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { ShopContext } from "../../Context/ShopContext";
import { useNavigate, useLocation } from "react-router-dom";
import './CheckoutForm.css';

export default function CheckoutForm() {
  
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { cartItems, all_product, discount, clearCart } = useContext(ShopContext);

  // --------------------- 선택된 항목 안전하게 가져오기 ---------------------
  const locationState = location.state || {};
  const selectedKeys = locationState.selectedKeys || [];

  // --------------------- 선택된 상품만 필터링 ---------------------
  const itemsToCheckout = selectedKeys.map(key => {
    const [idStr, size] = key.split("-");
    const id = Number(idStr);
    const product = all_product?.find(p => p.id === id);
    const qty = cartItems?.[id]?.[size] || 0;

    if (!product || qty <= 0) return null;
    return { id, size, name: product.name, price: product.new_price, quantity: qty };
  }).filter(Boolean);

  // --------------------- 선택된 상품 subtotal ---------------------
  const selectedSubtotal = itemsToCheckout.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // --------------------- 선택된 상품 기준 할인 ---------------------
  const proportionDiscount = discount * (selectedSubtotal / (cartItems ? Object.keys(cartItems).reduce((acc, id) => {
    const sizes = cartItems[id];
    const product = all_product?.find(p => p.id === Number(id));
    if (!product) return acc;
    return acc + Object.values(sizes).reduce((s, qty) => s + product.new_price * qty, 0);
  }, 0) : 1));

  // --------------------- 최종 결제 금액 ---------------------
  const finalAmount = Math.max(selectedSubtotal - proportionDiscount, 0);

  const stripeErrorMessages = {
    incorrect_number: "The card number is incorrect.",
    invalid_number: "The card number is invalid.",
    invalid_expiry_month: "The card's expiration month is invalid.",
    invalid_expiry_year: "The card's expiration year is invalid.",
    invalid_cvc: "The card's CVC is invalid.",
    expired_card: "The card has expired.",
    incorrect_cvc: "The CVC number is incorrect.",
    card_declined: "The card was declined. Please try another card.",
    processing_error: "An error occurred while processing the card.",
    incorrect_zip: "The card's postal code is incorrect.",
    insufficient_funds: "The card has insufficient funds.",
    lost_card: "The card has been reported lost.",
    stolen_card: "The card has been reported stolen.",
    generic_decline: "The card was declined.",
  };

  // --------------------- 결제 처리 ---------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || finalAmount <= 0) return;

    setLoading(true);

    try {
      // 1) Stripe PaymentIntent 생성
      const res = await fetch("http://localhost:4000/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalAmount }),
      });
      const data = await res.json();
      if (!data.clientSecret) throw new Error("Failed to create PaymentIntent");

      // 2) 카드 결제 처리
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        const friendlyMessage = stripeErrorMessages[result.error.code] || result.error.message;
        setErrorMessage(friendlyMessage);
        setSuccess(false);
      } else if (result.paymentIntent.status === "succeeded") {
        setSuccess(true);
        setErrorMessage("");

        // 3) 주문 생성 API 호출 (선택된 상품 기준 가격 적용)
        const itemsForOrder = itemsToCheckout.map(item => {
          const itemProportion = (item.price * item.quantity) / selectedSubtotal;
          const discountedPrice = item.price - (proportionDiscount * itemProportion / item.quantity);
          return {
            productId: item.id,
            name: item.name,
            size: item.size,
            quantity: item.quantity,
            price: parseFloat(discountedPrice.toFixed(2)),
          };
        });

        await fetch("http://localhost:4000/create-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": localStorage.getItem("auth-token"),
          },
          body: JSON.stringify({
            items: itemsForOrder,
            totalAmount: selectedSubtotal,
            discount: proportionDiscount,
            finalAmount,
          }),
        });

        // 4) 장바구니 초기화
        await clearCart();

        // 5) 주문 완료 페이지 이동
        navigate("/order-success");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Payment failed. Please try again.");
      setSuccess(false);
    }

    setLoading(false);
  };

  console.log("location.state.selectedKeys:", selectedKeys);
  console.log("cartItems:", cartItems);
  console.log("all_product:", all_product);
  console.log("itemsToCheckout:", itemsToCheckout);
  console.log("selectedSubtotal:", selectedSubtotal, "proportionDiscount:", proportionDiscount, "finalAmount:", finalAmount);

  // --------------------- UI ---------------------
  return (
    <div className="checkout-wrapper">
      {success ? (
        <div className="checkout-success">
          <h2>Payment Successful!</h2>
        </div>
      ) : (
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="checkout-card-element">
            <CardElement options={{ hidePostalCode: true }} />
          </div>
          <button
            type="submit"
            className="checkout-submit-btn"
            disabled={!stripe || loading || finalAmount <= 0}
          >
            {loading ? "Processing..." : `Pay $${finalAmount.toFixed(2)}`}
          </button>
          {errorMessage && <p className="checkout-error">{errorMessage}</p>}
        </form>
      )}
    </div>
  );
}
