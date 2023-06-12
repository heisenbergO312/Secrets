//jshint esversion:6
require('dotenv').config();
const ejs = require("ejs");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require('mongoose');
const encrypt=require('mongoose-encryption');
const bcrypt=require('bcrypt');
const saltrounds=10;


const app = express();  

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true});

const userSchema= new mongoose.Schema({
    email:String,
    password:String
  });

userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:['password']});

const User=mongoose.model("User",userSchema);


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/",function(req,res){
    res.render("home");
});

app.get("/register",function(req,res){
    res.render("register");
});

app.post("/register",function(req,res){
    bcrypt.hash(req.body.password, saltrounds, function(err, hash) {
        const newUser=new User({
            email:req.body.username,
            password:hash
        });
    
        newUser.save()
        .then(()=>{
            res.render("secrets");
        })
        .catch(function(err){
          res.send(err);
        });
    
        
    });
 
});


app.get("/submit",function(req,res){
    res.render("submit");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.post("/login",function(req,res){
    const username=req.body.username;
    const password=req.body.password;
    User.findOne({email:username})
    .then(function(foundUser){
        if(foundUser){
            if(foundUser.password===password){
                bcrypt.compare(password, foundUser.password, function(err, result) {
                  if(result===true){
                    res.render("secrets");
                  }
                });
            }
            else{
                console.log("wrong password");
                res.redirect("/login");
            }
        }
    })
    .catch(function(err){
        res.send(err);
    })
});

app.get("/logout",function(req,res){
    res.redirect("/");
})


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
