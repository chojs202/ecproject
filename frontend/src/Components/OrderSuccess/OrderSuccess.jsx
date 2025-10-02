import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./OrderSuccess.css";

export const OrderSuccess = () => {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchLatestOrder = async () => {
      try {
        const res = await fetch("http://localhost:4000/orders", {
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
