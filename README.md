sand-mysql-simple
=================

A minimalist MySQL Model extension for Sand.js

###Usage

 1. Create a model for a table
 

```javascript
// your first model (i.e. /models/User.js)
var User;
module.exports = User = require('sand-mysql-simple').Model.extend({
	table: 'user', // this is the only required parameter

	values: function() {
		return {
			user_id: 1,
			email_address: 'test@test.com'
		}
	},	

	getById: function(id, callback) {
		sand.mysqlSimple.models.User.global().selectRow('user_id', id, function(err, row) {
			if (err) {
				return callback(err);
			}
			
			var userModel = sand.mysqlSimple.models.User.global().createFromRow(row);
			callback(null, userModel);
		});
	},


	save: function(callback) {
		// this calls your .values() function above, and collects all the non-null properties together into an Array with a corresponding query string that has placeholders ready to use with node-mysql2 (which is what sand-mysql uses)
		var insert = this.getInsert(); 
		
		// note that you need to use 'sand-mysql'
		sand.mysql.query(insert.query, insert.values, function(err, result) {
			if (err) {
				return callback(err);
			}
			callback(null, result);
		});
	},

	// creates a model from a db row
	createFromRow: function(row) {
		var user = new User;
		user.id = row.user_id;
		user.email = row.email_address;
		return user;
	}
});
```
   

 2. Use it in your app
```javascript
var mysqlSimple = require('sand-mysql-simple');

// initialize your sand instance
var sand = require('sand')();

sand
	.use(mysqlSimple, {modelsPath: __dirname + '/models'}) // use mysqlSimple
	.start(); // start your sand app

var myUserId = 1;

// now use your models
sand.mysqlSimple.models.User.getById(myUserId, sand.log);
```