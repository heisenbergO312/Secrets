//jshint esversion:6
require('dotenv').config();
const ejs = require("ejs");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require('mongoose');
const session = require('express-session');
const passport=require('passport');
const passportLocalMongoose=require('passport-local-mongoose');

const app = express();  

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
    secret: 'Why so serious?',
    resave: false,
    saveUninitialized: false
  }));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true});
//mongoose.set("useCreateIndex");

const userSchema= new mongoose.Schema({
    email:String,
    password:String
  });

userSchema.plugin(passportLocalMongoose);


const User=mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
passport.deserializeUser(function(user, done) {
    done(null, user);
  });

app.get("/",function(req,res){
    res.render("home");
});

app.get("/register",function(req,res){
    res.render("register");
});


app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
       res.render("secrets");
    }
    else{
        res.redirect("/login");
    }
});

app.post("/register",function(req,res){
 User.register({username:req.body.username},req.body.password,function(err,user){
    if(err){
        console.log(err);
        res.redirect("/register");
    }
    else{
        passport.authenticate("local")(req,res,function(){
          res.redirect("/secrets"); 
        });
    }
 });
});


app.get("/submit",function(req,res){
    res.render("submit");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.post("/login",function(req,res){
    const user=new User({
        email:req.body.username,
        password:req.body.password
    });
    req.login(user,function(err){
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets"); 
            });
        }
    })
});

app.get("/logout",function(req,res){
    req.logout(function(err){
        if(err){
            console.log(err);
        }
    });
    res.redirect("/");
})


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
