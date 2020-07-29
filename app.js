//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

console.log(process.env.API_KEY);

app.use((express.static("public")));
app.set('view engine','ejs');
// Note "view engine" not "view-engine" (there is space in between)
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});

// For encypting the userSchema we declare it like this - new mongoose.Schema({});
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// Key to decrypt is an environment variable

// Adding plugin to schema, where we pass secret key and fields to be encrypted as Javascript Object.
// Additional info: the "encrypt" passed inside the plugin is from top. where we required the packege and stored in variable "encrypt"
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

// Model should come after above steps !! MUSTT
const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save(function(err){
        if(!err){
            res.render("secrets");
        } else{
            console.log(err);
        }
    });
});

app.post("/login", function(req, res){
    
    const userName = req.body.username;
    const password = req.body.password;
    User.findOne(
        {email: userName},
        function(err, foundUser){
            if(!err){
                if(foundUser){
                    if(foundUser.password === password){
                        res.render("secrets")
                    }
                }
            } else{
                console.log(err);
            }
        }
    );
});

app.listen(3000, function(req, res){
    console.log("Server started at port 3000");
});