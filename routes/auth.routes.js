const router = require("express").Router();
const bcrypt = require("bcrypt");
const { storage } = require('../config/cloudinary.config');
const User = require("../models/User.model");

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw Error();
    }

    const correctPassword = await bcrypt.compare(password, user.password);
    if (!correctPassword) {
      throw Error();
    }

    const sessionUser = { username: user.username, _id: user._id, avatar: user.avatar };
    req.session.user = sessionUser;

    return res.json({ message: "Successfully logged in!", user: sessionUser });

  } catch (error) {
    console.log(error);
    return res.status(400).json({
      errorMessage: "Something went wrong - email and password don't match!",
    });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { formState: {username, email, password} , avatar} = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        errorMessage: "A user with that email already exists!",
      });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
        return res.status(400).json({
        errorMessage: "Username already exists, please try a different one!",
      });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const uploadResponse = await storage.cloudinary.uploader.upload(avatar);

    await User.create({ username, email, password: passwordHash, avatar: uploadResponse.public_id, friends: [], score: 0 });

    return res.json({ message: "Successfully signed up!" });

  } catch (error) {
    console.log(error);
    return res.status(400).json({ errorMessage: "Something went wrong!" });
  }
});

router.post("/logout", async (req, res, next) => {
  req.session.destroy((error) => {
    if (error) next(error);
    return res.json({ message: "Successfully logged out!" });
  });
});

module.exports = router;