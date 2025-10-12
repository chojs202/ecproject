import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  address: {
    country: { type: String, required: true },
    region: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  cartData: { type: Object, default: {} },
  date: { type: Date, required: true, default: Date.now },
});

export default model("Users", UserSchema);
