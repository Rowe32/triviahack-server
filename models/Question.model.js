const { Schema, model } = require("mongoose");

const questionSchema = new Schema(
  {
    quiz: {
      type: Schema.Types.ObjectId, ref: "Quiz",
      required: true
    },
    question: {
      type: String,
      required: true
    },
    correct_answer: {
      type: String,
      required: true
    },
    incorrect_answers: {
      type: [String],
      required: true
    }
  },
  {
    timestamps: true,
  }
);

const Question = model("Question", questionSchema);

module.exports = Question;
