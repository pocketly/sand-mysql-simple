/**
 * @author Adam Jaso <ajaso@pocketly.com>
 * @copyright 2014 Pocketly
 */ 

var _ = require('lodash');
var errors = require('common-errors');

/**
 * Trims trailing commas from a beginning OR end string
 *
 * @type {RegExp}
 */
var trailingCommasPattern = /(?:(?:^,)|(?:,\s?$))/g;

var questionsCache = {};

var _global = {};

var Model = require('sand-extend').Class.extend({

  construct: function() {
  },


  /**
   * Returns a mapping of MySQL table column names to values on the model. Must be explicitly defined by the developer
   * with the model parameters that should be written to the DB
   *
   * @returns {object}
   */
  values: function() {
    return {}
  },


  /**
   * Create a function that gets a map of values with mysql INSERT columns
   * @returns {{ columns: Array, values: Array }}
   *    columns - MySQL formatted INSERT column strings
   *    values  - {string} or {int} values corresponding to the columns
   */
  getInsertValuesMap: getValuesMap(false),


  /**
   * Builds a MySQL INSERT query for execution with prepared statements.
   * @returns {{query: string, values: Array[scalar]}}
   *  query - a fully valid MySQL INSERT statement with placeholders corresponding to values
   *  values - a list of values corresponding to the placeholders in the query
   */
  getInsert: function() {
    this._requireTable();

    var data = this.getInsertValuesMap();

    return {
      query: 'INSERT INTO `' + this.table + '` (' + data.columns.join(', ') + ') VALUES (' + this.questions(data.columns.length) + ')',
      values: data.values
    };
  },


  /**
   * Create a function that gets a map of values with mysql UPDATE columns formatted with placeholders
   * @returns {{ columns: Array[string], values: Array[scalar] }}
   *    columns - MySQL formatted UPDATE column strings
   *    values  - {string} or {int} values corresponding to the columns
   */
  getUpdateValuesMap: getValuesMap(true),


  /**
   * Builds a MySQL UPDATE query for execution with prepared statements.
   *
   * @param where {{valid_column: scalar }} a map of columns mapped to values that should be applied as AND separated constraints
   * @param limit {int} number of rows this query is allowed to affect
   *
   * @returns {{query: string, values: Array[scalar]}}
   *  query - a fully valid MySQL UPDATE statement with placeholders corresponding to values
   *  values - a list of values corresponding to the placeholders in the query
   *
   */
  getUpdate: function(where, limit) {
    this._requireTable();
    if (!where) {
      throw new errors.NotPermittedError('You must specify a where clause for an UPDATE');
    }

    where = this.getWhereClause(where);


    var data = this.getUpdateValuesMap();
    return {
      query: 'UPDATE `' + this.table + '` SET ' + data.columns.join(', ') + ' WHERE ' + where.clause + (limit ? ' LIMIT ' + limit : ''),
      values: data.values.concat(where.values)
    };
  },




  /**
   * The name of the table that this model manages. Must be explicitly defined by the developer.
   *
   * @type {string}
   */
  table: '',


  /**
   * Ensures that the table parameter is defined by the developer
   *
   * @private
   */
  _requireTable: function() {
    if (!this.table) {
      throw new errors.NotFoundError('Table name was not found.');
    }
  },

  /**
   * Builds  WHERE clause parameters from an object of values or a column name string and a scalar value
   *
   * @param column {string} column name OR {{valid_column: scalar}} of column_names mapped to scalar values.
   * @param value {scalar} value for the string column. If the column is an object, then value is ignored.
   *
   * @returns {{clause: string, values: Array[scalar]}}
   *    clause: properly formatted MySQL WHERE clause string with prepared statement placeholders
   *    values: Array of values corresponding to placeholders
   */
  getWhereClause: function(column, value) {

    var values;
    var columns;

    if (_.isObject(column)) {
      value = null;

      columns = [];
      values = [];
      _.each(column, function(val, key) {
        columns.push(key);
        values.push(val);
      });
    }

    if (_.isString(column)) {
      columns = [column];
    }

    if (_.isString(value) || _.isNumber(value)) {
      values = [value];
    }

    if (_.isArray(columns) && _.isArray(values) && columns.length === values.length) {

      column = '';
      _.each(columns, function(col, i) {
        column += (i > 0 ? ' AND ' : '') + '`' + col + '` = ?';
      });
      columns = column;

    } else {
      throw new errors.ArgumentError('columns length must match values length for WHERE clause');
    }

    return {
      clause: columns,
      values: values
    }

  },

  /**
   * Builds a valid MySQL SELECT statement with values mapped to placeholders to select a single, unique row from the table.
   *
   * @param column @see {Function getWhereClause}
   * @param value @see {Function getWhereClause}
   *
   * @returns {{query: string, values: Array[scalar]}}
   *    query: A valid MySQL select query with placeholders applied to values
   *    values: Scalar values corresponding to query placeholders
   */
  getSelectRow: function(column, value) {

    var where = this.getWhereClause(column, value);

    return {
      query: 'SELECT * FROM `' + this.table + '` WHERE ' + where.clause + ' LIMIT 1',
      values: where.values
    }
  },

  /**
   * Actively selects a row from MySQL database table and returns it in the callback.
   *
   * @param column @see {Function getWhereClause}
   * @param value @see {Function getWhereClause}
   *    NOTE: as with getWhereClause if column, arg[0], is an object, the callback may be passed as arg[1]
   *
   * @param callback {Function} function(err, row) if sand.mysql returned an error, then only err is set, else a row from sand.mysql is returned
   *
   */
  selectRow: function(column, value, callback) {

    if (_.isObject(column)) {
      callback = value;
      value = null;
    }

    var select;

    try {
      select = this.getSelectRow.apply(this, arguments);
    } catch (e) {
      return callback(e)
    }

    sand.mysql.query(select.query, select.values, function(err, rows) {
      if (err) {
        sand.log(err);
        return callback(err)
      }

      callback(null, _.isArray(rows) && rows.length > 0 ? rows[0] : null);
    });
  },


  /**
   * Utility function to build a series of comma separated question marks for placeholders
   *
   * @param n {int} how many question marks to concatenate
   * @returns {*}
   */
  questions: function questions(n) {
    if (!questionsCache[n]) {
      questionsCache[n] = (new Array(n + 1)).join('?, ').replace(trailingCommasPattern, '');
    }
    return questionsCache[n];
  }

}, {

  global: function() {
    if (!_global[this]) {
      _global[this] = new this;
    }

    return _global[this];
  }
});



/**
 * Creates a function for building MySQL INSERT/UPDATE queries mapped to values
 *
 * @param includePlaceholder
 * @returns {Function}
 */
function getValuesMap(includePlaceholder) {
  return function() {
    var values = [];
    var columns = [];

    _.each(this.values(), function (val, colName) {
      if (_.isNumber(val) || _.isString(val)) {
        values.push(val);
        columns.push('`' + colName + '`' + (includePlaceholder ? ' = ?' : ''));
      }
    });

    return {
      values: values,
      columns: columns
    };
  }
}

exports = module.exports = Model;