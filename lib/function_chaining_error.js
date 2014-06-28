var util = require('util');

function FunctionChainingError(key) {
  Error.call(this);
  this.name = "FunctionChainingError";
  this.message = "You are attempting to define " +
            "`" + key + "` on your store more than once, but that is only supported " +
            "for functions, which are chained together.";
}

util.inherits(FunctionChainingError, Error);

module.exports = FunctionChainingError;
