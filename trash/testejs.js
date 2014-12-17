/**
 * Created by batuhancimen on 11/24/14.
 */
/**
 * Created by batuhancimen on 11/19/14.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/blog';

// var simpledb = require('mongoose-simpledb');

// var db = simpledb.init();

var app = express();

// all environments
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/edit/:id')

/*
 * GET home page.
 */
app.get('/' , function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (!db) return console.error(new Error("Db not found!! 1."));
        var collection = db.collection('blog');
        collection.find({}).toArray(function (err, docs) {
            if (err) return console.error(err);
            if (!db) return console.error(new Error("Db not found!! 2."));
            console.log("Found the following records");
            console.dir(docs);
            res.render('index', {title: "New Blog Site!!!" , values : docs });
        });
    });
});

app.post('/postMessage', function (req, res) {
    MongoClient.connect(url, function(err, db) {
        if (err) return console.error(err);
        if (!db) return console.error(new Error('Db not found!!'));
        console.log("Connected correctly to server");
        var collection = db.collection('blog');
        var documents = {
            content: {title: req.param('title'), paragraph: req.param('paragraph')},
            author: req.param('author'),
            views: 0,
            date : req.param('date')
        };
        collection.insert( documents , function () {
            console.log('Inserted objects in to the documents collection.');
            res.redirect('/');
        });
    });
});

http.createServer(app).listen(process.env.PORT || 2000, function(){
    console.log('Express server listening on port 2000');
});