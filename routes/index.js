const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const middleWare = require("../middleware/loginMiddleWare");
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const async = require("async");
const nodemailer = require("nodemailer");
const crypto = require("crypto");


  
  router.get("/blogs/login", (req, res) => {
    res.render("login");
  });
  // ===== login route =====
  router.post("/blogs/login",passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/blogs/login"
  }), (req, res) => {
    
    const redirectUrl = req.session.returnTo || '/blogs';
    
    delete req.session.returnTo;
    User.findById(req.user, (err, user)=>{
      if(err){
        req.flash("error", 'oh no we cant find what you are looking for, try again later \u{1F61E}');
        return res.redirect("back");
      }
      if(user.profileRegistered === false){
        req.flash("error", 'Welcome back, please create profile before continuing')
        return res.redirect("/blogs/register-profile");
      }
      
      req.flash("success", 'Welcome back \u{1F60A}')
      return res.redirect(redirectUrl);
    })
    
  });
  // ===== register routes =====
  router.get("/blogs/register", (req, res) => {
    res.render("register")
  });
  router.post("/blogs/register", (req,res) => {
    req.body.username
    req.body.passbody
    let profileRegistered = false;
    User.register(new User({name: req.body.name, email: req.body.email, profileRegistered: profileRegistered, username: req.body.username}), req.body.password, (err, user) => {
      if(err) {
       
        
        if(err.keyPattern){
          req.flash("error", 'A user with the given email is already registered')
          return res.redirect("back");
        }
        if(err.name === "UserExistsError"){
          req.flash("error", err.message)
        return res.redirect("back");
        }
        
      }passport.authenticate("local")(req, res, () => {
        return res.redirect("/blogs/register-profile");
      });
    });
  });
  // logout route
  router.get("/blogs/logout", (req, res) => {    
    req.logout();
    req.flash("success", 'You have been logged out!')
    
    return res.redirect("/blogs")    
  });
  //change user settings
  router.put("/blogs/changeuser", middleWare.isLoggedIn, (req, res) => {
    let user = {
      name: req.body.name,
      email: req.body.email,
      username: req.body.username
    };
    User.findByIdAndUpdate(req.user.id, user, (err,updateduser) => {
      if(err){
        if(err.keyPattern.username){
          req.flash("error", 'Username exists already!');
          return res.redirect("back");
        }
        if(err.keyPattern.email){
          req.flash("error", 'User with email already exists!')
          return res.redirect("back");
        }        
        req.flash("error", 'Could not update user profile')
        return res.redirect("back")
      }
      req.flash("success", 'Updated User Profile!')
     return res.redirect("/blogs")
    })
    // res.redirect("back");
  });//======
  //change passsword or reset password 
  router.post('/blogs/changepassword', function(req, res, next){
    User.findById(req.user.id, (err, user) => {
      if(err){
        req.flash("error", 'oh no something went wrong, try again later.')
        return res.redirect("back");
      }
      user.changePassword(req.body.oldPassword, req.body.newPassword, (err, changedPassword) => {
        if(err){
          req.flash("error", err.message)
          return res.redirect('back');
        }
        req.flash("success", 'You have changed your password.🙂 ')
        return res.redirect('back');
      })
    })    
  });
  //===== email reset password =====
  router.get('/forgotpassword', function(req, res) {
    res.render('forgot');
  });
  //===== post email route =====
  router.post('/forgotpassword', function(req, res, next) {
    async.waterfall([
      function(done) {
        // token creation to be sent to user email
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      //===== finds email giving =====
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgotpassword');
          }
          //===== save token to user =====
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      //===== send token using email giving =====
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: process.env.GMAIL_NAME,
            pass: process.env.GMAIL_SECRET
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'dev.me.message@gmail.com',
          subject: 'dev.me Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/forgotpassword');
    });
  });//==========
  //===== token reset route =====
  router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgotpassword');
      }
      res.render('reset', {token: req.params.token});
    });
  }); 
  //===== reset password =====
  router.post('/reset/:token', function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
          }
          if(req.body.password === req.body.confirm) {
            user.setPassword(req.body.password, function(err) {
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;
  
              user.save(function(err) {
                req.logIn(user, function(err) {
                  done(err, user);
                });
              });
            })
          } else {
              req.flash("error", "Passwords do not match.");
              return res.redirect('back');
          }
        });
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: process.env.GMAIL_NAME,
            pass: process.env.GMAIL_SECRET
          }
        });
        var mailOptions = {
          to: user.email,
          from: process.env.GMAIL_NAME,
          subject: 'Your password has been changed',
          text: `Hello, ${user.name}\n\nThis is a confirmation that the password for your dev.me account ${user.email} has just been changed.\n`
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], function(err) {
      res.redirect('/blogs');
    });
  });
  router.get("/notfound", (req, res) => {
    res.render("errorPages/notFound");
  })

  module.exports = router; 