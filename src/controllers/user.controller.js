const ErrorHandler = require("../utils/ErrorHandler.js");
const handleValidationError = require("../utils/mongooseErrorHandler.js");
const User = require("../models/user.js");

//Exclude Fields in Response--------------------------------------------
const excludeField = "-password ";

//Custom Methods-----------------------------------
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    return {
      error: "Something went wrong while generating refresh and access tokens",
    };
  }
};

// controllers-----------------------------------
exports.signUp = async (req, res) => {
  try {
    const { email, confirmPassword, password, userName } = req.body;

    if (
      [confirmPassword, email, password, userName].some(
        (field) => field?.trim() === ""
      )
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exist please try to signIn" });
    }

    const newUser = await User.create({ email, password, userName });
    const user = await User.findById(newUser._id).select("email");

    if (!user) {
      return res
        .status(500)
        .json({ error: "Something went wrong while registering the user" });
    }
    return res
      .status(200)
      .json({ message: "User registered successfully", data: user });
  } catch (error) {
    handleValidationError(error, res);
  }
};

exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(409).json({ error: "User does not exist" });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid user credentials" });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    console.log(accessToken);
    const loggedInUser = await User.findById(user._id).select(
      `${excludeField}`
    );

    console.log(loggedInUser);
    const options = {
      httpOnly: true,
      secure: true,
    };

    res.cookie("accessToken", accessToken, options);
    res.cookie("refreshToken", refreshToken, options);
    return res
      .status(200)
      .json({ message: "User signed in successfully", data: loggedInUser });
  } catch (error) {
    handleValidationError(error, res);
  }
};

exports.logout = async (req, res) => {
  try {
    console.log(req);
    await User.findByIdAndUpdate(
      req.User._id,
      { $unset: { refreshToken: 1 } },
      { new: true }
    );

    const cookieOptions = { httpOnly: true, secure: true };

    return res
      .status(200)
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .json({ message: "User logged out successfully" });
  } catch (error) {
    console.log(error);
    new ErrorHandler("Unable to logout. Server error!", 500, res);
  }
};
