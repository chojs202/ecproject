import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Users from "../models/User.js";
import Order from "../models/Order.js";
import dotenv from "dotenv";

dotenv.config();

/* ================================================
   1️⃣ SIGN UP  (POST /api/users/signup)
================================================ */
export const signup = async (req, res) => {
  try {
    const existingUser = await Users.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new Users({
      name: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      phone: req.body.phone || "",
      address: req.body.address || {},
      cartData: {},
    });

    await user.save();

    const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ success: true, token });
  } catch (error) {
    console.error("❌ signup error:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

/* ================================================
   2️⃣ LOGIN  (POST /api/users/login)
================================================ */
export const login = async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found." });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password." });
    }

    const token = jwt.sign(
      { user: { id: user.id } },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ success: true, token });
  } catch (error) {
    console.error("❌ login error:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

/* ================================================
   3️⃣ UPDATE USER INFO  (PATCH /api/users/me)
================================================ */
export const editUser = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    if (address && typeof address === "object") {
      updateData.address = {};
      if (address.country) updateData.address.country = address.country;
      if (address.region) updateData.address.region = address.region;
      if (address.postalCode) updateData.address.postalCode = address.postalCode;
    }

    const updatedUser = await Users.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select("-password -cartData");

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("❌ editUser error:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

/* ================================================
   4️⃣ CHANGE PASSWORD  (PATCH /api/users/me/password)
================================================ */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await Users.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("❌ changePassword error:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

/* ================================================
   5️⃣ GET USER INFO  (GET /api/users/me)
================================================ */
export const getUser = async (req, res) => {
  try {
    const user = await Users.findById(req.user.id).select("-password -cartData");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
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
    console.error("❌ getUser error:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

/* ================================================
   6️⃣ DELETE ACCOUNT  (DELETE /api/users/me)
================================================ */
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
        .json({ success: false, message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: "Incorrect password." });
    }

    await Order.deleteMany({ userId: req.user.id }).session(session);
    await Users.findByIdAndDelete(req.user.id).session(session);

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "User account and related orders deleted successfully.",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ deleteUser error:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
