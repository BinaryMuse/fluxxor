var Dispatcher = require("./lib/dispatcher"),
    Flux = require("./lib/flux"),
    FluxMixin = require("./lib/flux_mixin"),
    Store = require("./lib/store"),
    util = require("util");

var createStore = function(spec) {
  var constructor = function() {
    var args = Array.prototype.slice.call(arguments),
        options = args[0] || {};
    Store.call(this);
    if (spec.initialize) spec.initialize.call(this, options);

    for (key in spec) {
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
  };

  util.inherits(constructor, Store);
  return constructor;
};

var Fluxbox = {
  Dispatcher: Dispatcher,
  Flux: Flux,
  Mixin: FluxMixin,
  createStore: createStore
};

module.exports = Fluxbox;
