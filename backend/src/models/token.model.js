import mongoose, { Schema } from "mongoose";

const userTokenSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    token: {
        type : String
    },
    tokenType: {
      type: String,
      enum: ['EMAIL_VERIFY', 'PASSWORD_RESET', 'REFRESH_TOKEN'],
      default: 'user',
    },
    expiresAt: {
        type: Date,
        default: null,
    }
},  { timestamps: true }
);

const UserToken = mongoose.model("userToken", userTokenSchema);

export default UserToken;
