import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../../Context/ShopContext";
import "./ChangePassword.css";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { logout } = useContext(ShopContext); // Context에서 logout 가져오기
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [successMessage, setSuccessMessage] = useState("");

  // 🚨 로그인 여부 확인
  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (!token) {
      alert("We need login");
      navigate("/login");
    }
  }, [navigate]);

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ 버튼 활성화 여부
  const allFieldsFilled =
    formData.currentPassword.trim() &&
    formData.newPassword.trim() &&
    formData.confirmPassword.trim();

  const updatePassword = async () => {
    if (!formData.currentPassword) return alert("You must enter your current password.");
    if (formData.newPassword.length < 8)
      return alert("New password must be at least 8 characters long.");

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(formData.newPassword))
      return alert("The new password must include both English and numbers.");

    if (formData.currentPassword === formData.newPassword)
      return alert("The new password must be different from the existing password.");

    if (formData.newPassword !== formData.confirmPassword)
      return alert("The new password and the verification password do not match.");

    try {
      const res = await fetch("http://localhost:4000/changepassword", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("auth-token"),
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // ✅ 토큰 삭제 + Navbar 상태 실시간 반영
        logout(); // Context logout 호출

        setSuccessMessage("The password change was successful.");

        // 2초 후 로그인 페이지로 이동
        setTimeout(() => navigate("/login"), 2000);
      } else {
        alert(data.errors);
      }
    } catch (err) {
      console.error("Error updating password:", err);
      alert("Server Error.");
    }
  };

  return (
    <div className="changepassword">
      <div className="changepassword-container">
        <h1>Change Password</h1>
        <div className="changepassword-fields">
          <input
            type="password"
            name="currentPassword"
            placeholder="Now Password"
            value={formData.currentPassword}
            onChange={changeHandler}
          />
          <input
            type="password"
            name="newPassword"
            placeholder="New Password ( Eng+Num , over 8)"
            value={formData.newPassword}
            onChange={changeHandler}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Check The New Password"
            value={formData.confirmPassword}
            onChange={changeHandler}
          />
        </div>

        <button
          className="changepassword-btn"
          onClick={updatePassword}
          disabled={!allFieldsFilled}
        >
          Change Password
        </button>

        {successMessage && (
          <div className="changepassword-success-overlay">
            <div className="changepassword-success-modal">
              <h2>Success Change Password</h2>
              <p>{successMessage}</p>
              <button
                className="changepassword-success-btn"
                onClick={() => navigate("/login")}
              >
                Go Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangePassword;
