import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/SignUp.css";
import { API } from "../config";

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
  const [loading, setLoading] = useState(false);

  // Extract readable server error message safely
  const getErrorMessage = (data, fallback = "Signup failed.") => {
    if (!data) return fallback;
    if (typeof data.message === "string") return data.message;
    if (Array.isArray(data.errors)) return data.errors.join("\n");
    if (typeof data.errors === "string") return data.errors;
    return fallback;
  };

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

  const handleBlur = (e) => {
    const { name, value } = e.target;

    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
      return;
    }

    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const signup = async () => {
    if (loading) return;

    if (!isAgreed) {
      alert("You must agree to the terms.");
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

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch(`${API}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => {
        throw new Error("Invalid server response.");
      });

      if (!res.ok) {
        throw new Error(getErrorMessage(data, "Signup failed."));
      }

      if (!data.success) {
        throw new Error(getErrorMessage(data, "Signup failed."));
      }

      setSuccessMessage("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000);

    } catch (err) {
      console.error("Signup Error:", err);
      setErrors({ general: err.message || "Something went wrong." });

    } finally {
      setLoading(false);
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
            placeholder="Username ( Eng Only)"
            className={errors.username ? "error" : ""}
          />
          {errors.username && <p className="error-text">{errors.username}</p>}

          <input
            name="email"
            value={formData.email}
            onChange={changeHandler}
            onBlur={handleBlur}
            type="email"
            placeholder="Email Address ( Ex: aaa@aaa.aa )"
            className={errors.email ? "error" : ""}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}

          <input
            name="password"
            value={formData.password}
            onChange={changeHandler}
            onBlur={handleBlur}
            type="password"
            placeholder="Password ( Eng + Num , over 8 )"
            className={errors.password ? "error" : ""}
          />
          {errors.password && <p className="error-text">{errors.password}</p>}

          <input
            name="phone"
            value={formData.phone}
            onChange={changeHandler}
            onBlur={handleBlur}
            type="text"
            placeholder="Phone Number ( Ex: 01012345678 )"
            className={errors.phone ? "error" : ""}
          />
          {errors.phone && <p className="error-text">{errors.phone}</p>}
        </div>

        <div className="address-card">
          <label className="address-label">Address</label>
          <div className="address-fields">
            <input
              name="country"
              value={formData.address.country}
              onChange={addressChangeHandler}
              onBlur={handleBlur}
              type="text"
              placeholder="Country ( Eng Only )"
              className={errors.country ? "error" : ""}
            />
            {errors.country && <p className="error-text">{errors.country}</p>}

            <input
              name="region"
              value={formData.address.region}
              onChange={addressChangeHandler}
              onBlur={handleBlur}
              type="text"
              placeholder="Region ( Eng Only )"
              className={errors.region ? "error" : ""}
            />
            {errors.region && <p className="error-text">{errors.region}</p>}

            <input
              name="postalCode"
              value={formData.address.postalCode}
              onChange={addressChangeHandler}
              onBlur={handleBlur}
              type="text"
              placeholder="Postal Code ( Num Only )"
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
          <p>I agree to the terms of use & privacy policy.</p>
        </div>

        {errors.general && <p className="error-text">{errors.general}</p>}

        <button onClick={signup} disabled={!isAgreed || loading}>
          {loading ? "Processing..." : "Continue"}
        </button>

        <p className="signup-login">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login here</span>
        </p>
      </div>

      {successMessage && (
        <div className="success-overlay">
          <div className="success-modal">
            <h2>🎉 Success</h2>
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
