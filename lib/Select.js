/**
 * @author Adam Jaso <ajaso@pocketly.com>
 * @copyright 2014 Pocketly
 */ 

var _ = require('lodash');
var Util = require('./Util');
var Where = require('./Where');

function Select(table, opts) {
  if (!(this instanceof Select)) {
    return new Select(table);
  }

  this._selectOpts = opts;
  this._columns = '*';
  this._values = [];
  this._table = table;
  this._where = null;
  this._group = null;
  this._having = null;
  this._order = null;
  this._limit = null;
  this._offset = null;
}

Select.prototype.columns = function(cols) {
  if (_.isString(cols)) {
    this._columns = [ cols ];
  }

  var _cols = [];
  _.each(cols, function(col) {
    _cols.push(Util.removeTicks(col));
  });
  this._columns = _cols;

  return this;
};

Select.prototype.where = function(where, values) {

  if (where instanceof Where) {
    var _where = where.build();
    this._where = _where.clause;
    this._values = this._values.concat(_where.values);

  } else if (_.isString(where)) {
    this._where = where;

    if (!_.isArray(values) && (_.isNumber(values) || _.isString(values))) {
      values = [values];
    }

    if (_.isArray(values)) {
      this._values = this._values.concat(values);
    }

  } else {
    throw new Error('where must be of type Where or string');
  }

  return this;
};

Select.prototype.group = function(cols) {
  if (_.isString(cols) || _.isNumber(cols)) {
    this._order = [cols];
  }

  if (_.isArray(cols)) {
    this._order = cols;

  } else {
    throw new Error('group cols must be plain object, array, or string');
  }

  return this;
};

Select.prototype.having = function(having, values) {
  if (having instanceof Where) {
    var _having = having.build();
    this._having = _having.clause;
    this._values = this._values.concat(_having.values);

  } else if (_.isString(having)) {
    this._having = having;

    if (!_.isArray(values) && (_.isNumber(values) || _.isString(values))) {
      values = [values];
    }

    if (_.isArray(values)) {
      this._values = this._values.concat(values);
    }
  }

  return this;
};

Select.prototype.order = function(cols) {
  if (_.isString(cols) || _.isNumber(cols)) {
    this._order = [cols];
  }

  if (_.isArray(cols)) {
    this._order = _.map(cols, function(col) {
      return _.isArray(col) && col.length > 1 ? '`' + Util.removeTicks(col[0]) + '` ' + col[1] : col;
    });

  } else {
    throw new Error('order cols must be plain object, array, or string');
  }

  return this;
};

Select.prototype.limit = function(limit, offset) {
  this._limit = limit;
  this._offset = offset;
  return this;
};

Select.prototype.build = function() {
  if (!this._table) {
    throw new Error('table is required');
  }

  if (!this._columns) {
    throw new Error('columns are required');
  }

  var opts = this._selectOpts ? ' ' + this._selectOpts.trim() : '';
  var cols = joinCols(this._columns);
  var table = '`' + this._table + '`';
  var where = this._where ? ' WHERE ' + this._where : '';
  var group = this._group ? ' GROUP BY ' + joinCols(this._group) : '';
  var having = this._having ? ' HAVING ' + this._having : '';
  var order = this._order ? ' ORDER BY ' + this._order.join(', ') : '';
  var limit = this._limit ? ' LIMIT ' + (this._offset ? '?, ' : '') + '?' : '';
  if (this._limit) {
    if (this._offset) {
      this._values.push(this._offset);
    }
    this._values.push(this._limit);
  }

  return {
    query: 'SELECT' + opts + ' ' + cols + ' FROM ' + table + where + group + having + order + limit,
    values: this._values
  }
};

exports = module.exports = Select;


function joinCols(cols) {
  return !_.isArray(cols) ? cols : '`' + cols.join('`, `') + '`';
}