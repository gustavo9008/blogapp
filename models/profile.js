const { ObjectId } = require("mongoose");
const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
      name: {    
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        name: String,
        username: String
      },
      about: String,
      skills: String,
      image: [{
        url: String,
        filename: String
      }],
      genericPic: [String, String, String],
      learning: String,
      location: String,
      links: {
        personalWebsite: String,
        instagram: String,
        twitter: String,
        youtube: String,
        linkedin: String,
      },
      blogs: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog"
    }
    ],
    readingList: [{
        blog_id: String,
        url: String,
        title: String,
        created: {type: Date, default: Date.now}
    }],
      comments: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }
    ],
    commentReplies: [
      {
      replyId: String,
    }
]
}, {timestamps: true}); 

let Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;