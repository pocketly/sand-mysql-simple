/**
 * @author Adam Jaso <ajaso@pocketly.com>
 * @copyright 2014 Pocketly
 */ 

var _ = require('lodash');
var Util = require('./Util');
var removeTicks = /(?:^`|`$)/g;

function Insert(table) {
  table = table.replace(removeTicks, '');
  if (!(this instanceof Insert)) {
    return new Insert(table);
  }

  if (!table) {
    throw new Error('table is required to create an insert!');
  }

  this.table = '`' + table + '`';
  this.columns = [];
  this.values = [];
}

Insert.prototype.add = function(column, value) {
  this.columns.push(column.replace(removeTicks, ''));
  this.values.push(value);
  return this;
};

Insert.prototype.addAll = function(values) {
  _.each(values, function(value, column) {
    this.add(column, value);
  }.bind(this));
  return this;
};

Insert.prototype._sanityCheck = function() {
  if (this.columns.length != this.values.length) {
    throw new Error('columns length ' + this.columns.length + ' does not match values length ' + this.values.length);
  }
};

/**
 * Builds a simple insert based on columns and values given
 *
 * @returns {{query: string, values: *}}
 */
Insert.prototype.build = function() {
  this._sanityCheck();
  return {
    query: 'INSERT INTO ' + this.table + ' ( `' + this.columns.join('`, `') + '` ) VALUES ( ' + Util.questions(this.values.length) + ' )',
    values: this.values
  }
};

/**
 * Builds ON DUPLICATE KEY UPDATE query based on columns given or update and values supplied
 *
 * @param update
 * @param values
 * @returns {{query: string, values: *}}
 */
Insert.prototype.buildOnDuplicateUpdate = function(update, values) {
  this._sanityCheck();

  if (_.isArray(values)) {
    this.values = this.values.concat(values);
  }

  if (!update) {
    var updates = _.map(this.columns, function(column) {
      return '`' + column + '` = VALUES(' + column + ')';
    });

    update = updates.join(', ');
  }

  update = 'ON DUPLICATE KEY UPDATE ' + update;

  return {
    query: 'INSERT INTO ' + this.table + ' ( `' + this.columns.join('`, `') + '` ) VALUES ( ' + Util.questions(this.values.length) + ' ) ' + update,
    values: this.values
  }
};

Insert.prototype.buildOnDuplicateIgnore = function(ignoreColumn) {
  ignoreColumn = '`' + ignoreColumn.replace(removeTicks, '') + '`';
  return this.buildOnDuplicateUpdate(ignoreColumn + ' = ' + ignoreColumn);
};

exports = module.exports = Insert;