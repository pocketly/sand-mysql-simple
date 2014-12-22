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

  getColumnValueMap: function(values) {
    var vals = {};
    _.each(values, function (val, colName) {
      if (_.isNumber(val) || _.isString(val)) {
        vals[colName] = val;
      }
    });
    return vals;
  },

  removeTicks: function(str) {
    return str.replace(removeTicks, '');
  }
};