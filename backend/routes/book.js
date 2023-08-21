const express = require("express");
const { route } = require(".");
const router = express.Router();
const Author = require("../models/authorSchema");

router.get("/", async (req, res) => {
  res.render("books/index.ejs");
});
router.get("/new", (req, res) => {
  res.render("books/new.ejs");
});
router.post("/", async (req, res) => {
  res.send("Created New book");
});
module.exports = router;
