/**
 * Created by batuhancimen on 11/24/14.
 */
/**
 * Created by batuhancimen on 11/19/14.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose').model('posts');
// var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/blog';
var fs = require('fs');

// var simpledb = require('mongoose-simpledb');

// var db = simpledb.init();

var app = express();

// all environments
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
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
    mongoose.connect(url);

}

// load all files in models dir
fs.readdirSync(__dirname + '/models').forEach(function () {
    if(~filename.indexOf('.js')) require(__dirname + '/models/' + filename)
});


/*
 * GET home page.
 */

app.get('/api' , function (req , res) {
       mongoose.model('posts').find(function (err, posts) {
           res.send(posts);
       });
});



http.createServer(app).listen(process.env.PORT || 3000, function(){
    console.log('Express server listening on port 3000');
});