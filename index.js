const dotenv = require("dotenv");
dotenv.config({
  path: "",
});
const connectDB = require("./src/config/connectDb.js");
const app = require("./app.js");

connectDB()
  .then(() => {
    //server setup
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is listening on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Unabel to start server", error);
  });
