import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./EditUser.css";
import { API } from "../../config";

export default function EditUser() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: { country: "", region: "", postalCode: "" },
  });

  const [deletePassword, setDeletePassword] = useState("");
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // ✅ 추가: 최소 보강용 상태
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ==============================
  // ✅ 유효성 검사 함수 (Signup 그대로 재사용)
  // ==============================
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value) return "Username is required";
        if (!/^[A-Za-z\s]+$/.test(value))
          return "Username must contain only English letters";
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

  // ==============================
  // ✅ 유저 정보 불러오기 (최소 보강: 401 처리 + AbortController)
  // ==============================
  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login", { replace: true });
      return;
    }

    const ac = new AbortController();

    const fetchUser = async () => {
      try {
        const res = await fetch(`${API}/api/users/me`, {
          method: "GET",
          headers: { "auth-token": token },
          signal: ac.signal,
        });

        if (res.status === 401) {
          // 🔒 토큰 만료 즉시 처리
          localStorage.removeItem("auth-token");
          setErrorMessage("세션이 만료되었습니다. 다시 로그인해 주세요.");
          navigate("/login", { replace: true });
          return;
        }

        const data = await res.json();
        if (data.success) {
          setFormData({
            name: data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            address: {
              country: data.user.address?.country || "",
              region: data.user.address?.region || "",
              postalCode: data.user.address?.postalCode || "",
            },
          });
        } else {
          setErrorMessage("유저 정보를 불러올 수 없습니다.");
          navigate("/login", { replace: true });
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setErrorMessage("서버 통신 중 오류가 발생했습니다.");
        }
      }
    };

    fetchUser();
    return () => ac.abort();
  }, [navigate]);

  // ==============================
  // ✅ 입력 핸들러
  // ==============================
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["country", "region", "postalCode"].includes(name)) {
      setFormData({ ...formData, address: { ...formData.address, [name]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ==============================
  // ✅ Blur 시 유효성 검사
  // ==============================
  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!value.trim()) return;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  // ==============================
  // ✅ 수정 요청 (최소 보강: loading/401 처리)
  // ==============================
  const handleUpdate = async () => {
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
    setErrorMessage("");
    try {
      const res = await fetch(`${API}/api/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("auth-token"),
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
        }),
      });

      if (res.status === 401) {
        localStorage.removeItem("auth-token");
        setErrorMessage("세션이 만료되었습니다. 다시 로그인해 주세요.");
        navigate("/login", { replace: true });
        return;
      }

      const data = await res.json();
      if (data.success) {
        setSuccessMessage("Edit Success.");
        setTimeout(() => navigate("/", { replace: true }), 1200);
      } else {
        setErrorMessage(data.errors || "False Edit.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Server Error");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // ✅ 회원 탈퇴 (최소 보강: loading/401 + 로컬 정리 약간 확대)
  // ==============================
  const handleDelete = async () => {
    if (!deletePassword) {
      alert("Please enter your password.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete? All data will be deleted.")) return;

    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch(`${API}/api/users/me`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("auth-token"),
        },
        body: JSON.stringify({ password: deletePassword }),
      });

      if (res.status === 401) {
        localStorage.removeItem("auth-token");
        setErrorMessage("세션이 만료되었습니다. 다시 로그인해 주세요.");
        navigate("/login", { replace: true });
        return;
      }

      const data = await res.json();
      if (data.success) {
        // 프로젝트에서 사용하는 주요 로컬 키 간단 정리
        localStorage.removeItem("auth-token");
        localStorage.removeItem("cartItems");
        localStorage.removeItem("guestCartItems");
        localStorage.removeItem("promoApplied");
        localStorage.removeItem("promoCode");
        localStorage.removeItem("discountPercent");
        alert("Membership withdrawal was successful.");
        navigate("/", { replace: true });
        window.location.reload();
      } else {
        setErrorMessage(data.errors || "Membership withdrawal failed");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Server Error");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // ✅ JSX
  // ==============================
  return (
    <div className="edituser">
      <div className="edituser-container">
        <h1>Edit Account</h1>

        {/* 전역 에러 메시지 (최소 보강) */}
        {errorMessage && <p className="edituser-error-global">{errorMessage}</p>}

        <div className="edituser-fields">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Username"
            className={errors.name ? "edituser-error" : ""}
          />
          {errors.name && <p className="edituser-error-text">{errors.name}</p>}

          <input
            type="email"
            name="email"
            value={formData.email}
            readOnly
            placeholder="Email Address"
            style={{ background: "#f0f0f0", cursor: "not-allowed" }}
          />

          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Phone Number"
            className={errors.phone ? "edituser-error" : ""}
          />
          {errors.phone && <p className="edituser-error-text">{errors.phone}</p>}
        </div>

        <div className="edituser-address-card">
          <label className="edituser-address-label">Address</label>
          <div className="edituser-address-fields">
            <input
              type="text"
              name="country"
              value={formData.address.country}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Country"
              className={errors.country ? "edituser-error" : ""}
            />
            {errors.country && <p className="edituser-error-text">{errors.country}</p>}

            <input
              type="text"
              name="region"
              value={formData.address.region}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Region / State"
              className={errors.region ? "edituser-error" : ""}
            />
            {errors.region && <p className="edituser-error-text">{errors.region}</p>}

            <input
              type="text"
              name="postalCode"
              value={formData.address.postalCode}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Postal Code"
              className={errors.postalCode ? "edituser-error" : ""}
            />
            {errors.postalCode && (
              <p className="edituser-error-text">{errors.postalCode}</p>
            )}
          </div>
        </div>

        {/* 최소 보강: 로딩 시 중복 제출 방지 */}
        <button onClick={handleUpdate} disabled={loading}>
          {loading ? "Updating..." : "Update"}
        </button>

        <p style={{ marginTop: "20px", fontSize: "14px" }}>
          Would you like to change your password? <br />
          <Link to="/changepassword">Change Password</Link>
        </p>

        <div className="edituser-delete-section">
          <input
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Enter password"
          />
          <button onClick={handleDelete} disabled={loading}>
            {loading ? "Processing..." : "Delete Account"}
          </button>
        </div>

        {successMessage && (
          <div className="edituser-success-overlay">
            <div className="edituser-success-modal">
              <h2>🎉 Success</h2>
              <p>{successMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
