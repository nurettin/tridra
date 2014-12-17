/**
 * Created by batuhancimen on 11/19/14.
 */

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/blog');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    var postSchema = mongoose.Schema({
        content: {title: String, paragraph: String},
        date: Date,
        author: String,
        views: Number,
        id: String
    });
    var postModel = mongoose.model('postModel', postSchema);
    var post = new postModel({
        content: {header: "Hello Guys!", paragraph: "this is my first blog paper!"},
        date: new Date(),
        id: 'firstpost'
    });
    post.save();
});