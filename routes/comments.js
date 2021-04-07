const express = require("express");
const router = express.Router();
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const Profile = require("../models/profile");
const middleWare = require("../middleware/loginMiddleWare");

//comment route 
router.post("/blogs/:id/comments", middleWare.isLoggedIn, (req, res) => {
    // blog lookup
    
    Blog.findById(req.params.id, (err, blog) => {
      if (err) {
        return res.status(400).send('error');
      } else {
        // create comments
        Comment.create(req.body.comment, (err, comment) => {
          if (err) {
            return res.status(400).send('error');
          } else {
            // adds username and id to comment
            
            comment.profile = req.user.profile[0];
            comment.url.address = "/blogs/" + blog._id ;
            comment.url.title = blog.title;
            comment.author.id = req.user._id;
            comment.author.username = req.user.username;
            // saves comment
            comment.save();
            blog.comments.push(comment);
            blog.save();
            Profile.findById(req.user.profile, (err, foundProfile) => {
                if(err) {
                  return res.status(400).send('error');
                }else {
                    foundProfile.comments.push(comment);
                    foundProfile.save();
                }
            })
            let successResponse = req.flash("success", "Comment Added.")
            return res.status(200).json(successResponse);
          }
        });
      }
    });
  });
  //===== comment replies =====
    router.post("/blogs/:id/comments/:commentId",  middleWare.isLoggedIn, (req, res) => {
      Comment.findById(req.params.commentId, (err, comment) => {
        if(err){
          return res.status(400).send('error');
        }
        let reply = {
          text: req.body.commentReply,
          profile: req.user.profile[0],
          url: {
            address: "/blogs/" + req.params.id
          },
          author: {
            id: req.user._id,
            username: req.user.username
          }
        }
        comment.replies.push(reply);
        comment.save();
        let successResponse = req.flash("success", "Reply Added.")
        return res.status(200).json(successResponse);
      })
    })//=====
  //===== update route for comment =====
  router.put("/blogs/:id/comments/:comment_id", middleWare.checkCommentOwner, (req, res) => {
  
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
      if(err){
        return res.status(400).send('error');
      }else {
        let successResponse = req.flash("success", "Comment updated.")
        return res.status(200).json(successResponse);
      }
    })
  });//==========
  //===== update comment reply =====
  router.put("/blogs/:id/:comment_id/:reply_id", middleWare.isLoggedIn, (req, res) => {
        Comment.findById(req.params.comment_id, (err, comment) => {
          if(err){
            return res.status(400).send('error');
          }
          var rep = comment.replies;
          for(var i = 0; i < rep.length; i++){
            
            if(rep[i]._id == req.params.reply_id){
              if(rep[i].author.username === req.user.username){

                saveReply();
              }else{
                errorRedirect()
              }
            }
          }
          function saveReply(){
              rep[i].text = req.body.comment.text;
              comment.save();
              redirect();
          }
          function redirect(){
            let successResponse = req.flash("success", "Comment updated.")
            return res.status(200).json(successResponse);
          }
          function errorRedirect(){
            return res.status(400).send('error');
          }
        })
        
      
  });//==========
  //===== delete route for comment =====
  router.delete("/blogs/:blog_id/comments/:comment_id", middleWare.checkCommentOwner, (req, res) => {
    // find comment in ref array and removes it
    let c_id = req.params.comment_id;
    Profile.findByIdAndUpdate(req.user.profile, {$pull: {"comments": c_id}}, { safe: true, multi:true }, function(err, comment){
      if(err){
        return res.status(400).send('error');
      }
    })
    Blog.findByIdAndUpdate(req.params.blog_id, {$pull: {"comments": c_id}}, { safe: true, multi:true }, (err, comment) => {
      if(err){
        return res.status(400).send('error');
      }
    })
    // deletes comment
    Comment.findByIdAndRemove(req.params.comment_id, (err) => {
      if(err){
        return res.status(400).send('error');
      }
      let deleteResponse = req.flash("success", 'Comment has been deleted');
      // res.set('Content-type', 'text/plain', deleteResponse)
      return res.status(200).json(deleteResponse);
      // return res.send(deleteResponse);
    })
  });
  //===== delete reply =====
  router.put("/comments/:comment_id/reply/:reply_id", middleWare.isLoggedIn, (req, res) => {
    Comment.findById(req.params.comment_id, (err, comment) => {
      if(!err){
        if(!comment){
          res.status(404).send('comment was not found');
        }
      else {
        comment.replies.id(req.params.reply_id).remove();
        comment.markModified('replies');
        comment.save(function(saveerr, saveresult) {
          if(!saveerr) {
            let deleteMessage = req.flash("success", 'Reply deleted.')
            return res.status(200).json(deleteMessage);
          }else {
            return res.status(400).send(saveerr.message);
          }
        });
      }
    } else {
      return res.status(400).send(err.message);
      }
    });
});//==========

  module.exports = router;  