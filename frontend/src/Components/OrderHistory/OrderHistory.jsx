import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./OrderHistory.css";
import { API } from "../../config";

export const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [expandedIds, setExpandedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API}/orders`, {
          headers: { "auth-token": localStorage.getItem("auth-token") },
        });
        const data = await res.json();
        if (data.success) setOrders(data.orders);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
    };
    fetchOrders();
  }, []);

  const toggleOrder = (id) => {
    if (expandedIds.includes(id)) {
      setExpandedIds(expandedIds.filter((eid) => eid !== id));
    } else {
      setExpandedIds([...expandedIds, id]);
    }
  };

  // 페이지네이션
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  return (
    <div className="order-history-container">
      <h1>Your Orders 📦</h1>

      {orders.length === 0 ? (
        <p className="no-orders">You have no orders yet.</p>
      ) : (
        <>
          {currentOrders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <span>Order ID: </span>
                <span
                  className="order-id-text"
                  onClick={() => toggleOrder(order._id)}
                >
                  {order._id}
                </span>
                <p className="order-date">
                  Placed on:{" "}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>

              {expandedIds.includes(order._id) && (
                <div className="order-details">
                  <table className="order-table">
                    <thead>
                      <tr>
                        <th>Product</th>
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
                    Total Paid: ${(order.finalAmount ?? 0).toFixed(2)}
                  </h3>
                  {(order.discount ?? 0) > 0 && (
                    <p className="order-discount">
                      Total Discount: ${(order.discount ?? 0).toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* 페이지네이션 버튼 */}
          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx + 1}
                  className={currentPage === idx + 1 ? "active" : ""}
                  onClick={() => setCurrentPage(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <div className="continue-shopping-container">
        <Link to="/" className="continue-shopping">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderHistory;
