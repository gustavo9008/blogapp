let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let blogSchema = new Schema({
  title: { type: String },
  imageUrl: { type: String },
  image: [{
    url: String,
    filename: String
  }],
  body: { type: String },
    author: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        username: String
      },
      profile: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Profile"
        },
        image: String,
        genericPic: [String, String, String]
      },
      comments: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Comment"
        }
      ],
      created: {type: Date, default: Date.now}
});
const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
