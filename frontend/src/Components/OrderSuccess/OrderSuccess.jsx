import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../../Context/ShopContext"; // ShopContext import
import "./OrderSuccess.css";
import { API } from "../../config";

export const OrderSuccess = () => {
  const [order, setOrder] = useState(null);
  const { clearCart, dispatch } = useContext(ShopContext);

  useEffect(() => {
    const fetchLatestOrder = async () => {
      try {
        const res = await fetch(`${API}/api/orders/orders`, {
          headers: { "auth-token": localStorage.getItem("auth-token") },
        });
        const data = await res.json();
        if (data.success && data.orders.length > 0) {
          setOrder(data.orders[0]); // 최신 주문 1개만 가져오기
        }
      } catch (err) {
        console.error("Failed to fetch latest order:", err);
      }
    };
    fetchLatestOrder();

    // ✅ 주문 성공 후 장바구니 및 할인 코드 초기화
    clearCart();
    dispatch({ type: "SET_PROMO", discount: 0, promoApplied: false, promoCode: "" });
    localStorage.removeItem("promoCode");
    localStorage.removeItem("discount");
    localStorage.removeItem("promoApplied");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!order) return <p className="loading">Loading...</p>;

  return (
    <div className="order-success-container">
      <h1>Order Successful! 🎉</h1>
      <p>Thank you for your purchase. Here are your order details:</p>

      <h2 className="order-id">Order ID: {order._id ?? "N/A"}</h2>
      <p className="order-date">
        Placed on: {order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}
      </p>

      <table className="order-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Size</th>
            <th>Quantity</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item, idx) => {
            const itemTotal = item.price * item.quantity;
            return (
              <tr key={idx}>
                <td>{item.name ?? "N/A"}</td>
                <td>{item.size ?? "N/A"}</td>
                <td>{item.quantity ?? 0}</td>
                <td>${itemTotal.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h3 className="order-total">
        Total Paid: ${order.finalAmount?.toFixed(2) ?? 0}
      </h3>
      {order.discount > 0 && (
        <p className="order-discount">
          Total Discount: ${order.discount?.toFixed(2)}
        </p>
      )}

      <div className="continue-shopping-container">
        <Link to="/" className="continue-shopping">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
