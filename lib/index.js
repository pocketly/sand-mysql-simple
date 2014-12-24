/**
 * @author Adam Jaso <ajaso@pocketly.com>
 * @copyright 2014 Pocketly
 */

var SandGrain = require('sand-grain');

var mysqlSimple = SandGrain.extend({

  name: 'mysqlSimple',

  init: function(config, done) {
    this.super(config);

    done();

    return this;
  }

});

exports = module.exports = mysqlSimple;

exports.Where = require('./Where');
exports.Insert = require('./Insert');
exports.Update = require('./Update');
exports.Util = require('./Util');
exports.Select = require('./Select');
exports.Delete = require('./Delete');