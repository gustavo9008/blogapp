const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: {type: String, unique: true, required: true},
    profileRegistered: Boolean,
    username: {type: String, unique: true, required: true},
    password: String,
    profile: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile"
    }
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
}, {timestamps: true});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

module.exports = User;