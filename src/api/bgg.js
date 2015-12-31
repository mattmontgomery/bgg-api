var request = require('request-promise');
var Promise = require('bluebird');
var queryString = require('query-string');
var apiBase = 'http://www.boardgamegeek.com/xmlapi2/';
var _ = require('lodash');
var parser = require('xml2json');
var bggApi = require('bgg')({
    timeout: 10000
});
var Backbone = require('backbone');

var ItemModel = Backbone.Model.extend({});

var bgg = {
    getCollection: function(username, params) {
        return Promise.all([
            bggApi('collection', {
                subtype: 'boardgame',
                excludesubtype: 'boardgameexpansion',
                username: username,
                stats: 1,
                version: 1
            }).then(this.parseCollection.bind(null, false)),
            bggApi('collection', {
                subtype: 'boardgameexpansion',
                username: username,
                stats: 1,
                version: 1
            }).then(this.parseCollection.bind(null, true)),
        ]).then(this.combineExpansions).then(this.sortCollection);
    },
    parseCollection: function(isExpansion, collection) {
        return new Promise(function(resolve, reject) {
            if (!(collection && collection.items && _.isArray(collection.items.item))) {
                reject();
            }
            resolve(_.map(collection.items.item, function(item) {
                var model = new ItemModel({
                    objectId: item.objectid,
                    collectionId: item.collid,
                    name: item.name.$t,
                    yearPublished: item.yearpublished,
                    image: item.image,
                    thumbnail: item.thumbnail,
                    minPlayers: item.stats.minplayers,
                    maxPlayers: item.stats.maxplayers,
                    minPlayTime: item.stats.minplaytime,
                    maxPlayTime: item.stats.maxplaytime,
                    numOwned: item.stats.numowned,
                    rating: parseFloat(item.stats.rating.value),
                    ratingAverage: parseFloat(item.stats.rating.average.value),
                    ratingBayesAverage: parseFloat(item.stats.rating.bayesaverage.value),
                    ratingStdDev: parseFloat(item.stats.rating.stddev.value),
                    status: item.status,
                    numPlays: item.numplays,
                    isExpansion: isExpansion

                });
                return model.attributes;
            }));
        });
    },
    combineExpansions: function(collections) {
        return  _.partial.apply(null, [_.union].concat(collections))();
    },
    sortCollection: function(collection) {
        return _.sortBy(collection, 'name');
    }
};

module.exports = bgg;
