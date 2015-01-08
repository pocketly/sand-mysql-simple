/**
 * @author Adam Jaso <ajaso@pocketly.com>
 * @copyright 2015 Pocketly
 */ 

var mysqlSimple = require('..');

module.exports = exports = {

  ApiApps: mysqlSimple.Model('api_apps'),

  User: mysqlSimple.Model('user'),

  ProviderCoupon: mysqlSimple.Model('provider_coupon', {
    doMyQuery: function() {
      return this().where({name: ''}).build();
    }
  })

};
//
//var query = exports.User().insert({id:1}).build();
//
//var customQuery = exports.User.doMyQuery();