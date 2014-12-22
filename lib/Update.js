/**
 * @author Adam Jaso <ajaso@pocketly.com>
 * @copyright 2014 Pocketly
 */

var Util = require('./Util');
var Where = require('./Where');
var _ = require('lodash');

function Update(table) {
  if (!(this instanceof Update)) {
    return new Update(table);
  }

  this.table = Util.removeTicks(table);
  this._columns = [];
  this._values = [];
  this._where = null;
  this._limit = 1;
}

Update.prototype.values = function(sets) {
  _.each(sets, function(val, column) {
    this._columns.push(Util.removeTicks(column));
    this._values.push(val);
  }.bind(this));
  return this;
};

Update.prototype.where = function(where, values) {
  if (where instanceof Where) {
    where = where.build();
    this._where = where.clause;
    this._values = this._values.concat(where.values);

  } else if (_.isString(where)) {
    this._where = where;
    if (_.isArray(values)) {
      this._values = this._values.concat(values);
    }
  }
  return this;
};

Update.prototype.limit = function(limit) {
  this._limit = limit;
  return this;
}

Update.prototype.build = function() {
  if (!this._where && !this._limit) {
    throw new Error('where or limit is required for an update');
  }

  var where = '';
  if (this._where) {
    where += ' WHERE ' + this._where;
  }

  var limit = '';
  if (this._limit) {
    limit += ' LIMIT ?';
  }

  return {
    query: 'UPDATE `' + this.table + '` SET `' + this._columns.join('` = ?, `') + '`' + where + limit,
    values: this._values.concat([this._limit])
  }
};

module.exports = Update;