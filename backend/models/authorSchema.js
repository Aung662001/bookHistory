const mongoose = require("mongoose");
const Book = require("./bookSchema");
const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});
// authorSchema.pre("deleteOne", function (next) {
//   Book.find({ author: this.id }, (error, data) => {
//     if (error) {
//       next(error);
//     } else if (data.length) {
//       next(new Error("The Author Has Connected Book."));
//     } else {
//       next();
//     }
//   });
// });
module.exports = mongoose.model("Author", authorSchema);
