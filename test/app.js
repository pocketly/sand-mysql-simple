/**
 * @author Adam Jaso <ajaso@pocketly.com>
 * @copyright 2014 Pocketly
 */ 

var sinon = require('sinon');
var _ = require('lodash');
var mocks = require('./mocks');

var simple = require('..');
var sand = require('sand')({appPath: __dirname+'/..'})
  .use(require('sand-mysql'))
  .use(simple, {test: {modelsPath: __dirname + '/goodModels'}});


before(function(done) {
  sand.start(done);
});

describe('mysqlSimple.Where(values, joinBy)', function () {

  _.each([ 'AND', 'OR' ], function(op) {

    it('should initialize from an object of column names mapped to values and joined by ' + op, function () {

      var expectedClause = '`user_id` = ? ' + op + ' `level` = ?';
      var expectedValues = [1,2];

      var where = simple.Where({
        user_id: 1,
        level: 2
      }, op);
      var clause = where.build();

      expectedClause.should.eql(clause);
      expectedValues.should.eql(where._values);

    });
  });

});


describe('mysqlSimple.Where#rawCondition()', function () {

  it('should add a column to the where clause', function () {

    var condition = '`user_id` = ?';
    var value = 1;
    var w = new simple.Where('AND');

    w.joinBy.should.be.equal('AND');

    w.rawCondition(condition, value);
    w._conditions.length.should.equal(1);
    w._conditions[0].should.eql(condition);
    w._values.length.should.equal(1);
    w._values[0].should.equal(value);


    condition = 'user_id BETWEEN (? AND ?)';
    value = [1, 2];
    w = new simple.Where('OR');
    w.rawCondition(condition, value);
    w._conditions.should.eql([condition]);
    w._values.should.eql(value);

  });

  it('should build a valid where clause', function() {

    var resultQuery = '`user_id` = ? AND `email` = ?';
    var resultValues = [1, 'test@test.com'];

    var w = new simple.Where('AND');

    w.rawCondition('`user_id` = ?', 1);
    w.rawCondition('`email` = ?', 'test@test.com');


    w.build().should.eql(resultQuery);
    w._values.should.eql(resultValues);

  });

  it('should build a valid nested where clause', function() {

    var resultQuery = '`user_id` = ? AND (`email` = ? OR `level` = ?)';
    var resultValues = [1, 'test@test.com', 2];

    var and = new simple.Where('AND');
    var or = new simple.Where('OR');

    or.rawCondition('`email` = ?', 'test@test.com');
    or.rawCondition('`level` = ?', 2);
    and.rawCondition('`user_id` = ?', 1);
    and.condition(or);

    and.build().should.be.eql(resultQuery);
    and._values.should.be.eql(resultValues);

  });

});


describe('mysqlSimple.Insert#build()', function () {

  it('should fail to initialize without a table', function () {

    (function() {
      new simple.Insert()
    }).should.throw();

  });


  it('should build a valid simple INSERT', function () {

    var resultQuery = 'INSERT INTO `user` ( `user_id`, `email`, `level` ) VALUES ( ?, ?, ? )';
    var resultValues = [1, 'test@test.com', 2];

    var insert = new simple.Insert('`user`');
    insert.add('`user_id`', 1); // removes ticks automatically
    insert.addAll({email: 'test@test.com', level: 2});

    insert = insert.build();
    insert.query.should.eql(resultQuery);
    insert.values.should.eql(resultValues);

  });


  it('should build a valid INSERT ON DUPLICATE KEY UPDATE', function () {

    var resultQuery = 'INSERT INTO `user` ( `user_id`, `email`, `level` ) VALUES ( ?, ?, ? ) ON DUPLICATE KEY UPDATE `user_id` = VALUES(user_id), `email` = VALUES(email), `level` = VALUES(level)';
    var resultValues = [1, 'test@test.com', 2];

    var insert = new simple.Insert('user');
    insert.add('user_id', 1);
    insert.addAll({email: 'test@test.com', level: 2});

    insert = insert.buildOnDuplicateUpdate();

    insert.query.should.eql(resultQuery);
    insert.values.should.eql(resultValues);

  });


  it('should build a valid INSERT ON DUPLICATE KEY UPDATE with custom UPDATE', function () {

    var resultQuery = 'INSERT INTO `user` ( `user_id`, `email`, `level` ) VALUES ( ?, ?, ? ) ON DUPLICATE KEY UPDATE `user_id` = `user_id`';
    var resultValues = [1, 'test@test.com', 2];

    var insert = new simple.Insert('user');
    insert.add('user_id', 1);
    insert.addAll({email: 'test@test.com', level: 2});

    insert = insert.buildOnDuplicateUpdate('`user_id` = `user_id`');

    insert.query.should.eql(resultQuery);
    insert.values.should.eql(resultValues);

  });

});



describe('mysqlSimple.Update#build()', function () {

  it('should build a valid UPDATE statement', function() {

    var resultQuery = 'UPDATE `user` SET `user_id` = ?, `email` = ?, `level` = ? WHERE `user_id` = ? AND `email` = ? LIMIT ?';
    var resultValues = [1, 'test@test.com', 2, 1, 'test@test.com', 1];

    var update = simple.Update('user')
      .values({user_id: 1, email: 'test@test.com', level: 2})
      .where(simple.Where({user_id: 1, email: 'test@test.com'}))
      .limit(1)
      .build();


    update.query.should.eql(resultQuery);
    update.values.should.eql(resultValues);

  });

});


describe('mysqlSimple.Select#build()', function () {

  var table = 'user';

  var queries = [
    {
      columns: '*',
      where: simple.Where({user_id: 1, level: 2}),
      order: 'user_id',
      group: 'level',
      limit: 1,
      offset: 2,
      expected: 'SELECT * FROM `' + table + '` WHERE `user_id` = ? AND `level` = ? GROUP BY `level` ORDER BY `user_id` ASC LIMIT ?, ?',
      values: [1,2,2,1]
    },
    {
      columns: ['user_id', 'email', ['sum(`level`)', 'level_sum']],
      where: simple.Where().rawCondition('`level` = ?', 2),
      having: simple.Where().condition('level_sum', '>', 2),
      limit: 1,
      expected: 'SELECT `user_id`, `email`, sum(`level`) AS `level_sum` FROM `' + table + '` WHERE `level` = ? HAVING `level_sum` > ? LIMIT ?',
      values: [2,2,1]
    },
    {
      columns: ['user_id', 'email', ['sum(`level`)', 'level_sum']],
      where: simple.Where().rawCondition('`level` = ?', 2).condition('user_id', 1),
      group: ['level', 'user_id'],
      having: simple.Where().condition('level_sum', '>', 2),
      order: [['user_id', 'ASC']],
      limit: 1,
      offset: 2,
      expected: 'SELECT `user_id`, `email`, sum(`level`) AS `level_sum` FROM `' + table + '` WHERE `level` = ? AND `user_id` = ? GROUP BY `level`, `user_id` HAVING `level_sum` > ? ORDER BY `user_id` ASC LIMIT ?, ?',
      values: [2,1,2,2,1]
    }
  ];

  _.each(queries, function(query) {
    it('should build a valid SELECT statement for ' + JSON.stringify(query), function () {

      var select = simple.Select(table);

      select.columns(query.columns);

      select.where(query.where);

      if (query.offset) {
        select.limit(query.limit, query.offset);
      } else {
        select.limit(query.limit);
      }

      if (query.order) {
        select.order(query.order);
      }

      if (query.having) {
        select.having(query.having);
      }

      if (query.group) {
        select.group(query.group);
      }

      select = select.build();

      //console.log(select.query);
      //console.log(query.expected);

      select.query.should.eql(query.expected);
      select.values.should.eql(query.values);

    });
  });

});


describe('mysqlSimple.Delete#build()', function () {

  var table = 'user';

  var queries = [
    {
      where: simple.Where({user_id: 1, level: 2, email: 'test@test.com'}),
      limit: 3,
      expected: 'DELETE FROM `' + table + '` WHERE `user_id` = ? AND `level` = ? AND `email` = ? LIMIT ?',
      values: [1,2,'test@test.com',3]
    },
    {
      where: {'`user_id` = ?': 1},
      limit: 4,
      expected: 'DELETE FROM `' + table + '` WHERE `user_id` = ? LIMIT ?',
      values: [1,4]
    }
  ];

  _.each(queries, function(query) {

    it('should build a valid DELETE statement: ' + JSON.stringify(query), function () {

      var del = simple.Delete(table);

      if (_.isPlainObject(query.where)) {
        _.each(query.where, function(val, cond) {
          del.where(cond, val);
        });
      } else {
        del.where(query.where);
      }
      del.limit(query.limit);

      del = del.build();

      del.query.should.eql(query.expected);
      del.values.should.eql(query.values);

    });

  });

});

function generateUserModel() {
  return sand.mysqlSimple.models.User.global().createFromRow({user_id: 1, level: 2, email: 'test@test.com'});
}