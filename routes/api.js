var express = require('express');
var cache = require('express-redis-cache')({
    expire: {
        200: 120,
        500: 5
    }
});
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

router.get(
    '/collection/:user',
    function(req, res, next) {
        res.set({'Access-Control-Allow-Origin':'*'});
        next();
    },
    cache.route(),
    function(req, res) {
        var collection = bgg.getCollection(req.params.user);
        collection.then(function(collection) {
            collection = (collection && collection.items && _.isArray(collection.items.item)) ? collection.items.item : collection;
            res.json({
                requestedUser: req.params.user,
                collection: collection
            });
        }).catch(function(err) {
            res.status(500);
            res.json({
                requestedUser: req.params.user,
                collection: [],
                error: 'Collection not found'
            });
        });
    });

module.exports = router;
