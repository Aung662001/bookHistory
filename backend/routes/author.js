const express = require("express");
const { route } = require(".");
const router = express.Router();
const Author = require("../models/authorSchema");
const Book = require("../models/bookSchema");

router.get("/", async (req, res) => {
  const searchOption = {};
  if (req.query.name !== null && req.query.name !== "") {
    searchOption.name = new RegExp(req.query.name, "i");
  }
  try {
    const authors = await Author.find(searchOption);
    res.render("author/index", { authors, searchOption: req.query });
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
      res.redirect(`authors/${data.id}`);
      // res.redirect("authors");
    }
  } catch (err) {
    res.render("author/new", {
      author: author,
      errorMessage: "Error! Cann't create New Author.",
    });
  }
});
//show author
router.get("/:id", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    const books = await Book.find({ author: req.params.id }).limit(6).exec();
    res.render("author/show", {
      author,
      books,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    res.render("author/edit", { author });
  } catch (err) {
    res.render("/author");
  }
});

router.put("/:id", async (req, res) => {
  let author;
  let id = req.params.id;
  let name = req.body.name;
  if (!name) return;
  try {
    author = await Author.findById(id);
    author.name = name;
    author.save();
    res.redirect(`/authors/${id}`);
  } catch (err) {
    if (author == null) res.redirect("/");
    console.log(err);
    res.redirect(`/author/${id}/edit`, {
      author,
      errorMessage: "Error Editing Author!",
    });
  }
});
//delete author
router.delete("/:id", async (req, res) => {
  let author;
  let id = req.params.id;
  try {
    author = await Author.findById(id);
    // find connected book to this author
    const connectedBook = await Book.find({ author: id });
    if (connectedBook.length)
      throw new Error("Connected to book, Can't Note delete this author");

    await author.deleteOne();
    res.redirect(`/authors`);
  } catch (err) {
    console.log(err);
    if (author == null) return res.redirect("/");
    res.redirect(`/authors/${id}`);
  }
});
module.exports = router;
