/**
 * @author Adam Jaso <ajaso@pocketly.com>
 * @copyright 2014 Pocketly
 */

var sand = require('sand');
var SandGrain = require('sand-grain');

var mysqlSimple = SandGrain.extend({

  name: 'mysqlSimple',

  isSandGrain: true,

  init: function(config) {
    this.super(config);

    this.log('Initializing models...');

    this.models = require('require-all')({
      dirname: config.modelsPath || sand.appPath + '/models',
      filter: /(.*)\.js$/i
    });

    this.Model = require('./Model');

    return this;
  }

});

exports = module.exports = mysqlSimple;

exports.Model = require('./Model');