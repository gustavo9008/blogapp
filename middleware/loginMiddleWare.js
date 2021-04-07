const Blog = require("../models/blog");
const Profile = require("../models/profile");
const User = require("../models/user");
const Comment = require("../models/comment");
// middleware

let middleWareObj = {};
middleWareObj.checkProfileRegistered = (req,res,next) => {
    if(req.user){
        if(req.user.profileRegistered === false){
            req.flash("error",'You must registered, please 🥺')
            return res.redirect("/blogs/register-profile");
        }
      }
      next();
}
// ===== checks blogOwner before editing =====
middleWareObj.checkBlogOwner = (req, res, next) => {
    if (req.isAuthenticated()) {
        Blog.findById(req.params.id, function (err, foundBlog) {
            if (err) {
                req.flash("error", 'oh no somthing went wrong!')
                return res.redirect("/back");
            } else {
                // does user own the campground
                if (foundBlog.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", 'Access denied!')
                    return res.redirect("/blogs/" + req.params.id);
                }
            }
        });
    } else {
        return res.redirect("/blogs");
    }
};
// ===== checks comments owner before editing =====
middleWareObj.checkCommentOwner = (req, res, next) => {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err) {
                res.redirect("/back");
            } else {
                // does user own the comment
                if (foundComment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", 'Access denied!')
                    return res.redirect("/blogs/" + req.params.id);
                }
            }
        });
    } else {
        return res.redirect("/blogs/" + req.params.id);
    }
};
// ===== checks if there is log in user =====
middleWareObj.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
      return next()
    }
    req.flash("error", "You Must Be Log in!");
    return res.redirect("/blogs/login");
  };
//   ===== finds profile and check if article clicked on is on there saved readingList =====
  middleWareObj.findProfile = (req, res, next) => {
    if(req.isAuthenticated()){
                Profile.findById(req.user.profile, (err, profile) => {
                    if(err){
                        req.flash("error", 'oh noooo, something went wrong \u{1F615}')
                        return res.redirect("/blogs")
                    }
                    Profile.findById(req.user.profile).findOne({'readingList.blog_id': req.params.id}, (err, doc) => {
                        if(err){
                            req.flash("error", 'Something went wrong, try again later \u{1F641}')
                            return res.redirect("/blogs")
                        }
                        if(doc){
                          req.readingList = true;
                          return res.locals.readingListOn = req.readingList;
                        } else {
                            req.readingList = false;
                            return res.locals.readingListOn = req.readingList;
                        }
                        
                      })
                    req.profile = profile;
                    res.locals.currentProfile = req.profile;
                    next();
                })
    }else {
        next();
    };
  };

module.exports = middleWareObj