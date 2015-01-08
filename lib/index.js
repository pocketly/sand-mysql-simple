/**
 * @author Adam Jaso <ajaso@pocketly.com>
 * @copyright 2014 Pocketly
 */

var SandGrain = require('sand-grain');
var _ = require('lodash');

var mysqlSimple = SandGrain.extend({

  name: 'mysqlSimple',

  construct: function() {
    this.super();
    this.defaultConfig = require('./default');
    this.version = require('../package').version;
  },

  init: function(config, done) {
    this.super(config);

    this.models = {};
    var models = require('require-all')({
      dirname: sand.appPath + (this.config.modelsPath || '/models'),
      filter: /(.*)\.js$/i,
      resolve: function (model) {
        return model(this.models, this);
      }.bind(this)
    });

    _.each(models, function(val, name) {
      this.models[name] = val;
    }, this);

    done();

    return this;
  }

});

exports = module.exports = mysqlSimple;

exports.Model = require('./Model');
exports.Util = require('./Util');