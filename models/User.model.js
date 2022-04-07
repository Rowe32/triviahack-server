const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true
    },
    email: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    avatar: String,
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    score: Number
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
