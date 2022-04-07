const { Schema, model } = require("mongoose");

const quizSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId, ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      enum : ['easy', 'medium', 'hard'],
      required: true
    }
  },
  {
    timestamps: true,
  }
);

const Quiz = model("Quiz", quizSchema);

module.exports = Quiz;
