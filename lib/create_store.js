var Store = require("./store"),
    util = require("util");

var createStore = function(spec) {
  var constructor = function() {
    var args = Array.prototype.slice.call(arguments),
        options = args[0] || {};
    Store.call(this);
    this.__actions__ = {};

    for (key in spec) {
      if (key === "waitFor" || key === "flux") {
        throw new Exception("Reserved key '" + key + "' found in store");
      } else if (key === "actions") {
        this.__actions__ = spec[key];
      } else if (key === "initialize") {
        // do nothing
      } else if (typeof spec[key] === "function") {
        this[key] = spec[key].bind(this);
      } else {
        this[key] = spec[key];
      }
    }

    if (spec.initialize) spec.initialize.call(this, options);
  };

  util.inherits(constructor, Store);
  return constructor;
};

module.exports = createStore;
