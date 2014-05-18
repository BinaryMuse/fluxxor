var EventEmitter = require("events").EventEmitter,
    util = require("util");

function Store(dispatcher) {
  this.dispatcher = dispatcher;
  this.__actions__ = {};
  EventEmitter.call(this);
}

util.inherits(Store, EventEmitter);

Store.prototype.__handleAction__ = function(action) {
  var handler;
  if (!!(handler = this.__actions__[action.type])) {
    if (typeof handler === "function")
      handler.call(this, action.payload, action.type);
    else if (handler && typeof this[handler] === "function")
      this[handler].call(this, action.payload, action.type);
  }
};

Store.prototype.bindActions = function() {
  var actions = Array.prototype.slice.call(arguments);
  if (actions.length % 2 !== 0) {
    throw new Error("bindActions must take an even number of arguments.");
  }

  for (var i = 0; i < actions.length; i += 2) {
    var type = actions[i],
        handler = actions[i+1];

    this.__actions__[type] = handler;
  }
};

Store.prototype.waitFor = function(stores, fn) {
  this.dispatcher.waitForStores(this, stores, fn.bind(this));
};

module.exports = Store;
