/**
 * Created by batuhancimen on 12/1/14.
 */
/**
 * Created by batuhancimen on 11/19/14.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

var passport = require('passport');
var passportLocal = require('passport-local');
var passportHttp = require('passport-http');

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/blog';

var moment = require('moment');

// var simpledb = require('mongoose-simpledb');

// var db = simpledb.init();

var app = express();

// all environments
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon( __dirname + '/public/images/dragon-head.ico'));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname)));
app.use(bodyParser.urlencoded({extended : false}));
app.use(cookieParser());
app.use(expressSession({
    secret: process.env.SESSION_SECRET || "secret",
    resave : false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

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
 * GET home page.
 */
app.get('/' , function (req, res) {
            res.render('homePage', {title: "TriDraLog"  });
});

//app.get('/deneme' , function (req, res) {
//    MongoClient.connect(url, function (err, db) {
//        if (!db) return console.error(new Error("Db not found!! 1."));
//        var collection = db.collection('blog');
//        collection.find({}).toArray(function (err, docs) {
//            if (err) return console.error(err);
//            if (!db) return console.error(new Error("Db not found!! 2."));
//            console.log("Found the following records");
//            res.render('deneme', {title: "TriDraLog" , values : docs });
//        });
//    });
//});

app.get('/login' , function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (!db) return console.error(new Error("Db not found!! 1."));
        var collection = db.collection('users');
        collection.find({}).toArray(function (err, docs) {
            if (err) return console.error(err);
            if (!db) return console.error(new Error("Db not found!! 2."));
            console.log("Found the following records");
            res.render('login', {title: "TriDraLog" , values : docs });
        });
    });
});

app.get('/signup' , function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (!db) return console.error(new Error("Db not found!! 1."));
        var collection = db.collection('users');
        collection.find({}).toArray(function (err, docs) {
            if (err) return console.error(err);
            if (!db) return console.error(new Error("Db not found!! 2."));
            console.log("Found the following records");
            res.render('singup', {title: "TriDraLog" , values : docs });
        });
    });
});

app.post('/signup/register', function (req, res) {
    console.log('registered!');
    MongoClient.connect(url, function(err, db) {
        if (err) return console.error(err);
        if (!db) return console.error(new Error('Db not found!!'));
        console.log("Connected correctly to server");
        var collection = db.collection('users');
        var documents = {
            user_email : req.param('user_email') ,
            user_password: req.param('user_password'),
            user_name: req.param('user_name'),
            user_surname : req.param('user_surname'),
            user_date : req.param('date')
        };
        collection.insert( documents , function () {
            console.log('Inserted objects in to the documents collection.');
            res.redirect('/');
        });
    });
});

app.post('/login/account_login' , function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (!db) return console.error(new Error("Db not found!! 1."));
        var collection = db.collection('users');
        collection.find({user_email: req.param("user_email")}).toArray(function (err, docs) {
                if(!docs[0]) return res.send("I guess you didnt signup yet :(");
                if(docs[0].user_password === req.param("user_password")){
                    res.redirect('/account/'+ docs[0]._id );
                }
                else { res.send("Wrong password!"); }
            }
        );
    });
});

app.get('/account/:_id' , function (req, res) {
    console.log(req.param("_id"));
    MongoClient.connect(url, function (err, db) {
        if (!db) return console.error(new Error("Db not found!! 1."));
        var collection = db.collection('posts');
        collection.find({user_id: req.param("_id")}).toArray(function (err , docs) {
            console.log(docs);
            res.render('accountPage', {title: "TriDraLog" , values : docs  , user_id : req.param("_id")});
        });
    });
});


app.get('/postPage' , function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (!db) return console.error(new Error("Db not found!! 1."));
        var collection = db.collection('blog');
        collection.find({}).toArray(function (err, docs) {
            if (err) return console.error(err);
            if (!db) return console.error(new Error("Db not found!! 2."));
            console.log("Found the following records");
            res.render('postPage', {title: "New Blog Site!!!" , values : docs });
        });
    });
});

app.get('/newPost/:_id' , function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (!db) return console.error(new Error("Db not found!! 1."));
        var collection = db.collection('users');
        collection.find({_id: mongodb.ObjectID(req.param("_id"))}).toArray(function (err , docs) {
            console.log(docs);
            res.render('newPost', {title: "New Post!" , values : docs , user_id : docs[0]._id });
        });
    });
});


 app.get('/edit/:_id' , function (req, res) {
 console.log(req.param("_id"));
 MongoClient.connect(url, function (err, db) {
 if (!db) return console.error(new Error("Db not found!! 1."));
 var collection = db.collection('posts');
 collection.find({_id: mongodb.ObjectID(req.param("_id"))}).toArray(function (err , docs) {
 console.log(docs);
 res.render('editPost', {title: "Edit Your Post!" , values : docs , user_id : docs[0].user_id , post_id : docs[0]._id});
 });
 });
 });


 app.put('/edit/save' , function (req,res) {
 MongoClient.connect(url, function (err, db) {
 if (!db) return console.error(new Error("Db not found!! 1."));
 var collection = db.collection('posts');

     collection.update(
        {_id : mongodb.ObjectID(req.param("post_id"))},
     {
         user_id: req.param("user_id"),
        title: req.param("title"),
        paragraph: req.param("paragraph"),
        date: moment().calendar()
        },
     {
       upsert: true,
      multi: false
      }, function () {
             var user_id = (req.param('user_id'));
     res.redirect('/account/'+user_id);
     }
      );
    });
 });
 /*
 /collection.find({ _id : mongodb.ObjectID(req.param("_id")) }).toArray(function (err, docs) {
 if (err) return console.error(err);
 if (!db) return console.error(new Error("Db not found!! 2."));
 collection.update(docs, datas , {});
 console.log(docs[0].author);
 console.log(docs[0].content.title);
 console.log(docs);
 res.render('editPost', {title: "Edit Your Post!" , values : docs });
 });
 });
 });
 docs[0].author = req.param('author');
 docs[0].content.title = req.param('title');
 docs[0].author = req.param('paragraph');
 docs[0].author = req.param('date');

 */


app.post('/postMessage/:_id', function (req, res) {
    console.log(req.param("user_id"));
    MongoClient.connect(url, function (err, db) {
        if (!db) return console.error(new Error("Db not found!! 1."));
        var collection = db.collection('posts');
            var document = {
                user_id : req.param("user_id"),
                title: req.param("title"),
                paragraph: req.param("paragraph"),
                date: moment().calendar()
            };
            collection.insert(document , function () {
                var redirect = req.param("user_id");
                res.redirect('/account/'+redirect );
            });
    });
});


 app.delete('/postDelete/:_id' , function (req, res) {
     MongoClient.connect(url, function (err, db) {
     if (!db) return console.error(new Error("Db not found!! 1."));
     var collection = db.collection('posts');
         collection.remove(
         { _id : mongodb.ObjectID(req.param("_id"))},
         {
         justOne : true
         }
         , function (err , rmv) {
         if (err) return console.error(err);
         console.log("Removed these files ", rmv);
                 var redirect = req.param("user_id");
                 res.redirect('/account/'+redirect );
         });
     });
 });

http.createServer(app).listen(process.env.PORT || 3000,"127.0.0.1", function(){
    console.log('Express server listening on port 3000');
});