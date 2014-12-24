/**
 * @author Adam Jaso <ajaso@pocketly.com>
 * @copyright 2014 Pocketly
 */ 

var _ = require('lodash');
var Util = require('./Util');
var Where = require('./Where');

function Delete(table) {
  if (!(this instanceof Delete)) {
    return new Delete(table);
  }

  this._table = Util.removeTicks(table);
  this._conditions = null;
  this._values = [];
  this._limit = null;
}

Delete.prototype.where = function(condition, values) {

  if (condition instanceof Where) {
    this._conditions = condition.build();
    values = condition._values;

  } else if (_.isString(condition)) {
    this._conditions = condition;

  } else {
    throw new Error('invalid condition: must be of type Where or string');
  }

  if (_.isArray(values)) {
    this._values = this._values.concat(values);
  } else if (_.isString(values) || _.isNumber(values)) {
    this._values.push(values);
  } else {
    throw new Error('values must be of type array, string, or int');
  }

  return this;
};

Delete.prototype.limit = function(limit) {
  this._limit = limit;
  this._values.push(limit);

  return this;
};

Delete.prototype.build = function() {
  if (!this._table) {
    throw new Error('table is required');
  }

  var where = this._conditions ? ' WHERE ' + this._conditions : '';
  var limit = this._limit ? ' LIMIT ?' : '';

  if (!where && !limit) {
    throw new Error('where or limit is required for deletes');
  }

  return {
    query: 'DELETE FROM `' + this._table + '`' + where + limit,
    values: this._values
  };
};

module.exports = Delete;