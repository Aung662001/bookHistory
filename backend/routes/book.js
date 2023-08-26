const express = require("express");
const { route } = require(".");
const router = express.Router();
const Author = require("../models/authorSchema");
const Book = require("../models/bookSchema");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
// const filePath = path.join("public", Book.imageBasePath);

const imageMimeTypes = ["image/apng", "image/gif", "image/jpeg", "image/png"];
// const upload = multer({
//   dest: filePath,
//   fileFilter: (req, file, callback) => {
//     callback(null, imageMimeTypes.includes(file.mimetype));
//   },
// });

router.get("/", async (req, res) => {
  let query = Book.find();
  if (req.query.title != null && req.query.title != "") {
    query = query.regex("title", req.query.title, "i");
  }

  if (req.query.uploadedBefore != null && req.query.uploadedBefore != "") {
    query = query.gte("publishDate", req.query.uploadedBefore, "i");
  }

  if (req.query.uploadedAfter != null && req.query.uploadedAfter != "") {
    query = query.lte("publishDate", req.query.uploadedAfter, "i");
  }

  try {
    const books = await query.exec();
    res.render("books/index.ejs", { books, searchOption: req.query });
  } catch (err) {
    res.redirect("/");
  }
});
router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});
router.post(
  "/",
  // upload.single("cover"),
  async (req, res) => {
    // const fileName = req.file != null ? req.file.filename : "";
    // console.log(req.body);
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      publishDate: new Date(req.body.publishDate),
      description: req.body.description,
      pageCount: req.body.pageCount,
      // coverImageName: fileName,
    });
    saveImage(book, req.body.cover);
    try {
      const newBook = await book.save();
      res.redirect("books");
    } catch (err) {
      // console.log(err);
      // if (book.coverImageName != null) {
      //   removeBookCover(book.coverImageName);
      // }
      renderNewPage(res, book, true);
    }
  }
);
// const removeBookCover = (bookCover) => {
//   fs.unlink(path.join(filePath, bookCover), (err) => {
//     if (err) console.log(err);
//   });
// };
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("author").exec();
    console.log(book);
    res.render("books/show", { book });
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});
async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors,
      book,
    };
    if (hasError) {
      params.errorMessage = "Error at creating book!";
    }
    res.render("books/new", params);
  } catch (err) {
    console.log(err, "renderNewPage");
    res.redirect("books");
  }
}
function saveImage(book, coverEncoded) {
  if (coverEncoded == null) return;
  const cover = JSON.parse(coverEncoded);
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, "base64");
    book.coverImageType = cover.type;
  }
}
module.exports = router;
