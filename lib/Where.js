/**
 * @author Adam Jaso <ajaso@pocketly.com>
 * @copyright 2014 Pocketly
 */

var _ = require('lodash');
var Util = require('./Util');

function Where(values, joinBy) {

  this.conditions = [];
  this.values = [];

  if (_.isPlainObject(values)) {
    this.appendsOp(values);
    joinBy = joinBy || 'AND';
  } else {
    joinBy = values;
  }
  this.joinBy = joinBy || 'AND';
}

Where.prototype.append = function(condition, value) {

  if (condition instanceof Where) {
    var nested = _.isUndefined(value) ? true : value;
    value = condition.values;

    condition = !nested ? condition.build() : '(' + condition.build() + ')';
  }

  if (condition && !_.isUndefined(value)) {
    this.conditions.push(condition);
    this._appendValues(value);
  } else {
    sand.log('invalid condition or value', condition, value);
  }

  return this;
};

Where.prototype.appendOp = function(column, value, op) {
  op = op || '=';
  return this.append('`' + Util.removeTicks(column) + '` ' + op + ' ?', value);
};

Where.prototype.appendsOp = function(values) {
  _.each(values, function(val, key) {
    this.appendOp(key, val);
  }.bind(this));
  return this;
};

Where.prototype._appendValues = function(values) {
  if (_.isArray(values)) {
    this.values = this.values.concat(values);
  } else {
    this.values.push(values);
  }
};

Where.prototype.appends = function(conditions) {

  _.each(conditions, function(condition, value) {
    this.append(condition, value);
  }.bind(this));

  return this;
};

Where.prototype.repeated = function(condition, values) {
  _.each(values, function(val) {
    this.append(condition, val);
  }.bind(this));

  return this;
};

Where.prototype.build = Where.prototype.toString = Where.prototype.get = function() {
  return this.conditions.join(' ' + this.joinBy + ' ');
};

Where.OR = function() {
  return new Where('OR');
};

Where.AND = function() {
  return new Where('AND');
};

Where.concat = function() {
  return _.reduce(arguments, function(cumulative, next) {
    return cumulative.concat(next);
  });
};

exports = module.exports = Where;