/**
 * @author Adam Jaso <ajaso@pocketly.com>
 * @copyright 2014 Pocketly
 */ 

var _ = require('lodash');
var sinon = require('sinon');
var models = require('./models');

var simple = require('..');
var sand = require('sand')({appPath: __dirname+'/..'})
  .use(require('sand-mysql'));


var mocks = require('./mocks');

describe('mysqlSimple', function() {

  before(function (done) {
    sand.start(done);
  });

  describe('mysqlSimple.Model', function () {

    var mock;
    beforeEach(function () {
      if (mock) {
        mock.restore();
        mock = null;
      }
    });

    it('should return a knex query builder', function () {

      var builder = models.User();
      builder.select().toSQL().sql.should.match(/`user`/)

    });

    it('should select a single row', function (done) {

      var select = mocks.exampleSelect;

      mock = sinon.mock(sand.mysql);
      mocks.mysqlQuery(mock, select.sql, select.bindings, [null, [mocks.exampleResultRow]]);

      models.User.selectRow(mocks.exampleWhere, function (err, row) {
        mock.verify();
        mocks.exampleResultRow.should.eql(row);
        done();
      });

    });

    it('should insert a single row', function (done) {

      var insert = mocks.exampleInsert;

      mock = sinon.mock(sand.mysql);
      mocks.mysqlQuery(mock, insert.sql, insert.bindings, [null, mocks.exampleInsertResult]);

      models.User.insert(mocks.exampleResultRow, function (err, result) {
        mock.verify();
        mocks.exampleInsertResult.should.eql(result);
        done();
      });

    });

    it('should update a single row', function (done) {

      var update = mocks.exampleUpdate;

      mock = sinon.mock(sand.mysql);
      mocks.mysqlQuery(mock, update.sql, update.bindings, [null, mocks.exampleUpdateResult]);

      models.User.update(mocks.exampleResultRow, mocks.exampleWhere, function (err, result) {
        mock.verify();
        mocks.exampleUpdateResult.should.eql(result);
        done();
      });

    });

    it('should delete a single row', function (done) {

      var del = mocks.exampleDelete;

      mock = sinon.mock(sand.mysql);
      mocks.mysqlQuery(mock, del.sql, del.bindings, [null, mocks.exampleDeleteResult]);

      models.User.delete(mocks.exampleWhere, function (err, result) {
        mock.verify();
        mocks.exampleDeleteResult.should.eql(result);
        done();
      });

    });

    it('should remove invalid values from insert', function (done) {

      var insert = models.User().insert({id: 1}).toSQL();

      mock = sinon.mock(sand.mysql);
      mocks.mysqlQuery(mock, insert.sql, insert.bindings, [null, mocks.exampleInsertResult]);

      models.User.insert({id: 1, name: undefined}, function (err, result) {
        mock.verify();

        done();

      });

    });

  });

  describe('mysqlSimple.Util', function() {

    describe('buildOnDuplicateKeyIgnore', function() {

      it('should build on duplicate key ignore', function() {

        ' ON DUPLICATE KEY UPDATE `column` = `column`'.should.be.eql(simple.Util.buildOnDuplicateKeyIgnore('column'));

      });

    });

    describe('buildOnDuplicateKeyUpdate', function() {

      var oneCol = ' ON DUPLICATE KEY UPDATE `column1` = VALUES(`column1`)';
      var twoCols = ' ON DUPLICATE KEY UPDATE `column1` = VALUES(`column1`), `column2` = VALUES(`column2`)';

      var tests = [
        {
          columns: 'column1',
          expected: oneCol
        },
        {
          columns: ['column1'],
          expected: oneCol
        },
        {
          columns: {'column1': 1, column2: 2},
          expected: twoCols
        },
        {
          columns: ['column1', 'column2'],
          expected: twoCols
        }
      ];

      _.each(tests, function(test) {
        it('should build on duplicate key update for: ' + JSON.stringify(test.columns), function() {

          test.expected.should.be.eql(simple.Util.buildOnDuplicateKeyUpdate(test.columns));

        });
      });

    });

  });

});