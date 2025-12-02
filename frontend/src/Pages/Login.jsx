import React, { useState } from "react";
import "./CSS/Login.css";
import { API } from "../config";

export const Login = () => {

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Normalize server error messages
  const getErrorMessage = (data, fallback = "Login failed.") => {
    if (!data) return fallback;

    if (typeof data.message === "string") return data.message;

    if (Array.isArray(data.errors)) return data.errors.join("\n");

    if (typeof data.errors === "string") return data.errors;

    return fallback;
  };

  const login = async () => {
    if (loading) return;

    // Basic validation
    if (!formData.email || !formData.password) {
      setErrorMsg("Email and password are required.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      let data;

      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response.");
      }

      if (!res.ok) {
        let message;

        switch (res.status) {
          case 400:
            message = getErrorMessage(data, "Invalid request.");
            break;
          case 401:
            message = getErrorMessage(data, "Invalid email or password.");
            break;
          case 429:
            message = "Too many attempts. Try again later.";
            break;
          case 500:
            message = "Server error. Try again later.";
            break;
          default:
            message = getErrorMessage(data);
        }

        throw new Error(message);
      }

      if (!data.success) {
        const message = getErrorMessage(data, "Login failed.");
        throw new Error(message);
      }

      // SUCCESS → reload so context detects token
      localStorage.setItem("auth-token", data.token);
      window.location.replace("/");

    } catch (err) {
      console.error("Login Error:", err);
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login-container">
        <h1>Login</h1>

        <div className="login-fields">
          <input
            name="email"
            value={formData.email}
            onChange={changeHandler}
            type="email"
            placeholder="Email"
          />
          <input
            name="password"
            value={formData.password}
            onChange={changeHandler}
            type="password"
            placeholder="Password"
          />
        </div>

        {errorMsg && <p className="login-error">{errorMsg}</p>}

        <button onClick={login} disabled={loading}>
          {loading ? "Signing in..." : "Continue"}
        </button>

        <p className="login-login">
          Don’t have an account?
          <a href="/signup"> Create one</a>
        </p>
      </div>
    </div>
  );
};
