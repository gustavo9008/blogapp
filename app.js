if(process.env.NODE_ENV !== "production"){
  require('dotenv').config();
}
const   express = require("express"),
        session = require('express-session'),
        app = express(),
        methodOverride = require("method-override"),       
        bodyParser = require("body-parser"),
        mongoose = require("mongoose"),
        passport = require("passport"),
        localStrategy = require("passport-local"),
        passportLocalMongoose = require("passport-local-mongoose"),
        User = require("./models/user"),
        Profile = require("./models/profile"),
        Blog = require("./models/blog"),
        Comment = require("./models/comment"),
        flash =  require("connect-flash");

const MongoStore = require('connect-mongo'); 
const port = 3000;

// express router config
const commentRoutes = require("./routes/comments.min.js"),
      indexRoutes =require("./routes/index.min.js"),
      profileRoutes = require("./routes/profile.min.js"),
      blogRoutes = require("./routes/blog.min.js");
const dbUrl = process.env.MONGODB;
  mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
  .then(() => console.log("Connected to DB!"))
  .catch((error) => console.log(error.message));
//express session
const dbSecret = process.env.SECRET || "Coding is hard";
const store = new MongoStore({
  mongoUrl: dbUrl,
  secret: dbSecret,
  touchAfter: 24 * 60 * 60
});
store.on("error", function(e){
  console.log("session store error");
})
const sessionConfig = {
  store,
  secret: dbSecret,
  name: 'DevMe',
  resave: false,
  saveUninitialized: false,
  cookie : {
    sameSite: 'strict', 
  }
};
app.use(session(sessionConfig));
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// package setups
app.use(passport.initialize());
app.use(passport.session());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '5mb'}));
app.use(methodOverride("_method"));
app.use(flash());



app.use(function(req, res, next) {
  res.locals.readingListOn = null;
  res.locals.currentUser = req.user;
  res.locals.currentProfile = req.profile;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  
  next();
});


// express routes
app.use(indexRoutes);
app.use(profileRoutes);
app.use(blogRoutes);
app.use(commentRoutes);



// middleware
function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()){
    return next();
  }res.redirect("/blogs");
}




//  server setup
app.listen(process.env.PORT, process.env.IP || port, () => {
    console.log("blogapp is running!");
  });