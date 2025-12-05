// ==============================
// 1. 기본 세팅
// ==============================
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// 라우트 import
import productRoutes from "./routes/productRoutes.js";
import promoRoutes from "./routes/promoRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import { createDefaultPromo } from "./controllers/promoController.js";

// 환경변수 로드
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// ==============================
// 2. 미들웨어
// ==============================
app.use(
  cors({
    origin: [
      "http://localhost:3000",  //프론트엔드 로컬환경
      "http://localhost:5173", //  admin 로컬환경
      "https://ecproject-main.onrender.com", // 프론트엔드 배포환경
      "https://ecproject-admin.onrender.com", // admin 배포환경
    ],
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "auth-token"],
    credentials: true,
  })
);
app.use(express.json());

// ==============================
// 3. MongoDB 연결
// ==============================
const connectDB = async () => {
  let retries = 5;

  while (retries) {
    try {
      console.log("⏳ Connecting to MongoDB...");
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log("✅ MongoDB connected");
      break;
    } catch (err) {
      retries--;
      console.error(`❌ MongoDB connection failed. Retries left: ${retries}`);
      console.error(err.message);

      if (!retries) {
        console.log("🚨 MongoDB connection failed permanently.");
        process.exit(1);
      }

      await new Promise((res) => setTimeout(res, 3000));
    }
  }
};

connectDB();

// 연결 끊겼을 때 대응
mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected, reconnecting in 3s...");
  setTimeout(() => {
    connectDB();
  }, 3000);
});


// ==============================
// 4. 기본 라우트
// ==============================
app.get("/", (_req, res) => res.send("Express App is Running"));

// ==============================
// 5. 라우트 연결
// ==============================
app.use("/api/products", productRoutes);
app.use("/api/promos", promoRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// ==============================
// 6. 기본 프로모 코드 생성
// ==============================
createDefaultPromo();

// ==============================
// 7. 서버 실행
// ==============================
app.listen(port, (error) => {
  if (!error) console.log(`🚀 Server running on port ${port}`);
  else console.error("❌ Server error:", error);
});
