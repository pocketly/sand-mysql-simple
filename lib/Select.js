/**
 * @author Adam Jaso <ajaso@pocketly.com>
 * @copyright 2014 Pocketly
 */ 


function Select() {
  this.selectOpts = '';
  this.columns = '';
  this.table = '';
  this.where = '';
  this.group = '';
  this.having = '';
  this.order = '';
  this.limit = '';
}

Select.prototype.table = function(table) {
  
};

exports = module.exports = Select;