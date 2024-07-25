const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

//global midellware
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//import routers
const userRoutes = require("./src/routes/user.routes.js");

//routes declaration
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello I am your Server!");
});

module.exports = app;
