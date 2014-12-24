/**
 * @author Adam Jaso <ajaso@pocketly.com>
 * @copyright 2014 Pocketly
 */

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
  }
};