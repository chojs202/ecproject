// ==============================
// 1. 기본 세팅
// ==============================
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");
const Stripe = require("stripe");

require("dotenv").config();

// 환경변수 적용
const port = process.env.PORT || 4000;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;

app.use(express.json());
app.use(cors());

// ==============================
// 2. MongoDB 연결
// ==============================
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// ==============================
// 3. 기본 라우트
// ==============================
app.get("/", (req, res) => {
  res.send("Express App is Running");
});

// ==============================
// 4. 미들웨어 (JWT 인증)
// ==============================
const fetchUser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) return res.status(401).send({ errors: "Please authenticate using a valid token" });

  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
};

// ==============================
// 5. 이미지 업로드 설정 (멀티 업로드)
// ==============================
const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) =>
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage: storage });

app.use("/images", express.static("upload/images"));

// ✅ 여러 장 업로드 (최대 4장)
app.post("/upload", upload.array("product", 4), (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) return res.json({ success: false, message: "No files uploaded" });

    const urls = files.map(file => `http://localhost:${port}/images/${file.filename}`);
    res.json({ success: true, image_urls: urls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==============================
// 6. DB 모델 정의
// ==============================
const Product = mongoose.model("Product", {
  id: { type: Number, required: true },
  name: { type: String, required: true, unique: true },
  image: { type: [String], required: true, default: [] },
  size: { type: [String], required: false, default: [] },
  category: { type: String, required: true },
  new_price: { type: Number, required: true },
  old_price: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
});

const Users = mongoose.model("Users", {
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  phone: { type: String },
  address: {
    country: { type: String },
    region: { type: String },
    postalCode: { type: String },
  },
  cartData: { type: Object, default: {} },
  date: { type: Date, default: Date.now },
  likedProducts: [{ type: Number }],
});

// ==============================
// 6-1. Promo Code 모델 정의
// ==============================
const Promo = mongoose.model("Promo", {
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ["percent", "fixed"], default: "percent" },
  amount: { type: Number, required: true },
  minCartValue: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
});
// ==============================
// 6-2. Order 모델 정의
// ==============================
const Order = mongoose.model("Order", {
  userId: { type: String, required: true },
  items: [
    {
      productId: Number,
      name: String,
      size: String,
      quantity: Number,
      price: Number,
    },
  ],
  totalAmount: Number,
  discount: Number,    // 프로모코드 할인 금액
  finalAmount: Number, // 할인 적용 후 실제 결제 금액
  status: { type: String, enum: ["pending", "paid"], default: "paid" },
  createdAt: { type: Date, default: Date.now },
});


// ==============================
// 7. 상품 관련 API
// ==============================
app.post("/addproduct", async (req, res) => {
  try {
    const products = await Product.find({});
    const id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

    const product = new Product({
      id,
      name: req.body.name,
      image: req.body.image,
      size: req.body.size || [],
      category: req.body.category,
      new_price: Number(req.body.new_price),
      old_price: Number(req.body.old_price),
      description: req.body.description,
    });

    await product.save();
    res.json({ success: true, name: req.body.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/allproducts", async (req, res) => {
  const products = await Product.find({});
  res.send(products);
});

app.post("/updateproduct", async (req, res) => {
  try {
    const { id, name, old_price, new_price, category, size, description, image } = req.body;

    const updatedProduct = await Product.findOneAndUpdate(
      { id: id },
      {
        name,
        old_price: Number(old_price),
        new_price: Number(new_price),
        category,
        size: size || [],
        description,
        image: image || [],
      },
      { new: true }
    );

    if (!updatedProduct) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  res.json({ success: true, name: req.body.name });
});

app.get("/newcollections", async (req, res) => {
  const newcollection = await Product.find({}).sort({ date: -1 }).limit(8);
  res.send(newcollection);
});

app.get("/popularinwomen", async (req, res) => {
  const popular_in_women = await Product.find({ category: "women" }).sort({ date: -1 }).limit(4);
  res.send(popular_in_women);
});

// ==============================
// 상품 이름 기반 검색 API
// ==============================
app.get("/search", async (req, res) => {
  try {
    const query = req.query.q || ""; // 쿼리 파라미터 가져오기
    if (!query) return res.json({ success: true, products: [] });

    // 대소문자 구분 없이 부분 일치 검색
    const products = await Product.find({
      name: { $regex: query, $options: "i" }
    });

    res.json({ success: true, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==============================
// 7-1. Promo Code 적용 API
// ==============================
app.post("/applypromo", fetchUser, async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const promo = await Promo.findOne({ code: code.toUpperCase(), active: true });

    if (!promo) return res.status(400).json({ success: false, message: "Invalid promo code" });

    if (cartTotal < promo.minCartValue)
      return res.status(400).json({ success: false, message: `Minimum cart value for this promo code is $${promo.minCartValue}` });

    let discountAmount = 0;
    if (promo.discountType === "percent") discountAmount = cartTotal * (promo.amount / 100);
    else discountAmount = promo.amount;

    res.json({
      success: true,
      discountAmount,
      newTotal: cartTotal - discountAmount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==============================
// 7-2. 기본 SAVE10 쿠폰 생성
// ==============================
const createDefaultPromo = async () => {
  try {
    const existing = await Promo.findOne({ code: "SAVE10" });
    if (!existing) {
      await Promo.create({
        code: "SAVE10",
        discountType: "percent",
        amount: 10,
        minCartValue: 0,
        active: true
      });
      console.log("Default promo code SAVE10 created.");
    } else {
      console.log("Default promo code already exists.");
    }
  } catch (error) {
    console.error("Error creating default promo code:", error);
  }
};

createDefaultPromo();

// ==============================
// 7-3. 배너 클릭 시 쿠폰 발급 API
// ==============================
app.get("/getbannerpromo", async (req, res) => {
  try {
    // 여기서 발급할 쿠폰 코드 지정 (기본 10% 쿠폰)
    const code = "SAVE10";

    const promo = await Promo.findOne({ code, active: true });

    if (!promo) {
      return res.status(404).json({ success: false, message: "Promo not found" });
    }

    // 발급 시 필요한 정보만 반환
    res.json({
      success: true,
      code: promo.code,
      discountType: promo.discountType,
      amount: promo.amount,
      minCartValue: promo.minCartValue
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// ==============================
// 7-4. Like(찜) 기능 API
// ==============================

// 1️⃣ 특정 상품 좋아요 토글
app.post("/products/:id/like", fetchUser, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    const product = await Product.findOne({ id: productId });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    if (product.likes.includes(userId)) {
      product.likes.pull(userId); // 좋아요 제거
    } else {
      product.likes.push(userId); // 좋아요 추가
    }

    await product.save();
    res.json({ success: true, likesCount: product.likes.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 2️⃣ 로그인한 사용자의 찜 목록 조회
app.get("/likes", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const likedProducts = await Product.find({ likes: userId });
    res.json({ success: true, products: likedProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 3️⃣ 특정 상품의 좋아요 상태 확인
app.get("/products/:id/like-status", fetchUser, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    const product = await Product.findOne({ id: productId });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const liked = product.likes.includes(userId);
    res.json({ success: true, liked });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==============================
// 8. 사용자 인증 관련 API
// ==============================

// 회원가입
app.post("/signup", async (req, res) => {
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({
      success: false,
      errors: "Existing user found with same email address",
    });
  }

  let cart = {};
  for (let i = 0; i < 300; i++) cart[i] = 0;

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: hashedPassword,
    phone: req.body.phone,       // ✅ 추가
    address: req.body.address,   // ✅ 추가
    cartData: cart,
  });

  await user.save();

  const token = jwt.sign({ user: { id: user.id } }, "secret_ecom");
  res.json({ success: true, token });
});

// 로그인
app.post("/login", async (req, res) => {
  try {
    let user = await Users.findOne({ email: req.body.email });
    if (!user)
      return res.status(400).json({ success: false, errors: "User not found" });

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, errors: "Invalid password" });

    const token = jwt.sign({ user: { id: user.id } }, "secret_ecom", {
      expiresIn: "1h",
    });
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, errors: "Server error" });
  }
});



// 사용자 정보 수정 (이름, 연락처, 주소 수정 가능)
app.put("/edituser", fetchUser, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    // ✅ 주소 세부 항목만 있으면 수정
    if (address) {
      updateData.address = {};
      if (address.country) updateData.address.country = address.country;
      if (address.region) updateData.address.region = address.region;
      if (address.postalCode) updateData.address.postalCode = address.postalCode;
    }

    const user = await Users.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select("-password -cartData");

    if (!user) {
      return res.status(404).json({ success: false, errors: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

// 비밀번호 변경
app.put("/changepassword", fetchUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, errors: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, errors: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

// 사용자 정보 조회
app.get("/getuser", fetchUser, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id).select("-password -cartData");
    if (!user) {
      return res.status(404).json({ success: false, errors: "User not found" });
    }
    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

// 회원 탈퇴 (유저 + 주문 기록 삭제, 트랜잭션 적용)
app.delete("/deleteuser", fetchUser, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { password } = req.body;
    const user = await Users.findById(req.user.id).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, errors: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, errors: "Password is incorrect" });
    }

    // -----------------------------
    // 1️⃣ 해당 유저의 주문 삭제
    await Order.deleteMany({ userId: req.user.id }).session(session);

    // 2️⃣ 유저 삭제
    await Users.findByIdAndDelete(req.user.id).session(session);

    // -----------------------------
    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, message: "User and orders deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});
// ==============================
// 9. 장바구니 관련 API (개선)
// ==============================

// 1️⃣ 전체 카트 가져오기
app.post("/getcart", fetchUser, async (req, res) => {
  try {
    const userData = await Users.findById(req.user.id);
    // 항상 객체 반환
    const cartData = userData.cartData || {};
    res.json({ success: true, cartData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 2️⃣ 카트에 아이템 추가
app.post("/addtocart", fetchUser, async (req, res) => {
  try {
    const { itemId, size } = req.body;
    const userData = await Users.findById(req.user.id);

    // 초기화
    if (!userData.cartData) userData.cartData = {};
    if (!userData.cartData[itemId]) userData.cartData[itemId] = {};
    if (!userData.cartData[itemId][size]) userData.cartData[itemId][size] = 0;

    userData.cartData[itemId][size] += 1;

    await Users.findByIdAndUpdate(req.user.id, { cartData: userData.cartData });
    res.json({ success: true, cartData: userData.cartData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 3️⃣ 카트에서 아이템 제거
app.post("/removefromcart", fetchUser, async (req, res) => {
  try {
    const { itemId, size } = req.body;
    const userData = await Users.findById(req.user.id);

    if (userData.cartData[itemId]?.[size] > 0) {
      userData.cartData[itemId][size] -= 1;

      // size가 0이면 삭제
      if (userData.cartData[itemId][size] <= 0) delete userData.cartData[itemId][size];

      // itemId 안에 size가 없으면 삭제
      if (Object.keys(userData.cartData[itemId]).length === 0) delete userData.cartData[itemId];

      await Users.findByIdAndUpdate(req.user.id, { cartData: userData.cartData });
    }

    res.json({ success: true, cartData: userData.cartData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 4️⃣ 카트 전체 업데이트
app.post("/updatecart", fetchUser, async (req, res) => {
  try {
    const updatedCart = req.body; // 클라이언트에서 보낸 cartItems 객체
    if (!updatedCart || typeof updatedCart !== "object") {
      return res.status(400).json({ success: false, message: "Invalid cart data" });
    }

    await Users.findByIdAndUpdate(req.user.id, { cartData: updatedCart });
    res.json({ success: true, cartData: updatedCart, message: "Cart updated successfully" });
  } catch (err) {
    console.error("Failed to update cart:", err);
    res.status(500).json({ success: false, message: "Failed to update cart" });
  }
});

// ==============================
// 10. Stripe PaymentIntent 생성 API
// ==============================
app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe는 센트 단위
      currency: "krw",
      payment_method_types: ["card"],
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe PaymentIntent error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==============================
// 11. 주문 생성 API
// ==============================

// 주문 생성
app.post("/create-order", fetchUser, async (req, res) => {
  try {
    const { items, totalAmount, discount, finalAmount } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ success: false, message: "No items to order" });

    const order = new Order({
      userId: req.user.id,
      items,
      totalAmount,
      discount: discount || 0,      // promo discount
      finalAmount: finalAmount || totalAmount, // 총액에서 할인 적용 후 금액
    });

    await order.save();
    res.json({ success: true, orderId: order._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// 사용자의 주문 내역 조회
app.get("/orders", fetchUser, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ==============================
// 12. 서버 실행
// ==============================
app.listen(port, (error) => {
  if (!error) console.log("Server Running on Port " + port);
  else console.log("Error : " + error);
});
