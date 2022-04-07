const router = require("express").Router();
const csrfMiddleware = require("../middlewares/csrfMiddleware");
const isLoggedIn = require("../middlewares/isLoggedIn");
const Quiz = require("../models/Quiz.model");
const Question = require("../models/Question.model");
const axios = require("axios");

router.post("/quiz/create", isLoggedIn, csrfMiddleware, async (req, res) => {
  try {
    const { quiz, questions } = req.body;

    const newQuiz = await Quiz.create({
      owner: req.session.user._id, 
      name: quiz.name,
      difficulty: quiz.difficulty
    });

    questions.forEach(async(question) => {
      await Question.create({
        quiz: newQuiz._id,
        question: question.question,
        correct_answer: question.correct_answer,
        incorrect_answers: question.incorrect_answers
      });
    });

    return res.json({ message: "Successfully created!" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ errorMessage: "Something went wrong!" });
  }
});

router.put("/quiz/edit", isLoggedIn, csrfMiddleware, async (req, res) => {
  try {
    const { quiz, questions } = req.body;

    const editQuiz = await Quiz.findByIdAndUpdate(quiz._id, {
      name: quiz.name,
      difficulty: quiz.difficulty  
    });

    questions.forEach(async(question) => {
      await Question.findByIdAndUpdate(question._id, {
        question: question.question,
        correct_answer: question.correct_answer,
        incorrect_answers: question.incorrect_answers
      });
    });

    return res.json({ message: "Successfully updated!" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ errorMessage: "Something went wrong!" });
  }
});

router.delete("/quiz/delete", isLoggedIn, csrfMiddleware, async (req, res) => {
  try {
    const { quiz } = req.body;

    const questions = await Question.find({ quiz: quiz._id });
    questions.forEach(async(question) => {
      await Question.findByIdAndDelete(question._id);
    });

    await Quiz.findByIdAndDelete(quiz._id);

    return res.json({ message: "Successfully deleted!" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ errorMessage: "Something went wrong!" });
  }
});

router.get("/categories", isLoggedIn, csrfMiddleware, async (req, res) => {
  try {
    const response = await axios.get('https://opentdb.com/api_category.php');

    return res.json({ categories: response.data.trivia_categories });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ errorMessage: "Something went wrong!" });      
  }
});

module.exports = router;