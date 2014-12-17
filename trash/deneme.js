var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

var path = require('path');
var http = require('http');

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/passport';

var passport = require('passport');
var passportLocal = require('passport-local');
var passportHttp = require('passport-http');

// var simpledb = require('mongoose-simpledb');

// var db = simpledb.init();

var app = express();

// all environments
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({extended : false}));
app.use(cookieParser());
app.use(expressSession({
    secret: process.env.SESSION_SECRET || "secret",
    resave : false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new passportLocal.Strategy(function (username, password, done) {
    MongoClient.connect(url, function (err, db) {
        var collection = db.collection("passport");
        collection.findOne({username : username } , function (err, user) {
            if (err) { return console.log("error"); }
            if (!user) { return console.log("user not found");  }
            if (user.password !== password) { return console.log("password errror"); }
            done(null, user);
            //if (err) { return done(err); }
            //if (!user) { return done(null, false); }
            //if (!user.verifyPassword(password)) { return done(null, false); }
            //return done(null, user);
        });
    });
}));
/*
done(null , user);
done(null , null);
done(new Error('ouch!')); */

app.use(express.favicon( __dirname + '/public/images/dragon-head.ico'));


passport.serializeUser(function (user, done ) {
    done(null , user._id);

});
passport.deserializeUser(function (id, done ) {
    MongoClient.connect(url, function (err, db) {
        var collection = db.collection("passport");
        collection.findOne({_id : mongodb.ObjectID(id)} , function (err, user) {
            done( null , user );
        } );
    });
});
/*
 * GET home page.
 */
app.get('/' , function (req, res) {
    res.render('homePage', {
        isAuthenticated: req.isAuthenticated(),
        user: req.user
    });
});

app.get("/login" , function (req, res) {
    res.render("bob");
});

app.post("/login", passport.authenticate('local') , function (req, res) {
    res.redirect('/');
});

//app.post("/login", passport.authenticate('local' , {
//    failureRedirect: '/login',
//    successRedirect: '/user'
//}));
app.get("/logout" , function (req, res) {
    req.logout();
    res.redirect("/");
});



var port = process.env.PORT || 1337;
app.listen(port , function () {
    console.log("Listening on port 1337 for passport");
});
