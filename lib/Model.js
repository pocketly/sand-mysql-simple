/**
 * @author Adam Jaso <ajaso@pocketly.com>
 * @copyright 2015 Pocketly
 */ 

var _ = require('lodash');
var knex = require('knex')({client: 'mysql'});

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
    validateProps(where);

    var select = this().select().where(where).limit(1).toSQL();

    sand.mysql.query(select.sql, select.bindings, function(err, rows) {
      if (err) {
        return callback(err)
      }

      callback(null, _.isArray(rows) && rows.length > 0 ? rows[0] : null, select);
    });
  };

  Model.insert = function(props, callback) {
    validateProps(props);

    var insert = this().insert(props).toSQL();
    sand.mysql.query(insert.sql, insert.bindings, function(err, result) {
      if (err) {
        return callback(err);
      }

      callback(null, result, insert);
    });
  };

  Model.update = function(props, where, callback) {

    if (!where || _.isEmpty(where)) {
      return callback(new Error('May not execute an UPDATE without a WHERE'));
    }

    validateProps(props);
    validateProps(where);
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

    validateProps(where);
    var del = this().delete().where(where).limit(1).toSQL();

    sand.mysql.query(del.sql, del.bindings, function(err, result) {
      if (err) {
        return callback(err);
      }

      callback(null, result, del);
    });
  };

  if (_.isPlainObject(staticMethods)) {
    for (var method in staticMethods) {
      if (staticMethods.hasOwnProperty(method)) {
        Model[method] = staticMethods[method].bind(Model);
      }
    }
  }


  return Model;
};

exports.knex = knex;
exports.validateProps = validateProps;

function validateProps(props, thro) {
  var vals = {};
  _.each(props, function(val, key) {
    if (!_.isString(val) && !_.isNumber(val)) {
      if (_.isUndefined(thro) ? true : thro) {
        throw new Error('Invalid value: "' + JSON.stringify(val) + '" for column "' + key + '"');
      }
      vals[key] = val;
    }
  });
  return vals;
}