/**
 * @author Adam Jaso <ajaso@pocketly.com>
 * @copyright 2014 Pocketly
 */

var _ = require('lodash');

function Where(joinBy) {
  this.joinBy = joinBy;
  this.conditions = [];
  this.values = [];
}

Where.prototype.append = function(condition, value) {
  this.conditions.push(condition);
  this._appendValues(value);

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

Where.prototype.build = Where.prototype.get = function() {
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