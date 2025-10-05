import { useState } from "react";
import "./AddProduct.css";
import upload_area from "../../assets/upload_area.svg";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { v4 as uuidv4 } from "uuid";

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
  const [images, setImages] = useState([]); // {file, id, url}
  const [sizes, setSizes] = useState([]);
  const [sizeInput, setSizeInput] = useState("");
  const [sizeError, setSizeError] = useState("");
  const [priceError, setPriceError] = useState({ old_price: "", new_price: "" });

  // ---------- image upload ---------- (画像アップロード)
  const imageHandler = (e) => {
    const files = Array.from(e.target.files).slice(0, 4 - images.length);
    const withIds = files.map((file) => ({
      file,
      id: `img-${uuidv4()}`,
      url: URL.createObjectURL(file), // キャッシュ
    }));
    setImages((prev) => [...prev, ...withIds]);
  };

  // ---------- 텍스트/셀렉트 ---------- (テキスト/セレクト)
  const ChangeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  // ---------- 숫자 검증 ---------- (数値検証)
  const handlePriceChange = (e) => {
    const { name, value } = e.target;

    if (/^\d*$/.test(value)) {
      setProductDetails({ ...productDetails, [name]: value });
      setPriceError({ ...priceError, [name]: "" });
    } else {
      setPriceError({ ...priceError, [name]: "Only Number." });
    }
  };

  // ---------- 사이즈 ---------- (サイズ)
  const addSize = () => {
    const upper = sizeInput.trim().toUpperCase();
    if (!upper) return;

    if (!sizes.includes(upper)) {
      const updated = [...sizes, upper];
      setSizes(updated);
      setProductDetails({ ...productDetails, size: updated });
      setSizeInput("");
      setSizeError("");
    } else {
      setSizeError("Already exist.");
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

  // ---------- Drag & Drop ---------- (ドラッグ＆ドロップ)
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
    }

    if (source.droppableId === "add-sizes") {
      setSizes((prev) => {
        const reordered = Array.from(prev);
        const [moved] = reordered.splice(source.index, 1);
        reordered.splice(destination.index, 0, moved);
        setProductDetails((prevProduct) => ({ ...prevProduct, size: reordered }));
        return reordered;
      });
    }
  };

  // ---------- 폼 초기화 ---------- (フォーム初期化)
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
  };

  // ---------- 상품 추가 ---------- (商品追加)
  const Add_Product = async () => {
    const product = { ...productDetails, size: sizes };

    // 가격 유효성 체크 (価格のバリデーションチェック)
    if (!/^\d+$/.test(product.old_price) || !/^\d+$/.test(product.new_price)) {
      alert("Price is Only Number.");
      return;
    }

    const formData = new FormData();
    images.forEach(({ file }) => formData.append("product", file));

    const responseData = await fetch("http://localhost:4000/upload", {
      method: "POST",
      body: formData,
    }).then((res) => res.json());

    if (responseData.success) {
      product.image = responseData.image_urls;

      const result = await fetch("http://localhost:4000/addproduct", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(product),
      }).then((res) => res.json());

      if (result.success) {
        alert("Product Added");
        resetForm();
      } else {
        alert("Failed");
      }
    }
  };

  // ---------- JSX ----------
  return (
    <div className="addproduct-container">
      {/* 상품명 (商品名) */}
      <div className="addproduct-field">
        <p>Product title</p>
        <input
          value={productDetails.name}
          onChange={ChangeHandler}
          type="text"
          name="name"
          placeholder="Type here"
        />
      </div>

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
            <small style={{ color: "red", marginTop: "2px", display: "block" }}>
              {priceError.old_price}
            </small>
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
            <small style={{ color: "red", marginTop: "2px", display: "block" }}>
              {priceError.new_price}
            </small>
          )}
        </div>
      </div>

      {/* category */}
      <div className="addproduct-field category-field">
        <p>Category</p>
        <select name="category" value={productDetails.category} onChange={ChangeHandler}>
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="kid">Kid</option>
        </select>
      </div>

      {/* size */}
      <div className="addproduct-field">
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

        {sizeError && (
          <small style={{ color: "red", marginTop: "4px", display: "block" }}>
            {sizeError}
          </small>
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="add-sizes" direction="horizontal">
            {(provided) => (
              <div className="addproduct-size-tags" {...provided.droppableProps} ref={provided.innerRef}>
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
                        <button onClick={() => removeSize(s)} className="addproduct-remove-size-btn">×</button>
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

      {/* image */}
      <div className="addproduct-field">
        <p>Images</p>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="add-images" direction="horizontal">
            {(provided) => (
              <div className="addproduct-preview-list" {...provided.droppableProps} ref={provided.innerRef}>
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
                <input id="addFileUpload" type="file" accept="image/*" multiple onChange={imageHandler} style={{ display: "none" }} />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* description (説明) */}
      <div className="addproduct-field addproduct-description">
        <p>Description</p>
        <textarea value={productDetails.description} onChange={ChangeHandler} name="description" placeholder="Type here" />
      </div>

      <button type="button" onClick={Add_Product} className="addproduct-btn">ADD</button>
    </div>
  );
};

export default AddProduct;
