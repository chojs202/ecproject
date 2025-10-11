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

  const { cartItems, all_product, discount } = useContext(ShopContext);

  // 선택된 항목 가져오기
  const locationState = location.state || {};
  const selectedKeys = locationState.selectedKeys || [];

  // 선택된 상품 필터링
  const itemsToCheckout = selectedKeys.map(key => {
    const [idStr, size] = key.split("-");
    const id = Number(idStr);
    const product = all_product?.find(p => p.id === id);
    const qty = cartItems?.[id]?.[size] || 0;
    if (!product || qty <= 0) return null;
    return { id, size, name: product.name, price: product.new_price, quantity: qty };
  }).filter(Boolean);

  if (itemsToCheckout.length === 0) {
    return <p>No items selected for checkout.</p>;
  }

  const selectedSubtotal = itemsToCheckout.reduce((sum, item) => sum + item.price * item.quantity, 0);


  const discountPercent = discount || 0;

  const discountRatio = discountPercent / 100; // 예: 10 → 0.1
  const proportionDiscount = selectedSubtotal * discountRatio;
  const localFinalAmount = Math.max(selectedSubtotal - proportionDiscount, 0);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || localFinalAmount <= 0) return;

    setLoading(true);

    try {
      // 1) Stripe PaymentIntent 생성
      const res = await fetch("http://localhost:4000/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: localFinalAmount }),
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

        // 3) 주문 생성 API 호출
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
            totalAmount: selectedSubtotal,   // 원래 합계
            discount: proportionDiscount,    // 할인 금액
            finalAmount: localFinalAmount,   // 최종 결제 금액
            discountPercent: discount,       // 몇 % 할인인지 추가 저장
          }),
        });

  
        // 5) 주문 완료 페이지 이동
        navigate("/order-success");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Payment failed. Please try again.");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

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
            disabled={!stripe || loading || localFinalAmount <= 0}
          >
            {loading ? "Processing..." : `Pay $${localFinalAmount.toFixed(2)}`}
          </button>
          {errorMessage && <p className="checkout-error">{errorMessage}</p>}
        </form>
      )}
    </div>
  );
}
