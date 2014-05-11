var EventEmitter = require("events").EventEmitter,
    util = require("util");

function Store(dispatcher) {
  this.dispatcher = dispatcher;
  EventEmitter.call(this);
};

util.inherits(Store, EventEmitter);

Store.prototype.__handleAction__ = function(action) {
  var handler;
  if (handler = this.__actions__[action.type]) {
    this[handler].call(this, action.payload);
  }
};

module.exports = Store;
