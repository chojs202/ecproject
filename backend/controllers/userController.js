import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Users from "../models/User.js";
import Order from "../models/Order.js";
import dotenv from "dotenv";

dotenv.config();

// ==============================
// 회원가입
// ==============================
export const signup = async (req, res) => {
  try {
    const check = await Users.findOne({ email: req.body.email });
    if (check)
      return res.status(400).json({
        success: false,
        errors: "Existing user found with same email address",
      });

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new Users({
      name: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      phone: req.body.phone,
      address: req.body.address,
      cartData: {},
    });

    await user.save();

    const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.error("❌ signup error:", error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
};

// ==============================
// 로그인
// ==============================
export const login = async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.body.email });
    if (!user)
      return res.status(400).json({ success: false, errors: "User not found" });

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, errors: "Invalid password" });

    const token = jwt.sign(
      { user: { id: user.id } },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ success: true, token });
  } catch (error) {
    console.error("❌ login error:", error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
};

// ==============================
// 사용자 정보 수정
// ==============================
export const editUser = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

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

    if (!user)
      return res.status(404).json({ success: false, errors: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    console.error("❌ editUser error:", error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
};

// ==============================
// 비밀번호 변경
// ==============================
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await Users.findById(req.user.id);
    if (!user)
      return res.status(404).json({ success: false, errors: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, errors: "Current password is incorrect" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("❌ changePassword error:", error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
};

// ==============================
// 사용자 정보 조회
// ==============================
export const getUser = async (req, res) => {
  try {
    const user = await Users.findById(req.user.id).select("-password -cartData");
    if (!user)
      return res.status(404).json({ success: false, errors: "User not found" });

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
    console.error("❌ getUser error:", error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
};

// ==============================
// 회원 탈퇴 (유저 + 주문 기록 삭제, 트랜잭션)
// ==============================
export const deleteUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { password } = req.body;
    const user = await Users.findById(req.user.id).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, errors: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, errors: "Password is incorrect" });
    }

    await Order.deleteMany({ userId: req.user.id }).session(session);
    await Users.findByIdAndDelete(req.user.id).session(session);

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "User and orders deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ deleteUser error:", error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
};
