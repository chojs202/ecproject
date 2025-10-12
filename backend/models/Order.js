import { Schema, model } from "mongoose";

const OrderSchema = new Schema({
  userId: { type: String, required: true },
  items: {
    type: [
      {
        productId: Number,
        name: String,
        size: String,
        quantity: Number,
        price: Number,
      },
    ],
    required: true,
  },
  totalAmount: { type: Number, required: true },
  discount: Number,
  discountPercent: Number,
  finalAmount: Number,
  status: { type: String, enum: ["pending", "paid"], default: "paid" },
  createdAt: { type: Date, default: Date.now },
});

export default model("Order", OrderSchema);
