const express = require("express");
const { route } = require(".");
const router = express.Router();
const Author = require("../models/authorSchema");

router.get("/", async (req, res) => {
  const searchOption = {};
  if (req.query.name !== null && req.query.name !== "") {
    searchOption.name = new RegExp(req.query.name, "i");
  }
  try {
    const authors = await Author.find(searchOption);
    res.render("author/index", { authors, searchOption });
  } catch (err) {
    res.redirect("/");
  }
});
router.get("/new", (req, res) => {
  res.render("author/new", { author: new Author() });
});
router.post("/", async (req, res) => {
  const author = new Author({
    name: req.body.name,
  });
  try {
    const data = await author.save();
    if (data) {
      //   res.redirect(`redirect/${data.id}`);
      res.redirect("authors");
    }
  } catch (err) {
    res.render("author/new", {
      author: author,
      errorMessage: "Error! Cann't create New Author.",
    });
  }
});
module.exports = router;
