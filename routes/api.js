var express = require('express');
var router = express.Router();
var request = require('request');
var bgg = require('../src/api/bgg');
var _ = require('lodash');
/* GET home page. */

router.get('/', function(req, res) {
    res.json({
        version: '1.0.0'
    });
})

router.get('/collection/:user', function(req, res) {
    var collection = bgg.getCollection(req.params.user);
    collection.then(function(collection) {
        collection = (collection && collection.items && _.isArray(collection.items.item)) ? collection.items.item : collection;
        res.set({
            'Access-Control-Allow-Origin': '*'
        }).json({
            requestedUser: req.params.user,
            collection: collection
        });
    });
});

module.exports = router;
