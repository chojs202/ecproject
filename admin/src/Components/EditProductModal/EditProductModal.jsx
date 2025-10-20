import React, { useState, useEffect } from "react";
import "./EditProductModal.css";
import upload_area from "../../assets/upload_area.svg";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { v4 as uuidv4 } from "uuid";
import {API} from "../../config"

const EditProductModal = ({ product, onClose, onSave }) => {
  const [images, setImages] = useState([]);
  const [sizeInput, setSizeInput] = useState("");
  const [sizes, setSizes] = useState([]);
  const [productDetails, setProductDetails] = useState(product);
  const [priceError, setPriceError] = useState({ old_price: "", new_price: "" });

  // 기존 이미지 초기화 + 사이즈 초기화
  useEffect(() => {
    if (product) {
      setProductDetails(product);
      setSizes(product.size || []);
      setImages(
        (product.image || []).map((url) => ({
          file: null,
          url,
          id: `existing-${uuidv4()}`,
        }))
      );
    }
  }, [product]);

  // ------------------- 이미지 업로드 -------------------
  const imageHandler = (e) => {
    const files = Array.from(e.target.files).slice(0, 4 - images.length);
    const newFiles = files.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
      id: `new-${uuidv4()}`,
    }));
    setImages((prev) => [...prev, ...newFiles]);
  };

  // ------------------- 텍스트/셀렉트 -------------------
  const ChangeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  // ------------------- 가격 유효성 -------------------
  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value)) {
      setProductDetails({ ...productDetails, [name]: value });
      setPriceError({ ...priceError, [name]: "" });
    } else {
      setPriceError({ ...priceError, [name]: "Only Number." });
    }
  };

  // ------------------- 사이즈 -------------------
  const addSize = () => {
    const upper = sizeInput.trim().toUpperCase();
    if (upper && !sizes.includes(upper)) {
      const updated = [...sizes, upper];
      setSizes(updated);
      setProductDetails({ ...productDetails, size: updated });
      setSizeInput("");
    }
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

  // ------------------- Drag & Drop -------------------
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId === "images") {
      const reordered = Array.from(images);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      setImages(reordered);
    }

    if (source.droppableId === "sizes") {
      const reordered = Array.from(sizes);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      setSizes(reordered);
      setProductDetails({ ...productDetails, size: reordered });
    }
  };

  // ------------------- 저장 -------------------
  // ✅ Cloudinary 업로드 함수 추가
  const uploadImageToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "ecproject_unsigned"); // Cloudinary preset 이름
    data.append("folder", "ecproject_products"); // 업로드될 폴더명
  
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME; // .env에서 불러옴
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: data,
    });
  
    const json = await res.json();
    if (!json.secure_url) throw new Error("Cloudinary upload failed");
    return json.secure_url;
  };

  const saveChanges = async () => {
    if (!/^\d+$/.test(productDetails.old_price) || !/^\d+$/.test(productDetails.new_price)) {
      alert("Only Number.");
      return;
    }
  
    let updatedProduct = { ...productDetails, size: sizes };
    const newFiles = images.filter((img) => img.file);
  
    try {
      if (newFiles.length > 0) {
        const uploadPromises = newFiles.map(({ file }) => uploadImageToCloudinary(file));
        const uploadedUrls = await Promise.all(uploadPromises);
      
        let imgIndex = 0;
        updatedProduct.image = images.map((img) =>
          img.file ? uploadedUrls[imgIndex++] : img.url
        );
      } else {
        updatedProduct.image = images.map((img) => img.url).filter(Boolean);
      }
    
      // ✅ RESTful PATCH 요청으로 변경
      const res = await fetch(`${API}/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      }).then((res) => res.json());
    
      if (!res.success) {
        alert("Failed to save product");
        return;
      }
    
      onSave(updatedProduct);
      onClose();
    } catch (err) {
      console.error("❌ Image upload failed:", err);
      alert("Image upload failed. Please try again.");
    }
  };
  return (
    <div className="editproductmodal-container">
      <h2>Edit Product</h2>

      {/* 상품명 */}
      <div className="editproductmodal-itemfield">
        <p>Product title</p>
        <input value={productDetails.name} onChange={ChangeHandler} name="name" />
      </div>

      {/* 가격 */}
      <div className="editproductmodal-price">
        <div className="editproductmodal-itemfield">
          <p>Price</p>
          <input
            type="text"
            value={productDetails.old_price}
            onChange={handlePriceChange}
            name="old_price"
          />
          {priceError.old_price && (
            <small style={{ color: "red", marginTop: "2px", display: "block" }}>
              {priceError.old_price}
            </small>
          )}
        </div>
        <div className="editproductmodal-itemfield">
          <p>Offer Price</p>
          <input
            type="text"
            value={productDetails.new_price}
            onChange={handlePriceChange}
            name="new_price"
          />
          {priceError.new_price && (
            <small style={{ color: "red", marginTop: "2px", display: "block" }}>
              {priceError.new_price}
            </small>
          )}
        </div>
      </div>

      {/* 카테고리 */}
      <div className="editproductmodal-itemfield category-field">
        <p>Category</p>
        <select name="category" value={productDetails.category} onChange={ChangeHandler}>
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kids">Kids</option>
        </select>
      </div>

      {/* 사이즈 */}
      <div className="editproductmodal-itemfield">
        <p>Sizes</p>
        <div style={{ display: "flex", gap: "6px" }}>
          <input
            type="text"
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value.toUpperCase())}
            onKeyDown={handleSizeKeyDown}
            placeholder="Size (EX: S, M, FREE)"
          />
          <button type="button" onClick={addSize}>+</button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sizes" direction="horizontal">
            {(provided) => (
              <div
                className="editproductmodal-size-tags"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {sizes.map((s, i) => (
                  <Draggable key={s} draggableId={s} index={i}>
                    {(provided) => (
                      <span
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="editproductmodal-size-tag"
                      >
                        {s}
                        <button onClick={() => removeSize(s)}>×</button>
                      </span>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* 이미지 */}
      <div className="editproductmodal-itemfield">
        <p>Images</p>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="images" direction="horizontal">
            {(provided) => (
              <div
                className="editproductmodal-preview-list"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {images.map((imgObj, idx) => (
                  <Draggable key={imgObj.id} draggableId={imgObj.id} index={idx}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="editproductmodal-preview-item"
                      >
                        <img
                          src={imgObj.url}
                          alt={`preview-${idx}`}
                          className={idx === 0 ? "editproductmodal-main-image" : ""}
                        />
                        {idx === 0 && <span className="editproductmodal-main-label">Main Image</span>}
                        <button
                          className="editproductmodal-remove-img-btn"
                          onClick={() =>
                            setImages((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {images.length < 4 && (
                  <label htmlFor="editFileUpload" className="editproductmodal-upload-box">
                    <img src={upload_area} alt="upload" />
                    Upload
                  </label>
                )}
                <input
                  id="editFileUpload"
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
        </DragDropContext>
      </div>

      {/* 설명 */}
      <div className="editproductmodal-itemfield editproductmodal-description">
        <p>Description</p>
        <textarea
          value={productDetails.description}
          onChange={ChangeHandler}
          name="description"
          style={{ whiteSpace: "pre-line" }}
        />
      </div>

      {/* 버튼 */}
      <div className="editproductmodal-buttons">
        <button type="button" onClick={saveChanges} className="editproductmodal-btn">SAVE</button>
        <button type="button" onClick={onClose} className="editproductmodal-btn cancel">Cancel</button>
      </div>
    </div>
  );
};

export default EditProductModal;
