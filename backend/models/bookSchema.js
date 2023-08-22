const mongoose = require("mongoose");
const path = require("path");
const imageBasePath = "uploads/images";
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  pageCount: {
    type: Number,
    required: true,
  },
  publishDate: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Author",
  },
  coverImageName: {
    type: String,
    required: true,
  },
});
bookSchema.virtual("coverImagePath").get(function () {
  if (this.coverImageName != null) {
    return path.join("/", imageBasePath, this.coverImageName);
  }
});
module.exports = mongoose.model("Book", bookSchema);
module.exports.imageBasePath = imageBasePath;
