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
//create a book
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
      res.redirect(`books/${newBook.id}`);
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
//show a single book page
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("author").exec();
    res.render("books/show", { book });
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});
//edit book route
router.get("/:id/edit", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    renderEditPage(res, book);
  } catch {
    res.redirect("/");
  }
});
//update book
router.put("/:id", async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    book.title = req.body.title;
    book.author = req.body.author;
    book.publishDate = req.body.publishDate;
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;
    if (req.body.cover != null && req.body.cover != "") {
      saveImage(req.body.cover);
    }
    await book.save();
    res.redirect(`/books/${book.id}`);
  } catch {
    if (book !== null) {
      renderEditPage(res, book, true);
    } else {
      res.redirect("/");
    }
  }
});
//delete book
router.delete("/:id", async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    await book.deleteOne();
    res.redirect("/books");
  } catch (err) {
    console.log(err);
    if (book == null)
      return res.render("books/show", {
        book,
        errorMessage: "Can't Remove Book",
      });
    res.redirect(`/`);
  }
});
async function renderNewPage(res, book, hasError = false) {
  renderPage(res, book, "new", hasError);
}
function renderEditPage(res, book, hasError = false) {
  renderPage(res, book, "edit", hasError);
}

async function renderPage(res, book, form, hasError) {
  try {
    const authors = await Author.find({});
    const params = {
      authors,
      book,
    };
    if (hasError) {
      if (form === "edit") {
        params.errorMessage = "Error at updatint book!";
      } else {
        params.errorMessage = "Error at creating book!";
      }
    }
    res.render(`books/${form}`, params);
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
