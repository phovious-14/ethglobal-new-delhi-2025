import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  privyId: {
    type: String,
    required: true,
    unique: true,
  },
  walletAddress: {
    type: String,
    unique: true,
    sparse: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    enum: ["influencer", "brand", "admin"],
  },
  recipients: [
    {
      name: {
        type: String,
        required: true,
      },
      walletAddress: {
        type: String,
        required: true,
      },
    }
  ]
});

const User = mongoose.model("User", userSchema);

export default User;
