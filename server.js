/**
 * Created by batuhancimen on 11/19/14.
 */

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

var http = require('http');
var path = require('path');

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/blog';

var passport = require('passport');
var passportLocal = require('passport-local');
var passportHttp = require('passport-http');

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

app.use(function (req, res, next) {
    var bob = req.url.split("/");
    if (bob.length > 2) { return next() }
    var username = bob[1];
    var routes = ["login","signup","panel","loginError","logout",""];

    if (routes.indexOf(username) >= 0) { return next() }

    MongoClient.connect(url, function (err, db) {
        if (!db) return console.error(new Error("Db not found!! 1."));
        var collectionPosts = db.collection('posts');
        var collectionUsers = db.collection('users');
        var user = req.user;
        var isAuthenticated = false;
        if (req.isAuthenticated()) {if(user.username === username ) { isAuthenticated = true; }}
        collectionUsers.find({username: username}).toArray(function (err , docs) {
            if( docs.length === 0 ) { return res.send('no such user as ' + username + ' exists')}
            collectionPosts.find({username: username , published: true}).toArray(function (err , docs) {
                res.render('index', {
                    title: "tridra " + username,
                    values: docs,
                    username: username,
                    isAuthenticated: isAuthenticated
                });
            });
        });
    });
});

app.use(function (req, res, next) {
    var bob = req.url.split("/");
    if (bob.length === 3 ) {
        var post_id = bob[2];
        var username = bob[1];
        var routes = ["publish","unpublish","user","newPost","editPost","edit","panel","postDelete"];

        if (routes.indexOf(username) >= 0) { return next() }

        MongoClient.connect(url, function (err, db) {
            if (!db) return console.error(new Error("Db not found!! 1."));
            var collection = db.collection('posts');
            if (post_id.length !== 24) return res.send('there are no posts such as ' + post_id);
            collection.find({_id: mongodb.ObjectID(post_id)}).toArray(function (err, docs) {
                if (docs.length === 0) return res.send('there are no posts such as ' + post_id);
                console.log(docs)
                res.render('postPage', {username: username, values: docs})
            })
        });
    }
    else { return next() }
});

passport.use(new passportLocal.Strategy(function (username, password, done) {
    MongoClient.connect(url, function (err, db) {
        var collection = db.collection("users");
        collection.findOne({username : username } , function (err, user) {
            if (err) { return console.log("error"); }
            if (!user) { return done(null , false);  }
            if (user.password !== password) { return done(null , false); }
            done(null, user);
        });
    });
}));
passport.serializeUser(function (user, done ) {
    done(null , user._id);

});
passport.deserializeUser(function (id, done ) {
    MongoClient.connect(url, function (err, db) {
        var collection = db.collection("users");
        collection.findOne({_id : mongodb.ObjectID(id)} , function (err, user) {
            done( null , user );
        } );
    });
});

/*
 * GET home page.
 */


app.get('/' , function (req, res) {
    if (req.isAuthenticated()){
        res.redirect('/panel')
    }
    else { res.render('homePage') }
});
app.get('/login' , function (req, res) {
     res.render('login', {title: "tridra login"});
});
app.get('/loginError' , function (req, res) {
    res.render('loginError', {title: "tridra login"});
});
app.post("/login", passport.authenticate('local' , { successRedirect: '/panel',
    failureRedirect: '/loginError' }) , function (req, res) {
});

app.get("/logout" , function (req, res) {
    req.logout();
    res.redirect("/");
});

app.get('/user/:username', function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (!db) return console.error(new Error("Db not found!! 1."));
        var collectionPosts = db.collection('posts');
        var collectionUsers = db.collection('users');
        var user = req.user;
        var isAuthenticated = false;
        if (req.isAuthenticated()) {if(user.username === req.param("username")) { isAuthenticated = true; }}
        collectionUsers.find({username: req.param('username')}).toArray(function (err , docs) {
            if( docs.length === 0 ) { return res.send('there is no user such as ' + req.param('username'))}
            collectionPosts.find({username: req.param('username') , published: true}).toArray(function (err , docs) {
                    res.render('index', {
                        title: "tridra " + req.param('username'),
                        values: docs,
                        username: req.param('username'),
                        isAuthenticated: isAuthenticated
                    });
            });
        });
    });
});

app.get('/panel', function (req, res) {
    if(!req.isAuthenticated()){ return res.redirect('/'); }
    MongoClient.connect(url, function (err, db) {
        if (!db) return console.error(new Error("Db not found!! 1."));
        var collection = db.collection('posts');
        var user = req.user;
        var published = [];
        var notpublished = [];
        collection.find({user_id : user._id}).toArray(function (err, docs) {
            for (var i = 0 ; i < docs.length ; i++){
                if(docs[i].published) { published.push(docs[i]) }
                else { notpublished.push(docs[i]) }
            }
            res.render('adminPanel', { title: "tridra "+user.username , published : published , notpublished : notpublished  , user_id : user._id , username: user.username , user_name : user.name , user_surname : user.surname });
        });
    });
});

app.get('/panel/newPost' , function (req, res) {
    var user = req.user;
    res.render('newPost' , { user_id : user._id , username : user.username });
});
app.post('/panel/newPost', function (req, res) {
    MongoClient.connect(url , function (err, db) {
        var collection = db.collection('posts');
        var user = req.user;
        var document = {
            username : user.username,
            user_id : user._id,
            date : moment().calendar(),
            published: false,
            title: req.param('title'),
            paragraph : req.param('paragraph')
        };
        collection.insert(document , function () {
            console.log('Inserted new documents');
            res.redirect('/panel');
        })
    })
});

app.get('/panel/editPost/:_id' , function (req, res) {
    MongoClient.connect(url, function (err, db) {
        var collection = db.collection('posts');
        collection.find({ _id : mongodb.ObjectID(req.param("_id"))}).toArray(function (err, docs) {
            res.render('editPost' , {title: "Edit Post!" , values : docs  , post_id : docs[0]._id });
        });
    });
});

app.post('/edit/save' , function (req,res) {
    MongoClient.connect(url, function (err, db) {
        if (!db) return console.error(new Error("Db not found!! 1."));
        var collection = db.collection('posts');
        var user = req.user;
        collection.update(
            {_id : mongodb.ObjectID(req.param("post_id"))},
            {
                username : user.username,
                user_id : user._id,
                date : moment().calendar(),
                published: false,
                title: req.param('title'),
                paragraph : req.param('paragraph')
            },
            {
                upsert: true,
                multi: false
            }, function () {
                res.redirect('/panel');
            }
        );
    });
});
app.post('/edit/publish' , function (req,res) {
    MongoClient.connect(url, function (err, db) {
        if (!db) return console.error(new Error("Db not found!! 1."));
        var collection = db.collection('posts');
        var user = req.user;
        collection.update(
            {_id : mongodb.ObjectID(req.param("post_id"))},
            {
                username : user.username,
                user_id : user._id,
                date : moment().calendar(),
                published: true,
                title: req.param('title'),
                paragraph : req.param('paragraph')
            },
            {
                upsert: true,
                multi: false
            }, function () {
                res.redirect('/panel');
            }
        );
    });
});

app.post('/publish/:post_id' , function (req,res) {
    MongoClient.connect(url, function (err, db) {
        if (!db) return console.error(new Error("Db not found!! 1."));
        var collection = db.collection('posts');
        collection.find({_id : mongodb.ObjectID(req.param("post_id"))}).toArray(function (err , docs) {
            collection.update(
                {_id : mongodb.ObjectID(req.param("post_id"))},
                {
                    username : docs[0].username,
                    user_id : docs[0].user_id,
                    date : docs[0].date,
                    published: true,
                    title: docs[0].title,
                    paragraph : docs[0].paragraph
                },
                {
                    upsert: true,
                    multi: false
                }, function () {
                    res.redirect('/panel');
                }
            );
        })
    });
});

app.post('/unpublish/:post_id' , function (req,res) {
    MongoClient.connect(url, function (err, db) {
        if (!db) return console.error(new Error("Db not found!! 1."));
        var collection = db.collection('posts');
        collection.find({_id : mongodb.ObjectID(req.param("post_id"))}).toArray(function (err , docs) {
            collection.update(
                {_id : mongodb.ObjectID(req.param("post_id"))},
                {
                    username : docs[0].username,
                    user_id : docs[0].user_id,
                    date : docs[0].date,
                    published: false,
                    title: docs[0].title,
                    paragraph : docs[0].paragraph
                },
                {
                    upsert: true,
                    multi: false
                }, function () {
                    res.redirect('/panel');
                }
            );
        })
    });
});

app.post('/postDelete/:post_id' , function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (!db) return console.error(new Error("Db not found!! 1."));
        var collection = db.collection('posts');
        collection.remove(
            { _id : mongodb.ObjectID(req.param("post_id"))},
            {
                justOne : true
            }
            , function () {
                res.redirect('/panel');
            });
    });
});

app.get('/signup' , function (req, res) {
    res.render('signup', { title: "tridra signup" });
});

app.post('/signup', function (req, res) {
    console.log(req.param('username') + ' registered!');
    MongoClient.connect(url, function(err, db) {
        if (!db) return console.error(new Error('Db not found!!'));
        var collection = db.collection('users');
        collection.find({ username : req.param('username')}).toArray(function (err, docs) {
            if(docs.length > 0){ return res.send('username already exist') }
            else {
                var documents = {
                    username: req.param('username'),
                    email: req.param('email'),
                    password: req.param('password'),
                    name: req.param('name'),
                    surname: req.param('surname'),
                    date: req.param('date')
                };
                collection.insert(documents, function () {
                    console.log('Inserted objects in to the documents collection.');
                    res.redirect('/login');
                });
            }
        });

    });
});


http.createServer(app).listen(process.env.PORT || 4242, function(){
    console.log('Express server started on port', process.env.PORT);
});
