/**
 * @author Adam Jaso <ajaso@pocketly.com>
 * @copyright 2014 Pocketly
 */
var _ = require('lodash');

var questionsCache = {};
var trailingCommasPattern = /(?:(?:^,)|(?:,\s?$))/g;

var removeTicks = /(?:^`|`$)/g;

exports = module.exports = {
  questions: function questions(n) {
    if (!questionsCache[n]) {
      questionsCache[n] = (new Array(n + 1)).join('?, ').replace(trailingCommasPattern, '');
    }
    return questionsCache[n];
  },

  filterValues: function(values) {
    var _values = {};

    _.each(values, function (val, key) {
      if (_.isString(val) || _.isNumber(val)) {
        _values[key] = val;
      }
    });

    return _values;
  },

  removeTicks: function(str) {
    return str.replace(removeTicks, '');
  },

  validateProps: function validateProps(props, thro) {
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
  },

  removeEmptyProps: function removeEmptyProps(props) {
    _.each(props, function(val, key) {
      if (!_.isString(val) && !_.isNumber(val)) {
        delete props[key];
      }
    });
  },

  buildOnDuplicateKeyIgnore: function(col) {
    col = exports.removeTicks(col);
    return ' ON DUPLICATE KEY UPDATE `' + col + '` = `' + col + '`';
  },

  buildOnDuplicateKeyUpdate: function(keys) {
    if (_.isPlainObject(keys)) {
      keys = Object.keys(keys);

    } else if (_.isString(keys)) {
      keys = [keys];
    }

    if (!_.isArray(keys)) {
      throw new Error('invalid keys: ' + keys);
    }

    var cols = [];
    _.each(keys, function(key) {
      key = '`' + exports.removeTicks(key).trim() + '`';
      cols.push(key + ' = VALUES(' + key + ')');
    });

    return ' ON DUPLICATE KEY UPDATE ' + cols.join(', ');
  }
};