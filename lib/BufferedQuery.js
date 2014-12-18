/**
 * @author Adam Jaso <ajaso@pocketly.com>
 * @copyright 2014 Pocketly
 */

function BufferedQuery(query, values, bufferSize, callback) {
  this.offset = 0;
  this.bufferSize = parseInt(bufferSize);
  this.query = query + ' LIMIT ?, ?';
  this.values = values || [];
  this.callback = callback;
  this.connOpen = 0;
}

BufferedQuery.prototype.showStatus = function() {
  sand.log('open connections: ', this.connOpen);
};

BufferedQuery.prototype.run = function (offset, firstOnly) {
  offset = offset || this.offset;
  var self = this;
  sand.mysql.pool.getConnection(function(err, connection) {
    self.connOpen ++;
    if (err) {
      doneWithConnection();
      sand.log(err);
      return self.callback(err);
    }

    connection.execute(self.query, self.values.concat([offset, self.bufferSize]), function (err, rows) {

      if (err) {
        doneWithConnection();
        return self.callback(err);
      }

      var rowCount = rows.length;

      self.callback(null, rows, connection, function(err) {
        doneWithConnection();

        if (err) {
          return self.callback(err);
        }

        if (rowCount >= self.bufferSize && !firstOnly) {
          self.run(offset + self.bufferSize);

        } else {

          return self.callback();
        }
      });

    });

    function doneWithConnection() {
      self.connOpen --;
      connection.release();
    }
  });

};

exports = module.exports = BufferedQuery;
