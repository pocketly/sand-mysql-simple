/**
 * @author Adam Jaso <ajaso@pocketly.com>
 * @copyright 2014 Pocketly
 */

var _ = require('lodash');

var BufferedQuery = require('sand').Class.extend(require('events').EventEmitter, {

  construct: function(query, values, bufferSize) {

    this.offset = 0;
    this.bufferSize = parseInt(bufferSize);
    this.query = query + ' LIMIT ?, ?';
    this.values = values || [];
    this.rowCount = 0;

    this.setMaxListeners(1);

    // query start listener
    this.on('query:started', function(next) {
      sand.log('started');
      next(/* err */);
    });

    // query error listener
    this.on('query:error', function(err) {
      sand.log('error');
      sand.log(err);
    });

    // query rows listener
    this.on('query:rows', function(rows, next) {
      sand.log('rows');
      next(/* err */);
    });

    // query next listener
    this.on('query:next', function(nextOffset, next) {
      sand.log('next');
      next(/* err */);
    });

    // query buffering is complete listener
    this.on('query:complete', function() {
      sand.log('complete');
      sand.log('finished buffered query', this.query);
    }.bind(this));


    // ensure that there is only ever one listener per event
    this.on('newListener', function(event, listener) {

      if (this.listeners(event).length > 1) {
        this.removeAllListeners(event);
      }
      this.on(event, listener);

    }.bind(this));
  },

  run: function(offset, firstOnly) {
    offset = offset || this.offset;
    this.offset = offset;
    var self = this;

    self.emit('query:started', function(err) {

      if (err) {
        return self.emit('query:error', err);
      }

      // execute query
      sand.mysql.query(self.query, self.values.concat([offset, self.bufferSize]), function (err, rows) {

        if (err) {
          // an error occurred, so say so and exit
          return self.emit('query:error', err);
        }

        // rows counted so far
        this.rowCount += rows.length;

        // handle the rows
        self.emit('query:rows', rows, function(err) {

          // if an error occurred while handling rows, then exit
          if (err) {
            return self.emit('query:error', err);
          }

          if (rows.length >= self.bufferSize && !firstOnly) {

            // if we still have more rows, then fire the 'query:next' event
            offset = offset + self.bufferSize;
            self.emit('query:next', offset, function(err) {

              if (!err) {
                // if all is good, then continue
                self.run(offset);

              } else {
                // if err occurred, then exit
                self.emit('query:error', err);
              }
            });

          } else {
            // we have no more rows, exit
            self.emit('query:complete')
          }

        });

      });
    })

  }

});

exports = module.exports = BufferedQuery;
