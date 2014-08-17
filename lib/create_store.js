var _each = require("lodash-node/modern/collection/forEach"),
    _isFunction = require("lodash-node/modern/lang/isFunction"),
    Store = require("./store"),
    inherits = require("inherits"),
    util = require("util"),
    _extend = require("lodash-node/modern/objects/assign"),
    _isObject = require("lodash-node/modern/objects/isObject"),
    FunctionChainingError = require('./function_chaining_error');

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

    // Assign mixins first
    if (util.isArray(spec.mixins)) {
      spec.mixins.forEach(createStore.mixSpecIntoComponent.bind(null, this));
    }

    createStore.mixSpecIntoComponent(this, spec);

    if (spec.initialize) {
      spec.initialize.call(this, options);
    }
  };

  inherits(constructor, Store);
  return constructor;
};

// Define helper functions as properties on createStore so that they can be overridden.
createStore.mixSpecIntoComponent = function mixSpecIntoComponent(component, spec) {
  for (var key in spec) {

    // Actions are bound, as seen.
    if (key === "actions") {
      if (!_isObject(spec[key])) {
        throw new Error("Actions must be defined as an object.");
      }
      component.bindActions(spec[key]);
    } 

    // Functions are chained, with mixin functions being run before spec functions.
    else if (typeof spec[key] === "function") {
      // Allow users to mark a function as unchainable via 'chainable'
      if (component[key] && component[key].chainable !== false) {
        // Only functions can be chained.
        if (typeof component[key] !== "function") {
          throw new FunctionChainingError(key);
        }
        component[key] = createStore.createChainedFunction(component[key], spec[key]).bind(component);
      } else {
        component[key] = spec[key].bind(component);
        if (spec[key].chainable === false) component[key].chainable = false;
      }
    } 

    // Other values are merged. Objects are merged with _.extend() and arrays are concatenated.
    // Define a custom merge function by overriding `createStore.merge`.
    else {
      if (typeof component[key] === "function") {
        throw new FunctionChainingError(key);
      }
      component[key] = createStore.merge(component[key], spec[key]);
    }

  }
  return component;
};

createStore.createChainedFunction = function createChainedFunction(one, two) {
  return function chainedFunction() {
    one.apply(this, arguments);
    two.apply(this, arguments);
  };
};

createStore.merge = function merge(one, two) {
  if (one === undefined || one === null) {
    return two;
  } else if (two === undefined || two === null) {
    return one;
  } else if (_isObject(one) && _isObject(two)) {
    return _extend(one, two);
  } else if (util.isArray(one) && util.isArray(two)) {
    return one.concat(two);
  }
  // If types cannot be merged (strings, numbers, etc), simply override the value.
  return two;
};


module.exports = createStore;
