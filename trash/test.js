/**
 * Created by batuhancimen on 11/20/14.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var app = express();

var url = 'mongodb://localhost:27017/myproject';

MongoClient.connect(url, function(err, db) {
    if (err) return console.error(err);
    if (!db) return console.error(new Error('Db not found!!'));
    console.log("Connected correctly to server");
    var collection = db.collection('documents');
    collection.findOne({ id : '1'} , function (err, documents) {
        if (err) return console.error(err);
        if (!documents) return console.error(new Error("'Documents' not found."));
        var documents = {
            content: {title: 'second', paragraph: 'asdasd'},
            author: 'Tyrael',
            views: 0,
            date : new Date()

        };
        collection.insert( documents , function () {
            console.log('Inserted objects in to the documents collection.')
        });
    });
});






