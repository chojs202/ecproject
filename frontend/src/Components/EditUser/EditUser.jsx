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
  // ✅ 유저 정보 불러오기
  // ==============================
  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`${API}/getuser`, {
          method: "GET",
          headers: { "auth-token": token },
        });
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
          alert("유저 정보를 불러올 수 없습니다.");
          navigate("/login");
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
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
  // ✅ 수정 요청
  // ==============================
  const handleUpdate = async () => {
    // 서버 전송 전 최종 검증
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

    // 서버 전송
    try {
      const res = await fetch(`${API}/edituser`, {
        method: "PUT",
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

      const data = await res.json();
      if (data.success) {
        setSuccessMessage("Edit Success.");
        setTimeout(() => navigate("/"), 1500);
      } else {
        alert(data.errors || "False Edit.");
      }
    } catch (err) {
      console.error(err);
      alert("Server Error");
    }
  };

  // ==============================
  // ✅ 회원 탈퇴
  // ==============================
  const handleDelete = async () => {
    if (!deletePassword) {
      alert("Please enter your password.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete? All data will be deleted.")) return;

    try {
      const res = await fetch(`${API}/deleteuser`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("auth-token"),
        },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.removeItem("auth-token");
        alert("Membership withdrawal was successful.");
        navigate("/");
        window.location.reload();
      } else {
        alert(data.errors || "Membership withdrawal failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server Error");
    }
  };

  // ==============================
  // ✅ JSX
  // ==============================
  return (
    <div className="edituser">
      <div className="edituser-container">
        <h1>Edit Account</h1>

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
            style={{ background: "#f0f0f0", cursor: "not-allowed" }} // 비활성 필드 강조
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

        <button onClick={handleUpdate}>Update</button>

        <p style={{ marginTop: "20px" , fontSize: "14px" }}>
          Would you like to change your password?{" "}<br/>
          <Link to="/changepassword">Change Password</Link>
        </p>

        <div className="edituser-delete-section">
          <input
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Enter password"
          />
          <button onClick={handleDelete}>Delete Account</button>
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
