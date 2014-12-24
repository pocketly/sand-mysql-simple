/**
 * @author Adam Jaso <ajaso@pocketly.com>
 * @copyright 2014 Pocketly
 */

var _ = require('lodash');
var Util = require('./Util');

function Where(values, joinBy) {
  if (!(this instanceof Where)) {
    return new Where(values, joinBy);
  }

  this._conditions = [];
  this._values = [];

  if (_.isPlainObject(values)) {
    this.conditions(values);
  } else {
    joinBy = values;
  }
  this.joinBy = joinBy || 'AND';
}

Where.prototype.condition = function(column, op, value) {

  if (!value) {
    value = op;
    op = null;
  }

  if (column instanceof Where) {
    var nested = _.isNull(op) || _.isUndefined(op) ? true : op;
    value = column._values;

    column = !nested ? column.build() : '(' + column.build() + ')';

  } else if (_.isString(column) && (_.isUndefined(value) || _.isNull(value) || _.isString(value) || _.isNumber(value))) {
    column = '`' + Util.removeTicks(column) + '` ' + (op || '=') + ' ?';

  } else {
    throw new Error('invalid condition or value: ' + column + ' ' + value);
  }

  this.rawCondition(column, value);

  return this;
};

Where.prototype.conditions = function(conditions) {

  _.each(conditions, function(value, condition) {
    this.condition(condition, value);
  }.bind(this));

  return this;
};

Where.prototype.rawCondition = function(condition, value) {
  if (_.isString(condition)) {
    this._conditions.push(condition);

    if (!_.isUndefined(value) && !_.isNull(value)) {
      this._appendValues(value);
    }

  } else {
    throw new Error('invalid condition or value: ' + condition + ' ' + value);
  }

  return this;
};

Where.prototype.rawRepeated = function(condition, values) {
  _.each(values, function(val) {
    this.rawCondition(condition, val);
  }.bind(this));

  return this;
};

Where.prototype._appendValues = function(values) {
  if (_.isArray(values)) {
    this._values = this._values.concat(values);
  } else {
    this._values.push(values);
  }
};

Where.prototype.build = Where.prototype.toString = Where.prototype.get = function() {
  return this._conditions.join(' ' + this.joinBy + ' ');
};

Where.OR = function(values) {
  return new Where(values, 'OR');
};

Where.AND = function(values) {
  return new Where(values, 'AND');
};

Where.concat = function() {
  return _.reduce(arguments, function(cumulative, next) {
    return cumulative.concat(next);
  });
};

exports = module.exports = Where;