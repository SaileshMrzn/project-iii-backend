import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  name: String,
  email: String,
  picture: String,
});

const User = mongoose.model("User", userSchema);

export default User;
