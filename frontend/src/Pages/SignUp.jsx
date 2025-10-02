import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/SignUp.css";

export const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    address: { country: "", region: "", postalCode: "" },
  });

  const [errors, setErrors] = useState({});
  const [isAgreed, setIsAgreed] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // ✅ 필드 단위 검증
  const validateField = (name, value) => {
    switch (name) {
      case "username":
        if (!value) return "Username is required";
        if (!/^[A-Za-z\s]+$/.test(value))
          return "Username must contain only English letters";
        break;
      case "email":
        if (!value) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Invalid email format";
        break;
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8 || !/[A-Za-z]/.test(value) || !/[0-9]/.test(value))
          return "At least 8 characters, letters and numbers required";
        break;
      case "phone":
        if (!value) return "Phone is required";
        if (!/^[0-9]+$/.test(value)) return "Phone must be numeric only";
        break;
      case "country":
        if (!value) return "Country is required";
        if (!/^[A-Za-z\s]+$/.test(value))
          return "Country must contain only English letters";
        break;
      case "region":
        if (!value) return "Region / State is required";
        if (!/^[A-Za-z\s]+$/.test(value))
          return "Region / State must contain only English letters";
        break;
      case "postalCode":
        if (!value) return "Postal code is required";
        if (!/^[0-9]+$/.test(value)) return "Postal code must be numeric only";
        break;
      default:
        break;
    }
    return "";
  };

  // ✅ input 변경 핸들러 (입력하면 에러 제거)
  const changeHandler = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const addressChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      address: { ...formData.address, [name]: value },
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ✅ blur 시 검사 (빈 값은 에러 제거)
  const handleBlur = (e) => {
    const { name, value } = e.target;

    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
      return;
    }

    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  // ✅ 회원가입
  const signup = async () => {
    if (!isAgreed) {
      alert("You must agree to the terms before continuing.");
      return;
    }

    let newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (key === "address") {
        Object.keys(formData.address).forEach((subKey) => {
          const err = validateField(subKey, formData.address[subKey]);
          if (err) newErrors[subKey] = err;
        });
      } else {
        const err = validateField(key, formData[key]);
        if (err) newErrors[key] = err;
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    let responseData;
    await fetch("http://localhost:4000/signup", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        responseData = data;
      });

    if (responseData.success) {
      setSuccessMessage("Go to the login page in a moment...");
      setTimeout(() => navigate("/login"), 4000);
    } else {
      setErrors({ general: responseData.errors });
    }
  };

  return (
    <div className="signup">
      <div className="signup-container">
        <h1>Create Account</h1>

        <div className="signup-fields">
          <input
            name="username"
            value={formData.username}
            onChange={changeHandler}
            onBlur={handleBlur}
            type="text"
            placeholder="Username"
            className={errors.username ? "error" : ""}
          />
          {errors.username && <p className="error-text">{errors.username}</p>}

          <input
            name="email"
            value={formData.email}
            onChange={changeHandler}
            onBlur={handleBlur}
            type="email"
            placeholder="Email Address"
            className={errors.email ? "error" : ""}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}

          <input
            name="password"
            value={formData.password}
            onChange={changeHandler}
            onBlur={handleBlur}
            type="password"
            placeholder="Password"
            className={errors.password ? "error" : ""}
          />
          {errors.password && <p className="error-text">{errors.password}</p>}

          <input
            name="phone"
            value={formData.phone}
            onChange={changeHandler}
            onBlur={handleBlur}
            type="text"
            placeholder="Phone Number"
            className={errors.phone ? "error" : ""}
          />
          {errors.phone && <p className="error-text">{errors.phone}</p>}
        </div>

        {/* ✅ Address 카드 */}
        <div className="address-card">
          <label className="address-label">Address</label>
          <div className="address-fields">
            <input
              name="country"
              value={formData.address.country}
              onChange={addressChangeHandler}
              onBlur={handleBlur}
              type="text"
              placeholder="Country"
              className={errors.country ? "error" : ""}
            />
            {errors.country && <p className="error-text">{errors.country}</p>}

            <input
              name="region"
              value={formData.address.region}
              onChange={addressChangeHandler}
              onBlur={handleBlur}
              type="text"
              placeholder="Region / State"
              className={errors.region ? "error" : ""}
            />
            {errors.region && <p className="error-text">{errors.region}</p>}

            <input
              name="postalCode"
              value={formData.address.postalCode}
              onChange={addressChangeHandler}
              onBlur={handleBlur}
              type="text"
              placeholder="Postal Code"
              className={errors.postalCode ? "error" : ""}
            />
            {errors.postalCode && (
              <p className="error-text">{errors.postalCode}</p>
            )}
          </div>
        </div>

        <div className="signup-agree">
          <input
            type="checkbox"
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
          />
          <p>
            I agree to the terms of use & privacy policy.
          </p>
        </div>

        {errors.general && <p className="error-text">{errors.general}</p>}

        <button onClick={signup} disabled={!isAgreed}>
          Continue
        </button>

        <p className="signup-login">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login here</span>
        </p>
      </div>

      {/* ✅ 성공 모달 */}
      {successMessage && (
        <div className="success-overlay">
          <div className="success-modal">
            <h2>🎉 Success Sign Up</h2>
            <p>{successMessage}</p>
            <button className="success-btn" onClick={() => navigate("/login")}>
              Go Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
