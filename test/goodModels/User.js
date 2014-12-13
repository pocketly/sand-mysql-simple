/**
 * @author Adam Jaso <ajaso@pocketly.com>
 * @copyright 2014 Pocketly
 */


var User;
module.exports = User = require('../..').Model.extend({

  table: 'user',

  values: function() {
    return {
      user_id: this.userId,
      level: this.level,
      email: this.email
    }
  },

  insert: function() {
    console.log('inserting into ' + User.table);
  },


  createFromRow: function(row) {
    var user = new User;
    user.userId = row.user_id;
    user.level = row.level;
    user.email = row.email;
    return user;
  }

});