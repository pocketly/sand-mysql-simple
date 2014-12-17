/**
 * @author Adam Jaso <ajaso@pocketly.com>
 * @copyright 2014 Pocketly
 */ 

var sinon = require('sinon');
var _ = require('lodash');
var mocks = require('./mocks');

var simple = require('..');
var sand = require('sand')({appPath: '..'})
  .use(require('sand-mysql'))
  .use(simple, {modelsPath: __dirname + '/goodModels'});


before(function(done) {
  sand.start(done);
});

describe('mysqlSimple', function () {

  it('should be loaded into sand', function () {

    sand.mysqlSimple.should.be.ok;

  });


  it('should have loaded all models', function () {

    sand.mysqlSimple.models.should.be.ok;
    sand.mysqlSimple.models.User.should.be.a.Function;
    sand.mysqlSimple.models.Store.should.be.a.Function;
    sand.mysqlSimple.models.sub.Sub.should.be.a.Function;

  });

});


describe('mysqlSimple.Model.getWhereClause()', function () {

  it('should build WHERE with string column and scalar value', function () {

    var where = sand.mysqlSimple.models.User.global().getWhereClause('user_id', 1);

    where.clause.should.match(/`user_id`\s*=\s*\?/);
    where.values.should.eql([1]);

  });

  it('should build WHERE with object of property constraints', function () {

    var where = sand.mysqlSimple.models.User.global().getWhereClause({user_id: 1, level: 2, email: 'test@test.com'});

    where.clause.should.match(/`user_id`\s*=\s*\?/);
    where.clause.should.match(/`level`\s*=\s*\?/);
    where.clause.should.match(/`email`\s*=\s*\?/);
    where.clause.should.match(/`user_id`\s*=\s*\?\s+AND\s+`level`\s*=\s*\?\s+AND\s+`email`\s*=\s*\?/);
    where.values.should.eql([1, 2, 'test@test.com']);

  });

});


describe('mysqlSimple.Model.questions()', function () {

  it('should build a proper question mark placeholder string', function () {

    require('..').Model.global().questions(3).should.match(/\?,\s*\?,\s*\?/)

  });

});


describe('mysqlSimple.Model#getSelectRow()', function () {

  it('should build a SELECT statement from column and scalar value', function () {

    var select = sand.mysqlSimple.models.User.global().getSelectRow('user_id', 1);

    select.query.should.match(/SELECT\s+\*\s+FROM\s+`user`\s+WHERE\s+`user_id`\s*=\s*\?\s+LIMIT\s+1/);
    select.values.should.eql([1])

  });

  it('should build a SELECT statement from an object of constraints', function () {

    var select = sand.mysqlSimple.models.User.global().getSelectRow({user_id: 1, level: 2, email: 'test@test.com'});

    select.query.should.match(/`user_id`\s*=\s*\?/);
    select.query.should.match(/`level`\s*=\s*\?/);
    select.query.should.match(/`email`\s*=\s*\?/);
    select.query.should.match(/SELECT\s+\*\s+FROM\s+`user`\s+WHERE\s+`user_id`\s*=\s*\?\s+AND\s+`level`\s*=\s*\?\s+AND\s+`email`\s*=\s*\?/);
    select.values.should.eql([1, 2, 'test@test.com']);

  });

});


describe('mysqlSimple.Model#selectRow()', function () {

  var mock;
  afterEach(function () {
    if (mock) {
      mock.restore();
      mock = null;
    }
  });

  it('should select a row from the database using a column and scalar', function () {

    var value = 'test@test.com';

    var select = {
      query: 'SELECT * FROM `user` WHERE `email` = ? LIMIT 1',
      values: [value]
    };

    mock = sinon.mock(sand.mysql);
    mock.expects('query').withArgs(select.query, select.values).yields(null, [{
      user_id: 1,
      level: 2,
      email: 'test@test.com'
    }]);

    sand.mysqlSimple.models.User.global().selectRow('email', value, function (err, row) {

      row.should.eql({user_id: 1, level: 2, email: value});
      mock.verify();
    });

  });

  it('should select a row from the database using an object of constraints', function () {

    var userConstraints = {
      user_id: 1,
      level: 2,
      email: 'test@test.com'
    };

    var select = {
      query: 'SELECT * FROM `user` WHERE `user_id` = ? AND `level` = ? AND `email` = ? LIMIT 1',
      values: [1, 2, 'test@test.com']
    };

    mock = sinon.mock(sand.mysql);
    mock.expects('query').withArgs(select.query, select.values).yields(null, [{
      user_id: 1,
      level: 2,
      email: 'test@test.com'
    }]);

    sand.mysqlSimple.models.User.global().selectRow(userConstraints, function (err, row) {

      row.should.eql(userConstraints);
      mock.verify();
    });

  });

});


describe('mysqlSimple.Model#values()', function () {

  it('should return a map of column names to (string|int) values', function () {

    var userModel = generateUserModel();

    var values = userModel.values();

    _.each(values, function (val, column) {
      (_.isString(val) || _.isNumber(val)).should.be.ok;
      _.isString(column).should.be.ok;
    });
  });

});


describe('mysqlSimple.Model#getInsert()', function () {


  it('should construct a properly formatted INSERT statement', function () {

    var userModel = generateUserModel();

    var insert = userModel.getInsert();

    var expected = {
      query: /INSERT\s+INTO\s+`user`\s+\(`user_id`,\s*`level`,\s*`email`\)\s*VALUES\s*\(\?,\s*\?,\s*\?\)/,
      values: [1, 2, 'test@test.com']
    };

    insert.query.should.match(expected.query);
    insert.values.should.eql(expected.values);

  });

});


describe('mysqlSimple.Model#getUpdate()', function () {


  it('should construct a properly formatted UPDATE statement', function () {

    var userModel = generateUserModel();

    var update = userModel.getUpdate({email: 'test@test.com'}, 1);

    var expected = {
      query: /UPDATE\s+`user`\s+SET\s+`user_id`\s*=\s*\?,\s*`level`\s*=\s*\?,\s*`email`\s*=\s*\?\s+WHERE\s+`email`\s*=\s*\?\s+LIMIT\s+1/,
      values: [1, 2, 'test@test.com', 'test@test.com']
    };

    update.query.should.match(expected.query);
    update.values.should.eql(expected.values);

  });

});

function generateUserModel() {
  return sand.mysqlSimple.models.User.global().createFromRow({user_id: 1, level: 2, email: 'test@test.com'});
}