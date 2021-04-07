const express = require("express");
const router = express.Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const Comment = require("../models/comment");
const Profile = require("../models/profile");
const middleWare = require("../middleware/loginMiddleWare");
const sanitizeHtml = require('sanitize-html');
const multer  = require('multer');
const {storage, cloudinary} = require("../cloudinary/postIndex"); 
const upload = multer({ storage });

//===== blog RESTful Routes =====
router.get("/", (req, res) => {
     return res.redirect("blogs");
  });
  //===== index route that finds all blogs =====
  router.get("/blogs",middleWare.findProfile, middleWare.checkProfileRegistered, (req, res) => {
    delete req.session.returnTo;
    Blog.find({}).sort({created: '-1'}).exec((err, blogs) => {
      if(err) {
        req.flash("error", 'oops something went wrong try again later 🤦')
        return res.redirect("/notfound")
      }else {
        return res.render("index", {blogs: blogs, currentUser: req.user})
      }
    })
  });
  //===== add new blog route . user login required =====
router.get("/blogs/new",middleWare.isLoggedIn,middleWare.findProfile, (req, res) => {
  return res.render("new"), {profile: req.profile};
  });
  //===== create route =====
router.post("/blogs", middleWare.isLoggedIn, upload.single('file'), (req, res) => {
  
  User.findById(req.user.id, (err, user) => {
    if (err) {
      req.flash("error", 'Oh no!! something went wrong');
      return res.redirect("/blogs")
      
    } else {
      //===== create blog =====
      let dbody = req.body.body;
      let cbody = sanitizeHtml(dbody, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'iframe', 'img' ]),
        allowedAttributes: {
        'img' : ['src', 'alt'],
        'iframe': [ 'src', 'width', 'height', 'allow', 'clipboard-write', 'encrypted-media', 'gyroscope', 'picture-in-picture', 'allowfullscreen' ]
      },
      allowedIframeHostnames: ['www.youtube.com']
      });
      
      let title = req.body.title;
      let author = {
        id: req.user._id,
        username: req.user.username
      }
      let newBlog = {
        title: title,
        body: cbody,
        author: author
      };
      if(req.file){
        let image =  {
          url: req.file.path,
          filename: req.file.filename
          };
        newBlog.image = image;
        createBlog(newBlog);
      }
      if(req.body.imageUrl){
        imageUrl = req.body.imageUrl;
        newBlog.imageUrl = imageUrl;
        createBlog(newBlog);
      };
      function createBlog(post){
        Blog.create(post, (err, blog) => {
          if(err) {
            return res.status(400).send("error");
          } else {
            //===== find profile link to user =====
            
            Profile.findById(req.user.profile, (err, foundProfile) => {
              if (err) {
                req.flash("error", 'Oh no!! something went wrong');
                return res.redirect("back");                
              }
             foundProfile.image[0] ? imageURL(foundProfile) : genericPicColor(foundProfile); 
             function imageURL(profile){            
              return(blog.profile.image = foundProfile.image[0].url);
            }
            function genericPicColor(profile){
              
              return(blog.profile.genericPic = foundProfile.genericPic);
            }
                blog.profile.id = foundProfile._id;
                // blog.profile.genericPic = foundProfile.image[0].url;
                blog.save();
                // saves ref to profile blogs array
                foundProfile.blogs.push(blog);
                foundProfile.save();
                let redirectUrl =  blog._id;
                req.flash("success", "Post was created.🙂");
                return res.status(200).json(redirectUrl);
            })
           
          }
        });
      };
    }
  })
}); //===== end of blog create route =====
  
  //===== show route =====
  router.get("/blogs/:id",middleWare.findProfile, (req, res, next) => {
    //===== check if there is a user if not it will not add redirect url ===== 
    if(!req.user){
      req.session.returnTo = req.originalUrl;
     }//======
    //===== find blog =====
    Blog.findById(req.params.id).populate({path: "comments", options: { sort: {'created': -1}}}).exec((err, foundBlog) => {
      if(err) {      
        req.flash("error", 'Article not found')
        return res.redirect("/blogs");
      }
        if(!foundBlog && req.session.profilePageURL){
          // delete req.session.profilePageURL;
          req.flash("error", "Article Not Found!!!")
          return res.redirect("/blogs/profile")
        } else {
        if(!foundBlog ){
       
          req.flash("error", "Article Not Found!!!")
          return res.redirect("/blogs/profile")
        }
          return res.render("show", {blog: foundBlog, profile: req.profile, list: req.readingList});
      }
    });
  });
  //===== edit route must be sign to work =====
  router.get("/blogs/:id/edit", middleWare.isLoggedIn, middleWare.findProfile, (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
      if(err) {
        return res.redirect("/blogs");
      } else {
        return res.render("edit", {blog: foundBlog, profile: req.profile});
      }
    });  
  });
  //===== update route =====
  router.put("/blogs/:id", middleWare.isLoggedIn, (req, res) => {
    req.body.blog.body = sanitizeHtml(req.body.blog.body, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'iframe', 'img' ]),
      allowedAttributes: {
        'img' : ['src'],
        'iframe': [ 'src', 'width', 'height', 'allow', 'clipboard-write', 'encrypted-media', 'gyroscope', 'picture-in-picture', 'allowfullscreen' ]
      },
      allowedIframeHostnames: ['www.youtube.com']
    });
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
      if(err){
        return res.redirect("/blogs");
      }else {
        req.flash("success", 'Post was updated')
         return res.redirect("/blogs/" + req.params.id)
      }
    })
  });
  //===== delete post route =====
  router.delete("/blogs/:id", middleWare.isLoggedIn, (req, res) => {
    // find blog in ref array
    let b_id = req.params.id;
    
    Blog.findById(req.params.id, (err, foundBlog) => {
    if(foundBlog.image[0]){
      cloudinary.uploader.destroy(foundBlog.image[0].filename);
    }
          if(foundBlog.comments){
            foundBlog.comments.forEach(comm => 
              Comment.findByIdAndRemove(comm, (err, commentFound) =>{
                // let comm_id = commentFound.profile;
                Profile.findByIdAndUpdate(commentFound.profile, {$pull: {"comments": commentFound.profile}}, { safe: true, multi:true });//=======
              })
              )
          }
            
    });//==========

    Profile.findByIdAndUpdate(req.user.profile, {$pull: {"blogs": b_id}}, { safe: true, multi:true }, function(err, blog){
      if(err){
        req.flash("error",'oh no, something went wrong')
      }
    })//=======

    
    //===== deletes blog =====
    Blog.findByIdAndRemove(req.params.id, (err) => {
      if(err) {
        return res.redirect("/blogs");
      }else {
        // req.flash("success", 'Post was deleted')
        // res.redirect("/blogs")
      }
    })
    req.flash("success", 'Post was deleted')
    return res.redirect("/blogs")
  });
  //===== add article to reading list =====
  router.post("/blogs/:id/reading", middleWare.isLoggedIn, (req, res) => {
    Profile.findById(req.user.profile, (err, profile) => {
      if(err) {
        return res.status(404).send("profile");
      }
      let blog_id = req.body.blog_id
      let url = req.body.url;
      let title = req.body.title;
      let newUrl = {blog_id: blog_id,url: url, title: title};
      profile.readingList.push(newUrl);
      profile.save();
      return res.send("success")
    })
  });
  //===== removes article from reading list =====
  router.put("/blogs/:id/reading",middleWare.isLoggedIn, (req, res) => {
    let list_id = req.body.blog_id;
    Profile.findByIdAndUpdate(req.user.profile, {$pull: {"readingList": { "blog_id": list_id}}}, { safe: true, multi:true }, function (err, model){
      if(err){
        return res.status(404).send("profile");
      }
      return res.send("Remove from reading list!");
      
    })
  });
  
  module.exports = router; 