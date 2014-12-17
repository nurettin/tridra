/**
 * Created by batuhancimen on 11/21/14.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');
var app = express();

var url = 'mongodb://localhost:27017/myproject';

MongoClient.connect(url, function(err, db) {
    if (err) return console.error(err);
    if (!db) return console.error(new Error('Document not found!!'));
    console.log("Connected correctly to server");
    var collection = db.collection('documents');
    collection.insert([
        {
            content: {title: 'first', paragraph: 'asdasd'},
            author: 'a',
            views: 13,
            id: 1
        }
    ], function () {
        console.log('Inserted 3 objects in to the documents collection.')
    });
});