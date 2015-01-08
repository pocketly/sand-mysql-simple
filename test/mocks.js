/**
 * @author Adam Jaso <ajaso@pocketly.com>
 * @copyright 2014 Pocketly
 */

var models = require('./models');

var mocks;
module.exports = mocks = {};

mocks.MySQLInsert = {
  fieldCount: 0,
  affectedRows: 1,
  insertId: 13957520,
  serverStatus: 2,
  warningStatus: 4
};

mocks.MySQLUpdate = mocks.MySQLDelete = {
  fieldCount: 0,
  affectedRows: 1,
  serverStatus: 2,
  warningStatus: 4
};

mocks.mysqlQuery = function(mock, sql, bindings, returnArgs) {
  var tmp = mock.expects('query').withArgs(sql, bindings);
  tmp.yields.apply(tmp, returnArgs);
};

mocks.exampleWhere = {id: 1};

mocks.exampleSelect = models.User().select().where(mocks.exampleWhere).limit(1).toSQL();
mocks.exampleResultRow = {id: 1, name: 'joe shmo'};

mocks.exampleInsert = models.User().insert(mocks.exampleResultRow).toSQL();
mocks.exampleInsertResult = mocks.MySQLInsert;

mocks.exampleUpdate = models.User().update(mocks.exampleResultRow).where(mocks.exampleWhere).limit(1).toSQL();
mocks.exampleUpdateResult = mocks.MySQLUpdate;

mocks.exampleDelete = models.User().delete().where(mocks.exampleWhere).limit(1).toSQL();
mocks.exampleDeleteResult = mocks.MySQLDelete;

