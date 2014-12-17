var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId;

mongoose.connect('mongodb://localhost:27017/blog');

var postsSchema = new Schema({
    content: {title: String, paragraph: String},
    date: Date,
    author: String,
    views: Number,
    user: ObjectId
});

mongoose.model('posts', postsSchema);


