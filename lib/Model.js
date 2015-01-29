/**
 * @author Adam Jaso <ajaso@pocketly.com>
 * @copyright 2015 Pocketly
 */ 

var _ = require('lodash');
var knex = require('knex')({client: 'mysql'});
var Util = require('./Util');

module.exports = exports = function(table, staticMethods) {

  function Model(row) {
    if (this instanceof Model) {
      if (_.isPlainObject(row)) {
        _.extend(this, row);
      } else {
        throw new Error('Row must be plain object')
      }
      return;
    }

    var builder = knex(table);

    builder.build = function() {
      var result = builder.toSQL();
      return {
        query: result.sql,
        values: result.bindings
      }
    };
    return builder;
  }

  Model.table = table;

  Model.knex = knex;

  Model.isRow = function(row) {
    return _.isPlainObject(row) && !_.isEmpty(row);
  };

  Model.selectRow = function(where, callback) {
    Util.validateProps(where);

    var select = this().select().where(where).limit(1).toSQL();

    sand.mysql.query(select.sql, select.bindings, function(err, rows) {
      if (err) {
        return callback(err)
      }

      callback(null, _.isArray(rows) && rows.length > 0 ? rows[0] : null, select);
    });
  };

  Model.insert = function(props, callback) {
    Util.removeEmptyProps(props);

    var insert = this().insert(props).toSQL();
    sand.mysql.query(insert.sql, insert.bindings, function(err, result) {
      if (err) {
        return callback(err);
      }

      callback(null, result, insert);
    });
  };

  Model.insertOrUpdate = function(props, where, callback) {
    this.selectRow(where, function(err, row) {
      if (err) {
        return callback(err);
      }

      if (!row) {
        return this.insert(props, callback);
      } else {
        return this.update(props, where, callback);
      }
    });
  };

  Model.update = function(props, where, callback) {

    if (!where || _.isEmpty(where)) {
      return callback(new Error('May not execute an UPDATE without a WHERE'));
    }

    Util.validateProps(props);
    Util.validateProps(where);
    var update = this().update(props).where(where).limit(1).toSQL();

    sand.mysql.query(update.sql, update.bindings, function(err, result) {
      if (err) {
        return callback(err);
      }

      callback(null, result, update);
    });
  };

  Model.delete = function(where, callback) {
    if (!where || _.isEmpty(where)) {
      return callback(new Error('May not execute a DELETE without a WHERE'));
    }

    Util.validateProps(where);
    var del = this().delete().where(where).limit(1).toSQL();

    sand.mysql.query(del.sql, del.bindings, function(err, result) {
      if (err) {
        return callback(err);
      }

      callback(null, result, del);
    });
  };

  if (_.isPlainObject(staticMethods)) {
    for (var prop in staticMethods) {
      if (staticMethods.hasOwnProperty(prop)) {
        var m = staticMethods[prop];
        Model[prop] = _.isFunction(m) ? m.bind(Model) : m;
      }
    }
  }


  return Model;
};

exports.knex = knex;