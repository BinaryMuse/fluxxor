var EventEmitter = require("eventemitter3"),
    inherits = require("inherits"),
    _isFunction = require("lodash-node/modern/lang/isFunction"),
    _isObject = require("lodash-node/modern/lang/isObject");

function Store(dispatcher) {
  this.dispatcher = dispatcher;
  this.__actions__ = {};
  EventEmitter.call(this);
}

inherits(Store, EventEmitter);

Store.prototype.__handleAction__ = function(action) {
  var handler;
  if (!!(handler = this.__actions__[action.type])) {
    if (_isFunction(handler)) {
      handler.call(this, action.payload, action.type);
    } else if (handler && _isFunction(this[handler])) {
      this[handler].call(this, action.payload, action.type);
    } else {
      throw new Error("The handler for action type " + action.type + " is not a function");
    }
    return true;
  } else {
    return false;
  }
};

Store.prototype.bindActions = function() {
  var actions = Array.prototype.slice.call(arguments);

  if (actions.length > 1 && actions.length % 2 !== 0) {
    throw new Error("bindActions must take an even number of arguments.");
  }

  var bindAction = function(type, handler) {
    if (!handler) {
      throw new Error("The handler for action type " + type + " is falsy");
    }

    this.__actions__[type] = handler;
  }.bind(this);

  if (actions.length === 1 && _isObject(actions[0])) {
    actions = actions[0];
    for (var key in actions) {
      if (actions.hasOwnProperty(key)) {
        bindAction(key, actions[key]);
      }
    }
  } else {
    for (var i = 0; i < actions.length; i += 2) {
      var type = actions[i],
          handler = actions[i+1];

      if (!type) {
        throw new Error("Argument " + (i+1) + " to bindActions is a falsy value");
      }

      bindAction(type, handler);
    }
  }
};

Store.prototype.waitFor = function(stores, fn) {
  this.dispatcher.waitForStores(this, stores, fn.bind(this));
};

module.exports = Store;
