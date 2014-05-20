var _each = require("lodash-node/modern/collections/forEach"),
    Store = require("./store"),
    util = require("util");

var RESERVED_KEYS = ["flux", "waitFor"];

var createStore = function(spec) {
  _each(RESERVED_KEYS, function(key) {
    if (spec[key]) {
      throw new Error("Reserved key '" + key + "' found in store definition");
    }
  });

  var constructor = function(options) {
    options = options || {};
    Store.call(this);

    for (var key in spec) {
      if (key === "actions") {
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
