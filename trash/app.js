
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var simpledb = require('mongoose-simpledb');

var db = simpledb.init('mongodb://localhost/blog');

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
}

/*
 * GET home page.
 */

app.get('/', function(req, res) {
    db.Users.findOne({ 'id': 'newUser' }, function (err, user) {
        if (err) return console.error(err);
        if (!user) return console.error(new Error("No document found."));
        res.render('postPage', { user: user, title: 'node mongodb 101' });
    });
});

app.post('/createUser', function (req, res) {
    db.Users.findById(req.param('_id'), function (err, user) {
        if (err) return console.error(err);
        if (!user) return res.send("Could not find user...");
        user.name.first = req.param('firstName');
        user.name.last = req.param('lastName');
        user.age = parseInt(req.param('age'));
        user.save();
        res.render('index', { user: user, title: user.name.full + ' saved!' });
    });
});

http.createServer(app).listen(process.env.PORT || 3000, function(){
  console.log('Express server listening on port 3000');
});
