import { useState, useRef } from "react";
import "./AddProduct.css";
import upload_area from "../../assets/upload_area.svg";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { v4 as uuidv4 } from "uuid";
import {API} from "../../config"

const AddProduct = () => {
  const initialProductDetails = {
    name: "",
    image: [],
    category: "men",
    new_price: "",
    old_price: "",
    description: "",
    size: [],
  };

  const [productDetails, setProductDetails] = useState(initialProductDetails);
  const [images, setImages] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [sizeInput, setSizeInput] = useState("");
  const [sizeError, setSizeError] = useState("");
  const [priceError, setPriceError] = useState({ old_price: "", new_price: "" });
  const [titleError, setTitleError] = useState("");
  const [serverError, setServerError] = useState("");

  const debounceTimer = useRef(null);

  // ---------- Change Handler ----------
  const ChangeHandler = (e) => {
    const { name, value } = e.target;
    setProductDetails((prev) => ({ ...prev, [name]: value }));
    if (name === "name") setTitleError("");
    if (name === "old_price" || name === "new_price")
      setPriceError({ ...priceError, [name]: "" });
    if (name === "name") {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        checkDuplicateTitle(value);
      }, 500);
    }
  };

  // ---------- 가격 숫자 검증 ----------
  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value)) {
      setProductDetails({ ...productDetails, [name]: value });
      setPriceError({ ...priceError, [name]: "" });
    } else setPriceError({ ...priceError, [name]: "Only Number." });
  };

  // ---------- 상품명 중복 체크 ----------
  const checkDuplicateTitle = async (title) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    try {
      const res = await fetch(
        `${API}/check-product-title?name=${encodeURIComponent(trimmed)}`
      );
      const data = await res.json();
      if (data.exists) setTitleError("This product title already exists.");
      else setTitleError("");
    } catch (error) {
      console.error("Title check failed:", error);
    }
  };

  // ---------- 사이즈 ----------
  const addSize = () => {
    const upper = sizeInput.trim().toUpperCase();
    if (!upper) return;
    if (!sizes.includes(upper)) {
      const updated = [...sizes, upper];
      setSizes(updated);
      setProductDetails({ ...productDetails, size: updated });
      setSizeInput("");
      setSizeError("");
    } else setSizeError("Already exist.");
  };

  const removeSize = (remove) => {
    const updated = sizes.filter((s) => s !== remove);
    setSizes(updated);
    setProductDetails({ ...productDetails, size: updated });
  };

  const handleSizeKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSize();
    }
  };

  // ---------- 이미지 ----------
  const imageHandler = (e) => {
    const files = Array.from(e.target.files).slice(0, 4 - images.length);
    const withIds = files.map((file) => ({
      file,
      id: `img-${uuidv4()}`,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...withIds]);
  };

  // ---------- Drag & Drop ----------
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId === "add-images") {
      setImages((prev) => {
        const reordered = Array.from(prev);
        const [moved] = reordered.splice(source.index, 1);
        reordered.splice(destination.index, 0, moved);
        return reordered;
      });
    } else if (source.droppableId === "add-sizes") {
      setSizes((prev) => {
        const reordered = Array.from(prev);
        const [moved] = reordered.splice(source.index, 1);
        reordered.splice(destination.index, 0, moved);
        setProductDetails((prevProduct) => ({ ...prevProduct, size: reordered }));
        return reordered;
      });
    }
  };

  // ---------- 폼 초기화 ----------
  const resetForm = () => {
    setProductDetails(initialProductDetails);
    setImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.url));
      return [];
    });
    setSizes([]);
    setSizeInput("");
    setSizeError("");
    setPriceError({ old_price: "", new_price: "" });
    setTitleError("");
    setServerError("");
  };

  // ---------- 상품 추가 ----------
  const Add_Product = async () => {
    setServerError("");
    if (!/^\d+$/.test(productDetails.old_price) || !/^\d+$/.test(productDetails.new_price)) {
      alert("Price is Only Number.");
      return;
    }
    if (titleError) {
      alert("Please fix errors before submitting.");
      return;
    }

    try {
      const formData = new FormData();
      images.forEach((imgObj) =>
        formData.append("product", imgObj.file)
      );

      const uploadRes = await fetch(`${API}/upload`, {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.success) {
        setServerError(uploadData.message || "Image Upload Failed");
        return;
      }

      const productToSend = {
        ...productDetails,
        image: uploadData.image_urls,
      };

      const addRes = await fetch(`${API}/addproduct`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(productToSend),
      });
      const addData = await addRes.json();

      if (!addRes.ok || !addData.success) {
        setServerError(addData.message || "Failed to add product");
        return;
      }

      alert("Product Added");
      resetForm();
    } catch (error) {
      setServerError(error.message);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="addproduct-container">
        {/* 상품명 */}
        <div className="addproduct-field">
          <p>Product title</p>
          <input
            value={productDetails.name}
            onChange={ChangeHandler}
            type="text"
            name="name"
            placeholder="Type here"
          />
          {titleError && <small style={{ color: "red" }}>{titleError}</small>}
        </div>
        {/* 서버 에러 */}
        {serverError && (
          <div style={{ color: "red", marginBottom: "10px" }}>
            {serverError}
          </div>
        )}

        {/* Price */}
        <div className="addproduct-price">
          <div className="addproduct-field">
            <p>Old Price</p>
            <input
              type="text"
              value={productDetails.old_price}
              onChange={handlePriceChange}
              name="old_price"
              placeholder="Type here"
            />
            {priceError.old_price && (
              <small style={{ color: "red" }}>{priceError.old_price}</small>
            )}
          </div>
          <div className="addproduct-field">
            <p>New Price</p>
            <input
              type="text"
              value={productDetails.new_price}
              onChange={handlePriceChange}
              name="new_price"
              placeholder="Type here"
            />
            {priceError.new_price && (
              <small style={{ color: "red" }}>{priceError.new_price}</small>
            )}
          </div>
        </div>

        {/* Category */}
        <div className="addproduct-field category-field">
          <p>Category</p>
          <select
            name="category"
            value={productDetails.category}
            onChange={ChangeHandler}
          >
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="kid">Kid</option>
          </select>
        </div>

        {/* Size */}
        <Droppable droppableId="add-sizes" direction="horizontal">
          {(provided) => (
            <div
              className="addproduct-size-tags"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <p>Sizes</p>
              <div style={{ display: "flex", gap: "6px" }}>
                <input
                  type="text"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value.toUpperCase())}
                  onKeyDown={handleSizeKeyDown}
                  placeholder="Input Size (ex: S, M, FREE)"
                />
                <button
                  type="button"
                  onClick={addSize}
                  disabled={!sizeInput.trim() || sizes.includes(sizeInput.toUpperCase())}
                >
                  +
                </button>
              </div>
              {sizeError && <small style={{ color: "red" }}>{sizeError}</small>}
              {sizes.map((s, i) => (
                <Draggable key={s} draggableId={s} index={i}>
                  {(provided) => (
                    <span
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="addproduct-size-tag"
                    >
                      {s}
                      <button
                        onClick={() => removeSize(s)}
                        className="addproduct-remove-size-btn"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Images */}
        <Droppable droppableId="add-images" direction="horizontal">
          {(provided) => (
            <div
              className="addproduct-preview-list"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <p>Images</p>
              {images.map((imgObj, idx) => (
                <Draggable key={imgObj.id} draggableId={imgObj.id} index={idx}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="addproduct-preview-item"
                    >
                      <img
                        src={imgObj.url}
                        alt={`preview-${idx}`}
                        className={idx === 0 ? "addproduct-main-image" : ""}
                      />
                      {idx === 0 && <span className="addproduct-main-label">Main Image</span>}
                      <button
                        type="button"
                        onClick={() => {
                          URL.revokeObjectURL(imgObj.url);
                          setImages((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        className="addproduct-remove-img-btn"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {images.length < 4 && (
                <label htmlFor="addFileUpload" className="addproduct-upload-box">
                  <img src={upload_area} alt="upload" /> Upload
                </label>
              )}
              <input
                id="addFileUpload"
                type="file"
                accept="image/*"
                multiple
                onChange={imageHandler}
                style={{ display: "none" }}
              />
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Description */}
        <div className="addproduct-field addproduct-description">
          <p>Description</p>
          <textarea
            value={productDetails.description}
            onChange={ChangeHandler}
            name="description"
            placeholder="Type here"
          />
        </div>

        <button type="button" onClick={Add_Product} className="addproduct-btn">
          ADD
        </button>
      </div>
    </DragDropContext>
  );
};

export default AddProduct;
