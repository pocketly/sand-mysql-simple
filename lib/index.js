/**
 * @author Adam Jaso <ajaso@pocketly.com>
 * @copyright 2014 Pocketly
 */

var SandGrain = require('sand-grain');

var mysqlSimple = SandGrain.extend({

  name: 'mysqlSimple',

  init: function(config, done) {
    this.super(config);

    this.log('Initializing models...');

    this.models = require('require-all')({
      dirname: this.config.modelsPath || sand.appPath + '/models',
      filter: /(.*)\.js$/i
    });

    done();

    return this;
  }

});

exports = module.exports = mysqlSimple;

exports.Model = require('./Model');
exports.Where = require('./Where');
exports.BufferedQuery = require('./BufferedQuery');
exports.Insert = require('./Insert');
exports.Util = require('./Util');