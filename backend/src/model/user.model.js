import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    rating : {
      type: Number,
      default: 0
    },
    rank : {
      type: String,
      default: "Newbie",
      enum: [
        "Newbie",
        "Pupil",
        "Specialist",
        "Expert",
        "Candidate Master",
        "Master",
        "International Master",
        "Grandmaster",
        "International Grandmaster",
        "Legendary Grandmaster",
      ],
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
    avatar: {
      type: String,
      required: false,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    problemSolved: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
    },
    refreshToken: {
      type: String,
      default: null,
    },
    links: {
      github: {
        type: String,
        default: null,
        trim: true
      },
      linkedin: {
        type: String,
        default: null,
        trim: true
      },
      website: {
        type: String,
        default: null,
        trim: true
      },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hashSync(this.password, 10);
  this.updatedAt = Date.now();
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d",
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "1d",
    }
  );
};

const User = mongoose.model("User", userSchema);

export {User};
