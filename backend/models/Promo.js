import { Schema, model } from "mongoose";

const PromoSchema = new Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ["percent"], default: "percent" },
  amount: { type: Number, required: true },
  minCartValue: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
});

export default model("Promo", PromoSchema);
