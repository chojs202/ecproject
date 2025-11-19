import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../../Context/ShopContext";
import "./ChangePassword.css";
import { API } from "../../config";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { logout } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");   // ✅ 추가
  const [loading, setLoading] = useState(false);          // ✅ 추가

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
    // 입력 중일 때 이전 에러는 자연스럽게 제거
    if (errorMessage) setErrorMessage("");
  };

  // ✅ 버튼 활성화 여부 (기존 로직 유지)
  const allFieldsFilled =
    formData.currentPassword.trim() &&
    formData.newPassword.trim() &&
    formData.confirmPassword.trim();

  // ✅ 비밀번호 변경 요청 (에러 처리 보강 버전)
  const updatePassword = async () => {
    // 이전 에러 초기화
    setErrorMessage("");

    // --- 프론트 유효성 검사 (기존 alert → 화면 메시지로 변경) ---
    if (!formData.currentPassword) {
      setErrorMessage("You must enter your current password.");
      return;
    }
    if (formData.newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(formData.newPassword)) {
      setErrorMessage("The new password must include both English and numbers.");
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setErrorMessage("The new password must be different from the existing password.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage("The new password and the verification password do not match.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/api/users/me/password`, {
        method: "PATCH",
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

      // 🔒 세션 만료 처리
      if (res.status === 401) {
        logout(); // 토큰/상태 정리
        setErrorMessage("Your session has expired. Please log in again.");
        navigate("/login", { replace: true });
        return;
      }

      let data = null;
      try {
        data = await res.json();
      } catch (_) {
        // JSON이 아닐 수도 있으니 그냥 넘어감
      }

      const serverMessage =
        data?.error ||
        data?.errors ||
        data?.message ||
        data?.msg ||
        "";

      // 🔍 HTTP 상태코드 + success 플래그 기반 에러 처리
      if (!res.ok || !data?.success) {
        if (res.status === 400) {
          // 주로 현재 비밀번호 오류 같은 케이스
          setErrorMessage(serverMessage || "Current password is incorrect.");
        } else if (res.status >= 500) {
          setErrorMessage(
            serverMessage || "Server error occurred. Please try again later."
          );
        } else {
          setErrorMessage(serverMessage || "Failed to change password.");
        }
        return;
      }

      // ✅ 성공 처리 (기존 동작 유지)
      logout(); // Navbar 상태 포함 전체 로그아웃

      setSuccessMessage("The password change was successful.");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Error updating password:", err);
      setErrorMessage("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="changepassword">
      <div className="changepassword-container">
        <h1>Change Password</h1>

        {/* ✅ 전역 에러 메시지 (alert 대신 화면에 노출) */}
        {errorMessage && (
          <p className="changepassword-error-global">{errorMessage}</p>
        )}

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
          disabled={!allFieldsFilled || loading}   // ✅ 로딩 시도 비활성
        >
          {loading ? "Processing..." : "Change Password"}
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
