const mongoose = require("mongoose");

let replaySchema = new mongoose.Schema({
    text: String,
    profile: String,
    replies:[{
        text: String,
        profile: String,
        url: {
            address: String,
            title: String
        },
        author: {
            id:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            username: String
        },
        created: {type: Date, default: Date.now}        
    }],
    url: {
        address: String,
        title: String
    },
    author: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    created: {type: Date, default: Date.now}
});

let commentSchema = new mongoose.Schema({
    text: String,
    profile: String,
    replies:[replaySchema],
    url: {
        address: String,
        title: String
    },
    author: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    created: {type: Date, default: Date.now}
});

let Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
