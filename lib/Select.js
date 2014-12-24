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
    this._columns = cols;

  } else if (_.isArray(cols)) {
    var _cols = [];
    _.each(cols, function (col) {
      if (_.isArray(col)) {
        col = col.slice(0, 2);

        col = col[0].trim() + ' AS `' + Util.removeTicks(col[1].trim()) + '`';
      } else {
        col = '`' + Util.removeTicks(col) + '`';
      }
      _cols.push(col);
    });

    this._columns = _cols.join(', ');
  }

  return this;
};

Select.prototype.where = function(where, values) {

  if (where instanceof Where) {
    this._where = where.build();
    this._values = this._values.concat(where._values);

  } else if (_.isString(where)) {
    this._where = where;

    if (!_.isArray(values) && (_.isNumber(values) || _.isString(values))) {
      values = [values];
    }

    if (_.isArray(values)) {
      this._values = this._values.concat(values);

    } else {
      throw new Error('where values must be of type array or string or int');
    }

  } else {
    throw new Error('where must be of type Where or string');
  }

  return this;
};

Select.prototype.group = function(cols) {
  if (_.isArray(cols)) {
    cols = _.map(cols, function(col) {
      return '`' + Util.removeTicks(col) + '`';
    });
    this._group = cols;

  } else if (_.isString(cols) || _.isNumber(cols)) {
    this._group = ['`' + Util.removeTicks(cols) + '`'];

  } else {
    throw new Error('order cols must be plain object, array, or string');
  }

  return this;
};

Select.prototype.having = function(having, values) {

  if (having instanceof Where) {
    this._having = having.build();
    this._values = this._values.concat(having._values);

  } else if (_.isString(having)) {
    this._having = having;

    if (!_.isArray(values) && (_.isNumber(values) || _.isString(values))) {
      values = [values];
    }

    if (_.isArray(values)) {
      this._values = this._values.concat(values);

    } else {
      throw new Error('where values must be of type array or string or int');
    }

  } else {
    throw new Error('where must be of type Where or string');
  }

  return this;
};

Select.prototype.order = function(cols, dir) {
  if (dir) {
    dir = dir.toUpperCase();
  }

  if (_.isPlainObject(cols)) {
    var _cols = [];
    _.each(cols, function (dir, column) {
      _cols.push(buildOrder(column, dir));
    });
    this._order = _cols;

  } else if (_.isArray(cols)) {
    this._order = _.map(cols, function(col) {
      return _.isArray(col) ? buildOrder(col[0], col[1]) : col;
    }.bind(this));

  } else if (_.isString(cols) || _.isNumber(cols)) {
    this._order = [buildOrder(cols, dir || 'ASC')];

  } else {
    throw new Error('order cols must be plain object, array, or string');
  }

  function buildOrder(column, dir) {
    return '`' + Util.removeTicks(column.trim()) + '` ' + dir.trim();
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
  var cols = this._columns;
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
  if (_.isArray(cols)) {
    var _cols = [];
    _.each(cols, function(col) {
      _cols.push(/ AS /.test(col) ? col : '`' + col + '`');
    });
  }
  return !_.isArray(cols) ? cols : cols.join(', ');
}