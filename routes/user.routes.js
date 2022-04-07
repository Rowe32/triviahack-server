const router = require("express").Router();
const csrfMiddleware = require("../middlewares/csrfMiddleware");
const isLoggedIn = require("../middlewares/isLoggedIn");
const { storage } = require('../config/cloudinary.config');
const User = require("../models/User.model");

router.get("/user", isLoggedIn, csrfMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);

    await user.populate("friends");

    res.json(user);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ errorMessage: "Something went wrong!" });
  }
});


router.put("/user/edit", isLoggedIn, csrfMiddleware, async (req, res) => {
  try {
    const { avatar } = req.body;

    const uploadResponse = await storage.cloudinary.uploader.upload(avatar, {upload_preset: 'triviahack_setup'});

    await User.findByIdAndUpdate(req.session.user._id, { avatar: uploadResponse.url });

    return res.json({ message: "Successfully updated!" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ errorMessage: "Something went wrong!" });
  }
});

router.put("/user/add-friend", isLoggedIn, csrfMiddleware, async (req, res) => {
  try {
    const { username } = req.body;
    const userFriend = await User.findOne({ username });
    if (!userFriend) {
        return res.status(400).json({
        errorMessage: "Username not found, please try a different one!",
      });
    }

    await User.findByIdAndUpdate(req.session.user._id, { $push: { friends: userFriend._id } });

    return res.json({ message: "Successfully added!" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ errorMessage: "Something went wrong!" });
  }
});

module.exports = router;