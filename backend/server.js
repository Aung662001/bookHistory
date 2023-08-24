if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const appRouter = require("./routes/index");
const authorRouter = require("./routes/author");
const bookRouter = require("./routes/book");
const mongoose = require("mongoose");
const methodOverride = require("method-override");

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: "false" }));

app.use("/", appRouter);
app.use("/authors", authorRouter);
app.use("/books", bookRouter);
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to MongoDB"));
// server setup
app.listen(process.env.PORT || 3500, () => {
  console.log("Server is running at PORT:3500");
});
