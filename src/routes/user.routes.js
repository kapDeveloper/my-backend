// user.Routes.js
const express = require("express");
const router = express.Router();

const { verifyJWT } = require("../middleware/auth.js");
const {
  signUp,

  signIn,

  logout,
} = require("../controllers/user.controller.js");

//user
router.post("/signUp", signUp);

router.post("/signIn", signIn);

router.post("/logout", verifyJWT, logout);

module.exports = router;
