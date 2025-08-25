import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [8, "Password must be at least 8 characters long"],
    },
    role :{
      type : String,
      enum : ['user','author','admin'],
      default : 'user'
    },
    problemSolved: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
    },
    refreshToken: {
      type: String,
      default: null,
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
