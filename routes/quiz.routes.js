const router = require("express").Router();
const csrfMiddleware = require("../middlewares/csrfMiddleware");
const isLoggedIn = require("../middlewares/isLoggedIn");
const axios = require("axios");
const Quiz = require("../models/Quiz.model");
const Question = require("../models/Question.model");
const User = require("../models/User.model");
const { default: mongoose } = require("mongoose");

router.get("/quiz/list", isLoggedIn, csrfMiddleware, async (req, res) => {
  try {
    const quizzes = await Quiz.find({owner: req.session.user._id});

    return res.json({ quizzes });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ errorMessage: "Something went wrong!" });  
  }
});

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
    console.log(quiz, questions)
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
    /* we transform string_id to Object_id for mongoose search */
    const quizId = mongoose.Types.ObjectId(req.query.quizId);
    const questions = await Question.find({ quiz: quizId });
    questions.forEach(async(question) => {
      await Question.findByIdAndDelete(question._id);
    });

    await Quiz.findByIdAndDelete(quizId);

    return res.json({ message: "Successfully deleted!" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ errorMessage: "Something went wrong!" });
  }
});

router.get("/categories", isLoggedIn, csrfMiddleware, async (req, res) => {
  try {
    const response = await axios.get('https://opentdb.com/api_category.php');
    const categoriesToFilter = [13, 25, 26, 30,]; //This categories don't have 10 questions
    const categories = response.data.trivia_categories.filter((category => !categoriesToFilter.includes(category.id)));

    return res.json({ categories });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ errorMessage: "Something went wrong!" });      
  }
});

router.get("/own-friends-quizzes", isLoggedIn, csrfMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    await user.populate("friends");

    let idsFilter = [user._id];
    user.friends.forEach((friend) => {
      idsFilter.push(friend._id);
    });

    const quizzes = await Quiz.find({owner: idsFilter});

    return res.json({ quizzes });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ errorMessage: "Something went wrong!" });  
  }
});

router.get("/questions", isLoggedIn, csrfMiddleware, async (req, res) => {
  try {
    let { quizId, category, difficulty } = req.query;
    if (quizId !== "") {
      quizId = mongoose.Types.ObjectId(quizId);
      const questions = await Question.find({quiz: quizId});
      return res.json({ questions });
    } else {
      const response = await axios.get(`https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=multiple`);

      return res.json({ questions: response.data.results });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ errorMessage: "Something went wrong!" });
  }
});

module.exports = router;