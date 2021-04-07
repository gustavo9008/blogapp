const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const Profile = require("../models/profile");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const middleWare = require("../middleware/loginMiddleWare");
const multer  = require('multer');
const {storage, cloudinary} = require("../cloudinary"); 
const { default: async } = require("async");
const upload = multer({ storage });

// profile register page
router.get("/blogs/register-profile",middleWare.isLoggedIn, (req, res) => {
    res.render("userprofile", {currentUser: req.user});
  });
//===== create profile route =====
  router.post("/blogs/register-profile", (req,res) => {
    User.findById(req.user.id, (err, user) => {
      if(err){
        req.flash("error", 'oh no something went wrong, please try again');
        return res.redirect("back");
      }else {
        let genericPic = generateRandomColors(3);
        let name = {
          id: req.user._id,
          name: req.user.name,
          username: req.user.username
        };
        let about = req.body.about,
            skills = req.body.skills;
        // let image = req.files.map(f => ({url: f.path, filename: f.filename }));
        let newProfile = {
          name: name,
          about: about,
          genericPic: genericPic,
          skills: skills
        };
        Profile.create(newProfile, (err, profile) => {
          if(err) {
            req.flash("error", 'oh no something went wrong, please try again later');
            return res.redirect("back");
          }
            profile.save();
            user.profileRegistered = true;
            user.profile.push(profile);
            user.save();
            return res.redirect("/blogs");
          
        })
        // return res.redirect("/blogs");
      }
    })
  });
  //===== logged in user profile page =====
router.get("/blogs/profile",middleWare.isLoggedIn,middleWare.findProfile,  (req, res) => {
    User.findById(req.user.id, (err, user) => {
      if(err) {
        req.flash("error", 'could not find your profile please try again later');
        return res.redirect("back");
      }else {
        Profile.findById(req.user.profile).populate({path: "blogs", options: { sort: {'created': -1}}}).populate({path: "comments", options: { sort: {'created': -1}}}).exec((err, foundProfile) => {
          if(err){
            req.flash("error", 'could not find your profile please try again later');
            return res.redirect("back");
          }
          let blog_id = req.user.blog_id;
        res.render("myprofile", {user: user, profile: foundProfile, blog: blog_id });
        })
      }
    })
  });
  //===== user profile =====
  router.get("/blogs/userprofile/:id",middleWare.findProfile, (req, res) => {  
    Profile.findById(req.params.id).populate({path: "name", options: {path: "id"}}).populate({path: "blogs", options: { sort: {'created': -1}}}).populate({path: "comments", options: { sort: {'created': -1}}}).exec((err, foundProfile) => {
      if(err){
        req.flash("error", 'Could not find user, try again later');
        return res.redirect("back");
      }
      
    return res.render("profile", {profile: foundProfile});
    })
  });//==========
  //===== settings route =====
  router.get("/blogs/profile/settings",middleWare.isLoggedIn, middleWare.findProfile, (req, res) => {   
    return res.render("settings", {user: req.user, profile: req.profile})
  });//==========
  
//===== change profile picture =====
router.put("/blogs/profile/settings", middleWare.isLoggedIn, middleWare.findProfile, upload.array('file'), (req,res) => {
  //=== checks if old image is available ===
    if(req.body.oldImage){
      cloudinary.uploader.destroy(req.body.oldImage);
      updateProfilePicture();
    }else{
      updateProfilePicture();
    }//===
      let updatePicProfile;
      let updatedColor;
      //=== function to update user profile ===
    function updateProfilePicture() {
      Profile.findByIdAndUpdate(req.user.profile, { $pull: { image: { filename: { $in: req.body.oldImage } } } }, { safe: true, multi: true }, function (err, model) {
        if (err) {
          return res.status(400).send('error');
      }
      if(req.files[0]){
        let image = req.files.map(f => ({ url: f.path, filename: f.filename }));
        updatePicProfile = {
          image: image
        }
      }
       if(req.body.genericPic0){         
         let genericPic =[`${req.body.genericPic0}`, `${req.body.genericPic1}`,`${req.body.genericPic2}`];
         const updatePicProfile = false;         
         updatedColor = {
           genericPic: genericPic
         };
        }
        
       const updatedPic_Color = req.files[0] ? updatePicProfile : updatedColor;

      Profile.findByIdAndUpdate(req.user.profile, updatedPic_Color, (err, profile) => {
        if (err) {
          res.send(err);
        }
        
        if (profile.blogs) {
          changeBlogImage(profile);
        } else {
            let successMessage = req.flash("success", 'You have updated your profile picture.')
            return res.status(200).json(successMessage);
          
        }
      })
    })//===
  }
  //=== updates author picture on post ===
  function changeBlogImage(profile){
    //=== finds every blog from user and updates pic/color ===
          let blogLength = Object.keys(profile.blogs);
          for (let i = 0; i < blogLength.length; i++) {
            Blog.findById(profile.blogs[i], (err, blog) => {
              if(err){req.flash("error", 'some posts could not update')};
              if(req.files[0]){
                blog.profile.image = updatePicProfile.image[0].url;
              }
              if(req.body.genericPic0){
                if(blog.profile.image){
                  blog.profile.image = "";
                }
                
                blog.profile.genericPic = updatedColor.genericPic
               }              
              blog.save()
            })
          }
            let successMessage = req.flash("success", 'You have updated your profile picture/color.')
            return res.status(200).json(successMessage);
  }
  });//==========

  //===== change profile settings route =====
router.put("/blogs/profile/settings/updateProfile", middleWare.isLoggedIn, middleWare.findProfile, (req, res) => {
  
let about = req.body.about,
      skills = req.body.skills,
      location = req.body.location;
let links = {
  personalWebsite: req.body.personal,
  instagram: req.body.instagram,
  twitter: req.body.twitter,
  youtube: req.body.youtube,
  linkedin: req.body.linkedin
}

let newProfile = {
    about: about,
    skills: skills,
    location: location,
    links,
  };
  
Profile.findByIdAndUpdate(req.user.profile, newProfile, (err,updatedProfile) => {
    if(err){
      req.flash("error", 'oh no something went wrong, try again later');
    }    
    if(updatedProfile){
      req.flash("success", 'Updated profile')
      return res.redirect('back');
    }
    if(!updatedProfile){
      return res.send("no profile");
    }
})
});//==========

//===== delete account =====
router.delete("/deleteaccount", middleWare.isLoggedIn, (req, res) => {
  let c_profile = req.body.user_profile;
  //===== deletes comment =====
  Comment.deleteMany({profile: req.body.user_profile}, (err) => {
    if(err){
      let errorMessage = req.flash("error", 'no comments found');
      return res.status(400).json(errorMessage);
    }
  });
  Blog.find({"profile.id": req.body.user_profile}, (err, post) => {
    if(err){
      let errorMessage = req.flash("errer", 'No blogs found');
      return res.status(400).json(errorMessage);
    }
    if(post){
      
      let postLength = Object.keys(post);
      deletePostPic();

      function checkPic(){
        //===== loop to check if post has custom image
        for (let i = 0; i < postLength.length; i++) {
          if(post[i].image[0]){
          cloudinary.uploader.destroy(post[i].image[0].filename);
          }
        }
      }
      async function deletePostPic(){
        await checkPic();
        await deletePosts();
      }
      function deletePosts(){
        Blog.deleteMany({"profile.id": req.body.user_profile}, (err,doc) => {
          if(err){
            let errorMessage = req.flash("error", 'oops something went wrong');
            return res.status(400).json(errorMessage);
          }
        })
      }
    }
  })//=====
  Profile.findByIdAndDelete(req.body.user_profile, (err) => {
    if(err){
      let errorMessage = req.flash("error", 'oops something went wrong');
      return res.status(400).json(errorMessage);
    }
  });
  User.findByIdAndDelete(req.body.user_id, (err) => {
    if(err){
      let errorMessage = req.flash("error", 'oops something went wrong');
      return res.status(400).json(errorMessage);
    }
  });
  
  
  let successDelete = {
    deleteResponse: true
  };
  let successMessage = req.flash("success", 'You have deleted your account 😞');
  return res.status(200).json(successDelete);
});//==========

//===== color pick functions =====  
function generateRandomColors(num){
  // make an array
  var arr = []
  // repeat num times
  for(var i = 0; i < num; i++){
      // get random color and push into arr
      arr.push(randomColor())
  }
  // return that array
  return arr;
}
function randomColor() {
  // pick a "red" fromm 0-255
  let r = Math.floor(Math.random() * 256);
  // pick a "green" fromm 0-255
  let g = Math.floor(Math.random() * 256);
  // pick a "blue" fromm 0-255
  let b = Math.floor(Math.random() * 256);
  return "rgb(" + r + ", " + g + ", " + b + ")";
}//==========


  module.exports = router;