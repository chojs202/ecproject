import { Schema, model } from "mongoose";

const ProductSchema = new Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: [String], required: true, default: [] },
  size: { type: [String], required: true, default: [] },
  category: { type: String, required: true },
  new_price: { type: Number, required: true },
  old_price: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  available: { type: Boolean, default: true },
  likes: [{ type: Schema.Types.ObjectId, ref: "Users" }],
});

export default model("Product", ProductSchema);
