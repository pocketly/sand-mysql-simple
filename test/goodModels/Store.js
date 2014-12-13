/**
 * @author Adam Jaso <ajaso@pocketly.com>
 * @copyright 2014 Pocketly
 */ 


var Store;
module.exports = Store = require('../..').Model.extend({

  insert: function() {
    console.log('inserting into ' + Store.table);
  }

}, {
  table: 'store'
});