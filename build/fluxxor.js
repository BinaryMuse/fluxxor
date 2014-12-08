(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["Fluxxor"] = factory();
	else
		root["Fluxxor"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/ 		
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/ 		
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 		
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 		
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/ 	
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/ 	
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/ 	
/******/ 	
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Dispatcher = __webpack_require__(2),
	    Flux = __webpack_require__(3),
	    FluxMixin = __webpack_require__(4),
	    FluxChildMixin = __webpack_require__(5),
	    StoreWatchMixin = __webpack_require__(6),
	    createStore = __webpack_require__(7);
	
	var Fluxxor = {
	  Dispatcher: Dispatcher,
	  Flux: Flux,
	  FluxMixin: FluxMixin,
	  FluxChildMixin: FluxChildMixin,
	  StoreWatchMixin: StoreWatchMixin,
	  createStore: createStore,
	  version: __webpack_require__(1)
	};
	
	module.exports = Fluxxor;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = "1.5.1"

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var _clone = __webpack_require__(12),
	    _mapValues = __webpack_require__(13),
	    _forOwn = __webpack_require__(14),
	    _intersection = __webpack_require__(19),
	    _keys = __webpack_require__(15),
	    _map = __webpack_require__(21),
	    _each = __webpack_require__(22),
	    _size = __webpack_require__(23),
	    _findKey = __webpack_require__(16),
	    _uniq = __webpack_require__(20);
	
	var Dispatcher = function(stores) {
	  this.stores = {};
	  this.currentDispatch = null;
	  this.currentActionType = null;
	  this.waitingToDispatch = [];
	
	  for (var key in stores) {
	    if (stores.hasOwnProperty(key)) {
	      this.addStore(key, stores[key]);
	    }
	  }
	};
	
	Dispatcher.prototype.addStore = function(name, store) {
	  store.dispatcher = this;
	  this.stores[name] = store;
	};
	
	Dispatcher.prototype.dispatch = function(action) {
	  if (!action || !action.type) {
	    throw new Error("Can only dispatch actions with a 'type' property");
	  }
	
	  if (this.currentDispatch) {
	    var complaint = "Cannot dispatch an action ('" + action.type + "') while another action ('" +
	                    this.currentActionType + "') is being dispatched";
	    throw new Error(complaint);
	  }
	
	  this.waitingToDispatch = _clone(this.stores);
	
	  this.currentActionType = action.type;
	  this.currentDispatch = _mapValues(this.stores, function() {
	    return { resolved: false, waitingOn: [], waitCallback: null };
	  });
	
	  try {
	    this.doDispatchLoop(action);
	  } finally {
	    this.currentActionType = null;
	    this.currentDispatch = null;
	  }
	};
	
	Dispatcher.prototype.doDispatchLoop = function(action) {
	  var dispatch, canBeDispatchedTo, wasHandled = false,
	      removeFromDispatchQueue = [], dispatchedThisLoop = [];
	
	  _forOwn(this.waitingToDispatch, function(value, key) {
	    dispatch = this.currentDispatch[key];
	    canBeDispatchedTo = !dispatch.waitingOn.length ||
	      !_intersection(dispatch.waitingOn, _keys(this.waitingToDispatch)).length;
	    if (canBeDispatchedTo) {
	      if (dispatch.waitCallback) {
	        var stores = _map(dispatch.waitingOn, function(key) {
	          return this.stores[key];
	        }, this);
	        var fn = dispatch.waitCallback;
	        dispatch.waitCallback = null;
	        dispatch.waitingOn = [];
	        dispatch.resolved = true;
	        fn.apply(null, stores);
	        wasHandled = true;
	      } else {
	        dispatch.resolved = true;
	        var handled = this.stores[key].__handleAction__(action);
	        if (handled) {
	          wasHandled = true;
	        }
	      }
	
	      dispatchedThisLoop.push(key);
	
	      if (this.currentDispatch[key].resolved) {
	        removeFromDispatchQueue.push(key);
	      }
	    }
	  }, this);
	
	  if (_keys(this.waitingToDispatch).length && !dispatchedThisLoop.length) {
	    var storesWithCircularWaits = _keys(this.waitingToDispatch).join(", ");
	    throw new Error("Indirect circular wait detected among: " + storesWithCircularWaits);
	  }
	
	  _each(removeFromDispatchQueue, function(key) {
	    delete this.waitingToDispatch[key];
	  }, this);
	
	  if (_size(this.waitingToDispatch)) {
	    this.doDispatchLoop(action);
	  }
	
	  if (!wasHandled && console && console.warn) {
	    console.warn("An action of type " + action.type + " was dispatched, but no store handled it");
	  }
	
	};
	
	Dispatcher.prototype.waitForStores = function(store, stores, fn) {
	  if (!this.currentDispatch) {
	    throw new Error("Cannot wait unless an action is being dispatched");
	  }
	
	  var waitingStoreName = _findKey(this.stores, function(val) {
	    return val === store;
	  });
	
	  if (stores.indexOf(waitingStoreName) > -1) {
	    throw new Error("A store cannot wait on itself");
	  }
	
	  var dispatch = this.currentDispatch[waitingStoreName];
	
	  if (dispatch.waitingOn.length) {
	    throw new Error(waitingStoreName + " already waiting on stores");
	  }
	
	  _each(stores, function(storeName) {
	    var storeDispatch = this.currentDispatch[storeName];
	    if (!this.stores[storeName]) {
	      throw new Error("Cannot wait for non-existent store " + storeName);
	    }
	    if (storeDispatch.waitingOn.indexOf(waitingStoreName) > -1) {
	      throw new Error("Circular wait detected between " + waitingStoreName + " and " + storeName);
	    }
	  }, this);
	
	  dispatch.resolved = false;
	  dispatch.waitingOn = _uniq(dispatch.waitingOn.concat(stores));
	  dispatch.waitCallback = fn;
	};
	
	module.exports = Dispatcher;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var EventEmitter = __webpack_require__(9),
	    inherits = __webpack_require__(11),
	    objectPath = __webpack_require__(10),
	    _each = __webpack_require__(22),
	    _reduce = __webpack_require__(24),
	    _isFunction = __webpack_require__(17),
	    _isString = __webpack_require__(18);
	
	var Dispatcher = __webpack_require__(2);
	
	var findLeaves = function(obj, path, callback) {
	  path = path || [];
	
	  for (var key in obj) {
	    if (obj.hasOwnProperty(key)) {
	      if (_isFunction(obj[key])) {
	        callback(path.concat(key), obj[key]);
	      } else {
	        findLeaves(obj[key], path.concat(key), callback);
	      }
	    }
	  }
	};
	
	var Flux = function(stores, actions) {
	  EventEmitter.call(this);
	  this.dispatcher = new Dispatcher(stores);
	  this.actions = {};
	  this.stores = {};
	
	  var dispatcher = this.dispatcher;
	  var flux = this;
	  this.dispatchBinder = {
	    flux: flux,
	    dispatch: function(type, payload) {
	      try {
	        flux.emit("dispatch", type, payload);
	      } finally {
	        dispatcher.dispatch({type: type, payload: payload});
	      }
	    }
	  };
	
	  this.addActions(actions);
	  this.addStores(stores);
	};
	
	inherits(Flux, EventEmitter);
	
	Flux.prototype.addActions = function(actions) {
	  findLeaves(actions, [], this.addAction.bind(this));
	};
	
	// addAction has two signatures:
	// 1: string[, string, string, string...], actionFunction
	// 2: arrayOfStrings, actionFunction
	Flux.prototype.addAction = function() {
	  if (arguments.length < 2) {
	    throw new Error("addAction requires at least two arguments, a string (or array of strings) and a function");
	  }
	
	  var args = Array.prototype.slice.call(arguments);
	
	  if (!_isFunction(args[args.length - 1])) {
	    throw new Error("The last argument to addAction must be a function");
	  }
	
	  var func = args.pop().bind(this.dispatchBinder);
	
	  if (!_isString(args[0])) {
	    args = args[0];
	  }
	
	  var leadingPaths = _reduce(args, function(acc, next) {
	    if (acc) {
	      var nextPath = acc[acc.length - 1].concat([next]);
	      return acc.concat([nextPath]);
	    } else {
	      return [[next]];
	    }
	  }, null);
	
	  // Detect trying to replace a function at any point in the path
	  _each(leadingPaths, function(path) {
	    if (_isFunction(objectPath.get(this.actions, path))) {
	      throw new Error("An action named " + args.join(".") + " already exists");
	    }
	  }, this);
	
	  // Detect trying to replace a namespace at the final point in the path
	  if (objectPath.get(this.actions, args)) {
	    throw new Error("A namespace named " + args.join(".") + " already exists");
	  }
	
	  objectPath.set(this.actions, args, func, true);
	};
	
	Flux.prototype.store = function(name) {
	  return this.stores[name];
	};
	
	Flux.prototype.addStore = function(name, store) {
	  if (name in this.stores) {
	    throw new Error("A store named '" + name + "' already exists");
	  }
	  store.flux = this;
	  this.stores[name] = store;
	  this.dispatcher.addStore(name, store);
	};
	
	Flux.prototype.addStores = function(stores) {
	  for (var key in stores) {
	    if (stores.hasOwnProperty(key)) {
	      this.addStore(key, stores[key]);
	    }
	  }
	};
	
	module.exports = Flux;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var FluxMixin = function(React) {
	  return {
	    componentWillMount: function() {
	      if (!this.props.flux && (!this.context || !this.context.flux)) {
	        var namePart = this.constructor.displayName ? " of " + this.constructor.displayName : "";
	        throw new Error("Could not find flux on this.props or this.context" + namePart);
	      }
	    },
	
	    childContextTypes: {
	      flux: React.PropTypes.object
	    },
	
	    contextTypes: {
	      flux: React.PropTypes.object
	    },
	
	    getChildContext: function() {
	      return {
	        flux: this.getFlux()
	      };
	    },
	
	    getFlux: function() {
	      return this.props.flux || (this.context && this.context.flux);
	    }
	  };
	};
	
	FluxMixin.componentWillMount = function() {
	  throw new Error("Fluxxor.FluxMixin is a function that takes React as a " +
	    "parameter and returns the mixin, e.g.: mixins[Fluxxor.FluxMixin(React)]");
	};
	
	module.exports = FluxMixin;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var FluxChildMixin = function(React) {
	  return {
	    componentWillMount: function() {
	      if (console && console.warn) {
	        var namePart = this.constructor.displayName ? " in " + this.constructor.displayName : "",
	            message = "Fluxxor.FluxChildMixin was found in use" + namePart + ", " +
	                      "but has been deprecated. Use Fluxxor.FluxMixin instead.";
	        console.warn(message);
	      }
	    },
	
	    contextTypes: {
	      flux: React.PropTypes.object
	    },
	
	    getFlux: function() {
	      return this.context.flux;
	    }
	  };
	};
	
	FluxChildMixin.componentWillMount = function() {
	  throw new Error("Fluxxor.FluxChildMixin is a function that takes React as a " +
	    "parameter and returns the mixin, e.g.: mixins[Fluxxor.FluxChildMixin(React)]");
	};
	
	module.exports = FluxChildMixin;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var _each = __webpack_require__(22);
	
	var StoreWatchMixin = function() {
	  var storeNames = Array.prototype.slice.call(arguments);
	  return {
	    componentDidMount: function() {
	      var flux = this.props.flux || this.context.flux;
	      _each(storeNames, function(store) {
	        flux.store(store).on("change", this._setStateFromFlux);
	      }, this);
	    },
	
	    componentWillUnmount: function() {
	      var flux = this.props.flux || this.context.flux;
	      _each(storeNames, function(store) {
	        flux.store(store).removeListener("change", this._setStateFromFlux);
	      }, this);
	    },
	
	    _setStateFromFlux: function() {
	      if(this.isMounted()) {
	        this.setState(this.getStateFromFlux());
	      }
	    },
	
	    getInitialState: function() {
	      return this.getStateFromFlux();
	    }
	  };
	};
	
	StoreWatchMixin.componentWillMount = function() {
	  throw new Error("Fluxxor.StoreWatchMixin is a function that takes one or more " +
	    "store names as parameters and returns the mixin, e.g.: " +
	    "mixins[Fluxxor.StoreWatchMixin(\"Store1\", \"Store2\")]");
	};
	
	module.exports = StoreWatchMixin;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var _each = __webpack_require__(22),
	    _isFunction = __webpack_require__(17),
	    Store = __webpack_require__(8),
	    inherits = __webpack_require__(11);
	
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
	        this.bindActions(spec[key]);
	      } else if (key === "initialize") {
	        // do nothing
	      } else if (_isFunction(spec[key])) {
	        this[key] = spec[key].bind(this);
	      } else {
	        this[key] = spec[key];
	      }
	    }
	
	    if (spec.initialize) {
	      spec.initialize.call(this, options);
	    }
	  };
	
	  inherits(constructor, Store);
	  return constructor;
	};
	
	module.exports = createStore;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var EventEmitter = __webpack_require__(9),
	    inherits = __webpack_require__(11),
	    _isFunction = __webpack_require__(17),
	    _isObject = __webpack_require__(25);
	
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


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	/**
	 * Representation of a single EventEmitter function.
	 *
	 * @param {Function} fn Event handler to be called.
	 * @param {Mixed} context Context for function execution.
	 * @param {Boolean} once Only emit once
	 * @api private
	 */
	function EE(fn, context, once) {
	  this.fn = fn;
	  this.context = context;
	  this.once = once || false;
	}
	
	/**
	 * Minimal EventEmitter interface that is molded against the Node.js
	 * EventEmitter interface.
	 *
	 * @constructor
	 * @api public
	 */
	function EventEmitter() { /* Nothing to set */ }
	
	/**
	 * Holds the assigned EventEmitters by name.
	 *
	 * @type {Object}
	 * @private
	 */
	EventEmitter.prototype._events = undefined;
	
	/**
	 * Return a list of assigned event listeners.
	 *
	 * @param {String} event The events that should be listed.
	 * @returns {Array}
	 * @api public
	 */
	EventEmitter.prototype.listeners = function listeners(event) {
	  if (!this._events || !this._events[event]) return [];
	
	  for (var i = 0, l = this._events[event].length, ee = []; i < l; i++) {
	    ee.push(this._events[event][i].fn);
	  }
	
	  return ee;
	};
	
	/**
	 * Emit an event to all registered event listeners.
	 *
	 * @param {String} event The name of the event.
	 * @returns {Boolean} Indication if we've emitted an event.
	 * @api public
	 */
	EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
	  if (!this._events || !this._events[event]) return false;
	
	  var listeners = this._events[event]
	    , length = listeners.length
	    , len = arguments.length
	    , ee = listeners[0]
	    , args
	    , i, j;
	
	  if (1 === length) {
	    if (ee.once) this.removeListener(event, ee.fn, true);
	
	    switch (len) {
	      case 1: return ee.fn.call(ee.context), true;
	      case 2: return ee.fn.call(ee.context, a1), true;
	      case 3: return ee.fn.call(ee.context, a1, a2), true;
	      case 4: return ee.fn.call(ee.context, a1, a2, a3), true;
	      case 5: return ee.fn.call(ee.context, a1, a2, a3, a4), true;
	      case 6: return ee.fn.call(ee.context, a1, a2, a3, a4, a5), true;
	    }
	
	    for (i = 1, args = new Array(len -1); i < len; i++) {
	      args[i - 1] = arguments[i];
	    }
	
	    ee.fn.apply(ee.context, args);
	  } else {
	    for (i = 0; i < length; i++) {
	      if (listeners[i].once) this.removeListener(event, listeners[i].fn, true);
	
	      switch (len) {
	        case 1: listeners[i].fn.call(listeners[i].context); break;
	        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
	        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
	        default:
	          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
	            args[j - 1] = arguments[j];
	          }
	
	          listeners[i].fn.apply(listeners[i].context, args);
	      }
	    }
	  }
	
	  return true;
	};
	
	/**
	 * Register a new EventListener for the given event.
	 *
	 * @param {String} event Name of the event.
	 * @param {Functon} fn Callback function.
	 * @param {Mixed} context The context of the function.
	 * @api public
	 */
	EventEmitter.prototype.on = function on(event, fn, context) {
	  if (!this._events) this._events = {};
	  if (!this._events[event]) this._events[event] = [];
	  this._events[event].push(new EE( fn, context || this ));
	
	  return this;
	};
	
	/**
	 * Add an EventListener that's only called once.
	 *
	 * @param {String} event Name of the event.
	 * @param {Function} fn Callback function.
	 * @param {Mixed} context The context of the function.
	 * @api public
	 */
	EventEmitter.prototype.once = function once(event, fn, context) {
	  if (!this._events) this._events = {};
	  if (!this._events[event]) this._events[event] = [];
	  this._events[event].push(new EE(fn, context || this, true ));
	
	  return this;
	};
	
	/**
	 * Remove event listeners.
	 *
	 * @param {String} event The event we want to remove.
	 * @param {Function} fn The listener that we need to find.
	 * @param {Boolean} once Only remove once listeners.
	 * @api public
	 */
	EventEmitter.prototype.removeListener = function removeListener(event, fn, once) {
	  if (!this._events || !this._events[event]) return this;
	
	  var listeners = this._events[event]
	    , events = [];
	
	  if (fn) for (var i = 0, length = listeners.length; i < length; i++) {
	    if (listeners[i].fn !== fn && listeners[i].once !== once) {
	      events.push(listeners[i]);
	    }
	  }
	
	  //
	  // Reset the array, or remove it completely if we have no more listeners.
	  //
	  if (events.length) this._events[event] = events;
	  else this._events[event] = null;
	
	  return this;
	};
	
	/**
	 * Remove all listeners or only the listeners for the specified event.
	 *
	 * @param {String} event The event want to remove all listeners for.
	 * @api public
	 */
	EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
	  if (!this._events) return this;
	
	  if (event) this._events[event] = null;
	  else this._events = {};
	
	  return this;
	};
	
	//
	// Alias methods names because people roll like that.
	//
	EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
	EventEmitter.prototype.addListener = EventEmitter.prototype.on;
	
	//
	// This function doesn't apply anymore.
	//
	EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
	  return this;
	};
	
	//
	// Expose the module.
	//
	EventEmitter.EventEmitter = EventEmitter;
	EventEmitter.EventEmitter2 = EventEmitter;
	EventEmitter.EventEmitter3 = EventEmitter;
	
	if ('object' === typeof module && module.exports) {
	  module.exports = EventEmitter;
	}


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (root, factory){
	  'use strict';
	
	  /*istanbul ignore next:cant test*/
	  if (typeof module === 'object' && typeof module.exports === 'object') {
	    module.exports = factory();
	  } else if (true) {
	    // AMD. Register as an anonymous module.
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else {
	    // Browser globals
	    root.objectPath = factory();
	  }
	})(this, function(){
	  'use strict';
	
	  var
	    toStr = Object.prototype.toString,
	    _hasOwnProperty = Object.prototype.hasOwnProperty;
	
	  function isEmpty(value){
	    if (!value) {
	      return true;
	    }
	    if (isArray(value) && value.length === 0) {
	      return true;
	    } else {
	      for (var i in value) {
	        if (_hasOwnProperty.call(value, i)) {
	          return false;
	        }
	      }
	      return true;
	    }
	  }
	
	  function toString(type){
	    return toStr.call(type);
	  }
	
	  function isNumber(value){
	    return typeof value === 'number' || toString(value) === "[object Number]";
	  }
	
	  function isString(obj){
	    return typeof obj === 'string' || toString(obj) === "[object String]";
	  }
	
	  function isObject(obj){
	    return typeof obj === 'object' && toString(obj) === "[object Object]";
	  }
	
	  function isArray(obj){
	    return typeof obj === 'object' && typeof obj.length === 'number' && toString(obj) === '[object Array]';
	  }
	
	  function isBoolean(obj){
	    return typeof obj === 'boolean' || toString(obj) === '[object Boolean]';
	  }
	
	  function getKey(key){
	    var intKey = parseInt(key);
	    if (intKey.toString() === key) {
	      return intKey;
	    }
	    return key;
	  }
	
	  function set(obj, path, value, doNotReplace){
	    if (isNumber(path)) {
	      path = [path];
	    }
	    if (isEmpty(path)) {
	      return obj;
	    }
	    if (isString(path)) {
	      return set(obj, path.split('.'), value, doNotReplace);
	    }
	    var currentPath = getKey(path[0]);
	
	    if (path.length === 1) {
	      var oldVal = obj[currentPath];
	      if (oldVal === void 0 || !doNotReplace) {
	        obj[currentPath] = value;
	      }
	      return oldVal;
	    }
	
	    if (obj[currentPath] === void 0) {
	      if (isNumber(currentPath)) {
	        obj[currentPath] = [];
	      } else {
	        obj[currentPath] = {};
	      }
	    }
	
	    return set(obj[currentPath], path.slice(1), value, doNotReplace);
	  }
	
	  function del(obj, path) {
	    if (isNumber(path)) {
	      path = [path];
	    }
	
	    if (isEmpty(obj)) {
	      return void 0;
	    }
	
	    if (isEmpty(path)) {
	      return obj;
	    }
	    if(isString(path)) {
	      return del(obj, path.split('.'));
	    }
	
	    var currentPath = getKey(path[0]);
	    var oldVal = obj[currentPath];
	
	    if(path.length === 1) {
	      if (oldVal !== void 0) {
	        if (isArray(obj)) {
	          obj.splice(currentPath, 1);
	        } else {
	          delete obj[currentPath];
	        }
	      }
	    } else {
	      if (obj[currentPath] !== void 0) {
	        return del(obj[currentPath], path.slice(1));
	      }
	    }
	
	    return obj;
	  }
	
	  var objectPath = {};
	
	  objectPath.ensureExists = function (obj, path, value){
	    return set(obj, path, value, true);
	  };
	
	  objectPath.set = function (obj, path, value, doNotReplace){
	    return set(obj, path, value, doNotReplace);
	  };
	
	  objectPath.insert = function (obj, path, value, at){
	    var arr = objectPath.get(obj, path);
	    at = ~~at;
	    if (!isArray(arr)) {
	      arr = [];
	      objectPath.set(obj, path, arr);
	    }
	    arr.splice(at, 0, value);
	  };
	
	  objectPath.empty = function(obj, path) {
	    if (isEmpty(path)) {
	      return obj;
	    }
	    if (isEmpty(obj)) {
	      return void 0;
	    }
	
	    var value, i;
	    if (!(value = objectPath.get(obj, path))) {
	      return obj;
	    }
	
	    if (isString(value)) {
	      return objectPath.set(obj, path, '');
	    } else if (isBoolean(value)) {
	      return objectPath.set(obj, path, false);
	    } else if (isNumber(value)) {
	      return objectPath.set(obj, path, 0);
	    } else if (isArray(value)) {
	      value.length = 0;
	    } else if (isObject(value)) {
	      for (i in value) {
	        if (_hasOwnProperty.call(value, i)) {
	          delete value[i];
	        }
	      }
	    } else {
	      return objectPath.set(obj, path, null);
	    }
	  };
	
	  objectPath.push = function (obj, path /*, values */){
	    var arr = objectPath.get(obj, path);
	    if (!isArray(arr)) {
	      arr = [];
	      objectPath.set(obj, path, arr);
	    }
	
	    arr.push.apply(arr, Array.prototype.slice.call(arguments, 2));
	  };
	
	  objectPath.coalesce = function (obj, paths, defaultValue) {
	    var value;
	
	    for (var i = 0, len = paths.length; i < len; i++) {
	      if ((value = objectPath.get(obj, paths[i])) !== void 0) {
	        return value;
	      }
	    }
	
	    return defaultValue;
	  };
	
	  objectPath.get = function (obj, path, defaultValue){
	    if (isNumber(path)) {
	      path = [path];
	    }
	    if (isEmpty(path)) {
	      return obj;
	    }
	    if (isEmpty(obj)) {
	      return defaultValue;
	    }
	    if (isString(path)) {
	      return objectPath.get(obj, path.split('.'), defaultValue);
	    }
	
	    var currentPath = getKey(path[0]);
	
	    if (path.length === 1) {
	      if (obj[currentPath] === void 0) {
	        return defaultValue;
	      }
	      return obj[currentPath];
	    }
	
	    return objectPath.get(obj[currentPath], path.slice(1), defaultValue);
	  };
	
	  objectPath.del = function(obj, path) {
	    return del(obj, path);
	  };
	
	  return objectPath;
	});

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var baseClone = __webpack_require__(28),
	    baseCreateCallback = __webpack_require__(29);
	
	/**
	 * Creates a clone of `value`. If `isDeep` is `true` nested objects will also
	 * be cloned, otherwise they will be assigned by reference. If a callback
	 * is provided it will be executed to produce the cloned values. If the
	 * callback returns `undefined` cloning will be handled by the method instead.
	 * The callback is bound to `thisArg` and invoked with one argument; (value).
	 *
	 * @static
	 * @memberOf _
	 * @category Objects
	 * @param {*} value The value to clone.
	 * @param {boolean} [isDeep=false] Specify a deep clone.
	 * @param {Function} [callback] The function to customize cloning values.
	 * @param {*} [thisArg] The `this` binding of `callback`.
	 * @returns {*} Returns the cloned value.
	 * @example
	 *
	 * var characters = [
	 *   { 'name': 'barney', 'age': 36 },
	 *   { 'name': 'fred',   'age': 40 }
	 * ];
	 *
	 * var shallow = _.clone(characters);
	 * shallow[0] === characters[0];
	 * // => true
	 *
	 * var deep = _.clone(characters, true);
	 * deep[0] === characters[0];
	 * // => false
	 *
	 * _.mixin({
	 *   'clone': _.partialRight(_.clone, function(value) {
	 *     return _.isElement(value) ? value.cloneNode(false) : undefined;
	 *   })
	 * });
	 *
	 * var clone = _.clone(document.body);
	 * clone.childNodes.length;
	 * // => 0
	 */
	function clone(value, isDeep, callback, thisArg) {
	  // allows working with "Collections" methods without using their `index`
	  // and `collection` arguments for `isDeep` and `callback`
	  if (typeof isDeep != 'boolean' && isDeep != null) {
	    thisArg = callback;
	    callback = isDeep;
	    isDeep = false;
	  }
	  return baseClone(value, isDeep, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
	}
	
	module.exports = clone;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var createCallback = __webpack_require__(41),
	    forOwn = __webpack_require__(14);
	
	/**
	 * Creates an object with the same keys as `object` and values generated by
	 * running each own enumerable property of `object` through the callback.
	 * The callback is bound to `thisArg` and invoked with three arguments;
	 * (value, key, object).
	 *
	 * If a property name is provided for `callback` the created "_.pluck" style
	 * callback will return the property value of the given element.
	 *
	 * If an object is provided for `callback` the created "_.where" style callback
	 * will return `true` for elements that have the properties of the given object,
	 * else `false`.
	 *
	 * @static
	 * @memberOf _
	 * @category Objects
	 * @param {Object} object The object to iterate over.
	 * @param {Function|Object|string} [callback=identity] The function called
	 *  per iteration. If a property name or object is provided it will be used
	 *  to create a "_.pluck" or "_.where" style callback, respectively.
	 * @param {*} [thisArg] The `this` binding of `callback`.
	 * @returns {Array} Returns a new object with values of the results of each `callback` execution.
	 * @example
	 *
	 * _.mapValues({ 'a': 1, 'b': 2, 'c': 3} , function(num) { return num * 3; });
	 * // => { 'a': 3, 'b': 6, 'c': 9 }
	 *
	 * var characters = {
	 *   'fred': { 'name': 'fred', 'age': 40 },
	 *   'pebbles': { 'name': 'pebbles', 'age': 1 }
	 * };
	 *
	 * // using "_.pluck" callback shorthand
	 * _.mapValues(characters, 'age');
	 * // => { 'fred': 40, 'pebbles': 1 }
	 */
	function mapValues(object, callback, thisArg) {
	  var result = {};
	  callback = createCallback(callback, thisArg, 3);
	
	  forOwn(object, function(value, key, object) {
	    result[key] = callback(value, key, object);
	  });
	  return result;
	}
	
	module.exports = mapValues;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var baseCreateCallback = __webpack_require__(29),
	    keys = __webpack_require__(15),
	    objectTypes = __webpack_require__(30);
	
	/**
	 * Iterates over own enumerable properties of an object, executing the callback
	 * for each property. The callback is bound to `thisArg` and invoked with three
	 * arguments; (value, key, object). Callbacks may exit iteration early by
	 * explicitly returning `false`.
	 *
	 * @static
	 * @memberOf _
	 * @type Function
	 * @category Objects
	 * @param {Object} object The object to iterate over.
	 * @param {Function} [callback=identity] The function called per iteration.
	 * @param {*} [thisArg] The `this` binding of `callback`.
	 * @returns {Object} Returns `object`.
	 * @example
	 *
	 * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
	 *   console.log(key);
	 * });
	 * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
	 */
	var forOwn = function(collection, callback, thisArg) {
	  var index, iterable = collection, result = iterable;
	  if (!iterable) return result;
	  if (!objectTypes[typeof iterable]) return result;
	  callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
	    var ownIndex = -1,
	        ownProps = objectTypes[typeof iterable] && keys(iterable),
	        length = ownProps ? ownProps.length : 0;
	
	    while (++ownIndex < length) {
	      index = ownProps[ownIndex];
	      if (callback(iterable[index], index, collection) === false) return result;
	    }
	  return result
	};
	
	module.exports = forOwn;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var isNative = __webpack_require__(31),
	    isObject = __webpack_require__(25),
	    shimKeys = __webpack_require__(32);
	
	/* Native method shortcuts for methods with the same name as other `lodash` methods */
	var nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys;
	
	/**
	 * Creates an array composed of the own enumerable property names of an object.
	 *
	 * @static
	 * @memberOf _
	 * @category Objects
	 * @param {Object} object The object to inspect.
	 * @returns {Array} Returns an array of property names.
	 * @example
	 *
	 * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
	 * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
	 */
	var keys = !nativeKeys ? shimKeys : function(object) {
	  if (!isObject(object)) {
	    return [];
	  }
	  return nativeKeys(object);
	};
	
	module.exports = keys;


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var createCallback = __webpack_require__(41),
	    forOwn = __webpack_require__(14);
	
	/**
	 * This method is like `_.findIndex` except that it returns the key of the
	 * first element that passes the callback check, instead of the element itself.
	 *
	 * If a property name is provided for `callback` the created "_.pluck" style
	 * callback will return the property value of the given element.
	 *
	 * If an object is provided for `callback` the created "_.where" style callback
	 * will return `true` for elements that have the properties of the given object,
	 * else `false`.
	 *
	 * @static
	 * @memberOf _
	 * @category Objects
	 * @param {Object} object The object to search.
	 * @param {Function|Object|string} [callback=identity] The function called per
	 *  iteration. If a property name or object is provided it will be used to
	 *  create a "_.pluck" or "_.where" style callback, respectively.
	 * @param {*} [thisArg] The `this` binding of `callback`.
	 * @returns {string|undefined} Returns the key of the found element, else `undefined`.
	 * @example
	 *
	 * var characters = {
	 *   'barney': {  'age': 36, 'blocked': false },
	 *   'fred': {    'age': 40, 'blocked': true },
	 *   'pebbles': { 'age': 1,  'blocked': false }
	 * };
	 *
	 * _.findKey(characters, function(chr) {
	 *   return chr.age < 40;
	 * });
	 * // => 'barney' (property order is not guaranteed across environments)
	 *
	 * // using "_.where" callback shorthand
	 * _.findKey(characters, { 'age': 1 });
	 * // => 'pebbles'
	 *
	 * // using "_.pluck" callback shorthand
	 * _.findKey(characters, 'blocked');
	 * // => 'fred'
	 */
	function findKey(object, callback, thisArg) {
	  var result;
	  callback = createCallback(callback, thisArg, 3);
	  forOwn(object, function(value, key, object) {
	    if (callback(value, key, object)) {
	      result = key;
	      return false;
	    }
	  });
	  return result;
	}
	
	module.exports = findKey;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	
	/**
	 * Checks if `value` is a function.
	 *
	 * @static
	 * @memberOf _
	 * @category Objects
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 */
	function isFunction(value) {
	  return typeof value == 'function';
	}
	
	module.exports = isFunction;


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	
	/** `Object#toString` result shortcuts */
	var stringClass = '[object String]';
	
	/** Used for native method references */
	var objectProto = Object.prototype;
	
	/** Used to resolve the internal [[Class]] of values */
	var toString = objectProto.toString;
	
	/**
	 * Checks if `value` is a string.
	 *
	 * @static
	 * @memberOf _
	 * @category Objects
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
	 * @example
	 *
	 * _.isString('fred');
	 * // => true
	 */
	function isString(value) {
	  return typeof value == 'string' ||
	    value && typeof value == 'object' && toString.call(value) == stringClass || false;
	}
	
	module.exports = isString;


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var baseIndexOf = __webpack_require__(33),
	    cacheIndexOf = __webpack_require__(34),
	    createCache = __webpack_require__(35),
	    getArray = __webpack_require__(36),
	    isArguments = __webpack_require__(26),
	    isArray = __webpack_require__(27),
	    largeArraySize = __webpack_require__(37),
	    releaseArray = __webpack_require__(38),
	    releaseObject = __webpack_require__(39);
	
	/**
	 * Creates an array of unique values present in all provided arrays using
	 * strict equality for comparisons, i.e. `===`.
	 *
	 * @static
	 * @memberOf _
	 * @category Arrays
	 * @param {...Array} [array] The arrays to inspect.
	 * @returns {Array} Returns an array of shared values.
	 * @example
	 *
	 * _.intersection([1, 2, 3], [5, 2, 1, 4], [2, 1]);
	 * // => [1, 2]
	 */
	function intersection() {
	  var args = [],
	      argsIndex = -1,
	      argsLength = arguments.length,
	      caches = getArray(),
	      indexOf = baseIndexOf,
	      trustIndexOf = indexOf === baseIndexOf,
	      seen = getArray();
	
	  while (++argsIndex < argsLength) {
	    var value = arguments[argsIndex];
	    if (isArray(value) || isArguments(value)) {
	      args.push(value);
	      caches.push(trustIndexOf && value.length >= largeArraySize &&
	        createCache(argsIndex ? args[argsIndex] : seen));
	    }
	  }
	  var array = args[0],
	      index = -1,
	      length = array ? array.length : 0,
	      result = [];
	
	  outer:
	  while (++index < length) {
	    var cache = caches[0];
	    value = array[index];
	
	    if ((cache ? cacheIndexOf(cache, value) : indexOf(seen, value)) < 0) {
	      argsIndex = argsLength;
	      (cache || seen).push(value);
	      while (--argsIndex) {
	        cache = caches[argsIndex];
	        if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value)) < 0) {
	          continue outer;
	        }
	      }
	      result.push(value);
	    }
	  }
	  while (argsLength--) {
	    cache = caches[argsLength];
	    if (cache) {
	      releaseObject(cache);
	    }
	  }
	  releaseArray(caches);
	  releaseArray(seen);
	  return result;
	}
	
	module.exports = intersection;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var baseUniq = __webpack_require__(40),
	    createCallback = __webpack_require__(41);
	
	/**
	 * Creates a duplicate-value-free version of an array using strict equality
	 * for comparisons, i.e. `===`. If the array is sorted, providing
	 * `true` for `isSorted` will use a faster algorithm. If a callback is provided
	 * each element of `array` is passed through the callback before uniqueness
	 * is computed. The callback is bound to `thisArg` and invoked with three
	 * arguments; (value, index, array).
	 *
	 * If a property name is provided for `callback` the created "_.pluck" style
	 * callback will return the property value of the given element.
	 *
	 * If an object is provided for `callback` the created "_.where" style callback
	 * will return `true` for elements that have the properties of the given object,
	 * else `false`.
	 *
	 * @static
	 * @memberOf _
	 * @alias unique
	 * @category Arrays
	 * @param {Array} array The array to process.
	 * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
	 * @param {Function|Object|string} [callback=identity] The function called
	 *  per iteration. If a property name or object is provided it will be used
	 *  to create a "_.pluck" or "_.where" style callback, respectively.
	 * @param {*} [thisArg] The `this` binding of `callback`.
	 * @returns {Array} Returns a duplicate-value-free array.
	 * @example
	 *
	 * _.uniq([1, 2, 1, 3, 1]);
	 * // => [1, 2, 3]
	 *
	 * _.uniq([1, 1, 2, 2, 3], true);
	 * // => [1, 2, 3]
	 *
	 * _.uniq(['A', 'b', 'C', 'a', 'B', 'c'], function(letter) { return letter.toLowerCase(); });
	 * // => ['A', 'b', 'C']
	 *
	 * _.uniq([1, 2.5, 3, 1.5, 2, 3.5], function(num) { return this.floor(num); }, Math);
	 * // => [1, 2.5, 3]
	 *
	 * // using "_.pluck" callback shorthand
	 * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
	 * // => [{ 'x': 1 }, { 'x': 2 }]
	 */
	function uniq(array, isSorted, callback, thisArg) {
	  // juggle arguments
	  if (typeof isSorted != 'boolean' && isSorted != null) {
	    thisArg = callback;
	    callback = (typeof isSorted != 'function' && thisArg && thisArg[isSorted] === array) ? null : isSorted;
	    isSorted = false;
	  }
	  if (callback != null) {
	    callback = createCallback(callback, thisArg, 3);
	  }
	  return baseUniq(array, isSorted, callback);
	}
	
	module.exports = uniq;


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var createCallback = __webpack_require__(41),
	    forOwn = __webpack_require__(14);
	
	/**
	 * Creates an array of values by running each element in the collection
	 * through the callback. The callback is bound to `thisArg` and invoked with
	 * three arguments; (value, index|key, collection).
	 *
	 * If a property name is provided for `callback` the created "_.pluck" style
	 * callback will return the property value of the given element.
	 *
	 * If an object is provided for `callback` the created "_.where" style callback
	 * will return `true` for elements that have the properties of the given object,
	 * else `false`.
	 *
	 * @static
	 * @memberOf _
	 * @alias collect
	 * @category Collections
	 * @param {Array|Object|string} collection The collection to iterate over.
	 * @param {Function|Object|string} [callback=identity] The function called
	 *  per iteration. If a property name or object is provided it will be used
	 *  to create a "_.pluck" or "_.where" style callback, respectively.
	 * @param {*} [thisArg] The `this` binding of `callback`.
	 * @returns {Array} Returns a new array of the results of each `callback` execution.
	 * @example
	 *
	 * _.map([1, 2, 3], function(num) { return num * 3; });
	 * // => [3, 6, 9]
	 *
	 * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });
	 * // => [3, 6, 9] (property order is not guaranteed across environments)
	 *
	 * var characters = [
	 *   { 'name': 'barney', 'age': 36 },
	 *   { 'name': 'fred',   'age': 40 }
	 * ];
	 *
	 * // using "_.pluck" callback shorthand
	 * _.map(characters, 'name');
	 * // => ['barney', 'fred']
	 */
	function map(collection, callback, thisArg) {
	  var index = -1,
	      length = collection ? collection.length : 0;
	
	  callback = createCallback(callback, thisArg, 3);
	  if (typeof length == 'number') {
	    var result = Array(length);
	    while (++index < length) {
	      result[index] = callback(collection[index], index, collection);
	    }
	  } else {
	    result = [];
	    forOwn(collection, function(value, key, collection) {
	      result[++index] = callback(value, key, collection);
	    });
	  }
	  return result;
	}
	
	module.exports = map;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var baseCreateCallback = __webpack_require__(29),
	    forOwn = __webpack_require__(14);
	
	/**
	 * Iterates over elements of a collection, executing the callback for each
	 * element. The callback is bound to `thisArg` and invoked with three arguments;
	 * (value, index|key, collection). Callbacks may exit iteration early by
	 * explicitly returning `false`.
	 *
	 * Note: As with other "Collections" methods, objects with a `length` property
	 * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
	 * may be used for object iteration.
	 *
	 * @static
	 * @memberOf _
	 * @alias each
	 * @category Collections
	 * @param {Array|Object|string} collection The collection to iterate over.
	 * @param {Function} [callback=identity] The function called per iteration.
	 * @param {*} [thisArg] The `this` binding of `callback`.
	 * @returns {Array|Object|string} Returns `collection`.
	 * @example
	 *
	 * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');
	 * // => logs each number and returns '1,2,3'
	 *
	 * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });
	 * // => logs each number and returns the object (property order is not guaranteed across environments)
	 */
	function forEach(collection, callback, thisArg) {
	  var index = -1,
	      length = collection ? collection.length : 0;
	
	  callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
	  if (typeof length == 'number') {
	    while (++index < length) {
	      if (callback(collection[index], index, collection) === false) {
	        break;
	      }
	    }
	  } else {
	    forOwn(collection, callback);
	  }
	  return collection;
	}
	
	module.exports = forEach;


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var keys = __webpack_require__(15);
	
	/**
	 * Gets the size of the `collection` by returning `collection.length` for arrays
	 * and array-like objects or the number of own enumerable properties for objects.
	 *
	 * @static
	 * @memberOf _
	 * @category Collections
	 * @param {Array|Object|string} collection The collection to inspect.
	 * @returns {number} Returns `collection.length` or number of own enumerable properties.
	 * @example
	 *
	 * _.size([1, 2]);
	 * // => 2
	 *
	 * _.size({ 'one': 1, 'two': 2, 'three': 3 });
	 * // => 3
	 *
	 * _.size('pebbles');
	 * // => 7
	 */
	function size(collection) {
	  var length = collection ? collection.length : 0;
	  return typeof length == 'number' ? length : keys(collection).length;
	}
	
	module.exports = size;


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var createCallback = __webpack_require__(41),
	    forOwn = __webpack_require__(14);
	
	/**
	 * Reduces a collection to a value which is the accumulated result of running
	 * each element in the collection through the callback, where each successive
	 * callback execution consumes the return value of the previous execution. If
	 * `accumulator` is not provided the first element of the collection will be
	 * used as the initial `accumulator` value. The callback is bound to `thisArg`
	 * and invoked with four arguments; (accumulator, value, index|key, collection).
	 *
	 * @static
	 * @memberOf _
	 * @alias foldl, inject
	 * @category Collections
	 * @param {Array|Object|string} collection The collection to iterate over.
	 * @param {Function} [callback=identity] The function called per iteration.
	 * @param {*} [accumulator] Initial value of the accumulator.
	 * @param {*} [thisArg] The `this` binding of `callback`.
	 * @returns {*} Returns the accumulated value.
	 * @example
	 *
	 * var sum = _.reduce([1, 2, 3], function(sum, num) {
	 *   return sum + num;
	 * });
	 * // => 6
	 *
	 * var mapped = _.reduce({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
	 *   result[key] = num * 3;
	 *   return result;
	 * }, {});
	 * // => { 'a': 3, 'b': 6, 'c': 9 }
	 */
	function reduce(collection, callback, accumulator, thisArg) {
	  if (!collection) return accumulator;
	  var noaccum = arguments.length < 3;
	  callback = createCallback(callback, thisArg, 4);
	
	  var index = -1,
	      length = collection.length;
	
	  if (typeof length == 'number') {
	    if (noaccum) {
	      accumulator = collection[++index];
	    }
	    while (++index < length) {
	      accumulator = callback(accumulator, collection[index], index, collection);
	    }
	  } else {
	    forOwn(collection, function(value, index, collection) {
	      accumulator = noaccum
	        ? (noaccum = false, value)
	        : callback(accumulator, value, index, collection)
	    });
	  }
	  return accumulator;
	}
	
	module.exports = reduce;


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var objectTypes = __webpack_require__(30);
	
	/**
	 * Checks if `value` is the language type of Object.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @category Objects
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(1);
	 * // => false
	 */
	function isObject(value) {
	  // check if the value is the ECMAScript language type of Object
	  // http://es5.github.io/#x8
	  // and avoid a V8 bug
	  // http://code.google.com/p/v8/issues/detail?id=2291
	  return !!(value && objectTypes[typeof value]);
	}
	
	module.exports = isObject;


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	
	/** `Object#toString` result shortcuts */
	var argsClass = '[object Arguments]';
	
	/** Used for native method references */
	var objectProto = Object.prototype;
	
	/** Used to resolve the internal [[Class]] of values */
	var toString = objectProto.toString;
	
	/**
	 * Checks if `value` is an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Objects
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
	 * @example
	 *
	 * (function() { return _.isArguments(arguments); })(1, 2, 3);
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	  return value && typeof value == 'object' && typeof value.length == 'number' &&
	    toString.call(value) == argsClass || false;
	}
	
	module.exports = isArguments;


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var isNative = __webpack_require__(31);
	
	/** `Object#toString` result shortcuts */
	var arrayClass = '[object Array]';
	
	/** Used for native method references */
	var objectProto = Object.prototype;
	
	/** Used to resolve the internal [[Class]] of values */
	var toString = objectProto.toString;
	
	/* Native method shortcuts for methods with the same name as other `lodash` methods */
	var nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray;
	
	/**
	 * Checks if `value` is an array.
	 *
	 * @static
	 * @memberOf _
	 * @type Function
	 * @category Objects
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
	 * @example
	 *
	 * (function() { return _.isArray(arguments); })();
	 * // => false
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 */
	var isArray = nativeIsArray || function(value) {
	  return value && typeof value == 'object' && typeof value.length == 'number' &&
	    toString.call(value) == arrayClass || false;
	};
	
	module.exports = isArray;


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var assign = __webpack_require__(42),
	    forEach = __webpack_require__(22),
	    forOwn = __webpack_require__(14),
	    getArray = __webpack_require__(36),
	    isArray = __webpack_require__(27),
	    isObject = __webpack_require__(25),
	    releaseArray = __webpack_require__(38),
	    slice = __webpack_require__(43);
	
	/** Used to match regexp flags from their coerced string values */
	var reFlags = /\w*$/;
	
	/** `Object#toString` result shortcuts */
	var argsClass = '[object Arguments]',
	    arrayClass = '[object Array]',
	    boolClass = '[object Boolean]',
	    dateClass = '[object Date]',
	    funcClass = '[object Function]',
	    numberClass = '[object Number]',
	    objectClass = '[object Object]',
	    regexpClass = '[object RegExp]',
	    stringClass = '[object String]';
	
	/** Used to identify object classifications that `_.clone` supports */
	var cloneableClasses = {};
	cloneableClasses[funcClass] = false;
	cloneableClasses[argsClass] = cloneableClasses[arrayClass] =
	cloneableClasses[boolClass] = cloneableClasses[dateClass] =
	cloneableClasses[numberClass] = cloneableClasses[objectClass] =
	cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;
	
	/** Used for native method references */
	var objectProto = Object.prototype;
	
	/** Used to resolve the internal [[Class]] of values */
	var toString = objectProto.toString;
	
	/** Native method shortcuts */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/** Used to lookup a built-in constructor by [[Class]] */
	var ctorByClass = {};
	ctorByClass[arrayClass] = Array;
	ctorByClass[boolClass] = Boolean;
	ctorByClass[dateClass] = Date;
	ctorByClass[funcClass] = Function;
	ctorByClass[objectClass] = Object;
	ctorByClass[numberClass] = Number;
	ctorByClass[regexpClass] = RegExp;
	ctorByClass[stringClass] = String;
	
	/**
	 * The base implementation of `_.clone` without argument juggling or support
	 * for `thisArg` binding.
	 *
	 * @private
	 * @param {*} value The value to clone.
	 * @param {boolean} [isDeep=false] Specify a deep clone.
	 * @param {Function} [callback] The function to customize cloning values.
	 * @param {Array} [stackA=[]] Tracks traversed source objects.
	 * @param {Array} [stackB=[]] Associates clones with source counterparts.
	 * @returns {*} Returns the cloned value.
	 */
	function baseClone(value, isDeep, callback, stackA, stackB) {
	  if (callback) {
	    var result = callback(value);
	    if (typeof result != 'undefined') {
	      return result;
	    }
	  }
	  // inspect [[Class]]
	  var isObj = isObject(value);
	  if (isObj) {
	    var className = toString.call(value);
	    if (!cloneableClasses[className]) {
	      return value;
	    }
	    var ctor = ctorByClass[className];
	    switch (className) {
	      case boolClass:
	      case dateClass:
	        return new ctor(+value);
	
	      case numberClass:
	      case stringClass:
	        return new ctor(value);
	
	      case regexpClass:
	        result = ctor(value.source, reFlags.exec(value));
	        result.lastIndex = value.lastIndex;
	        return result;
	    }
	  } else {
	    return value;
	  }
	  var isArr = isArray(value);
	  if (isDeep) {
	    // check for circular references and return corresponding clone
	    var initedStack = !stackA;
	    stackA || (stackA = getArray());
	    stackB || (stackB = getArray());
	
	    var length = stackA.length;
	    while (length--) {
	      if (stackA[length] == value) {
	        return stackB[length];
	      }
	    }
	    result = isArr ? ctor(value.length) : {};
	  }
	  else {
	    result = isArr ? slice(value) : assign({}, value);
	  }
	  // add array properties assigned by `RegExp#exec`
	  if (isArr) {
	    if (hasOwnProperty.call(value, 'index')) {
	      result.index = value.index;
	    }
	    if (hasOwnProperty.call(value, 'input')) {
	      result.input = value.input;
	    }
	  }
	  // exit for shallow clone
	  if (!isDeep) {
	    return result;
	  }
	  // add the source value to the stack of traversed objects
	  // and associate it with its clone
	  stackA.push(value);
	  stackB.push(result);
	
	  // recursively populate clone (susceptible to call stack limits)
	  (isArr ? forEach : forOwn)(value, function(objValue, key) {
	    result[key] = baseClone(objValue, isDeep, callback, stackA, stackB);
	  });
	
	  if (initedStack) {
	    releaseArray(stackA);
	    releaseArray(stackB);
	  }
	  return result;
	}
	
	module.exports = baseClone;


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var bind = __webpack_require__(44),
	    identity = __webpack_require__(54),
	    setBindData = __webpack_require__(45),
	    support = __webpack_require__(46);
	
	/** Used to detected named functions */
	var reFuncName = /^\s*function[ \n\r\t]+\w/;
	
	/** Used to detect functions containing a `this` reference */
	var reThis = /\bthis\b/;
	
	/** Native method shortcuts */
	var fnToString = Function.prototype.toString;
	
	/**
	 * The base implementation of `_.createCallback` without support for creating
	 * "_.pluck" or "_.where" style callbacks.
	 *
	 * @private
	 * @param {*} [func=identity] The value to convert to a callback.
	 * @param {*} [thisArg] The `this` binding of the created callback.
	 * @param {number} [argCount] The number of arguments the callback accepts.
	 * @returns {Function} Returns a callback function.
	 */
	function baseCreateCallback(func, thisArg, argCount) {
	  if (typeof func != 'function') {
	    return identity;
	  }
	  // exit early for no `thisArg` or already bound by `Function#bind`
	  if (typeof thisArg == 'undefined' || !('prototype' in func)) {
	    return func;
	  }
	  var bindData = func.__bindData__;
	  if (typeof bindData == 'undefined') {
	    if (support.funcNames) {
	      bindData = !func.name;
	    }
	    bindData = bindData || !support.funcDecomp;
	    if (!bindData) {
	      var source = fnToString.call(func);
	      if (!support.funcNames) {
	        bindData = !reFuncName.test(source);
	      }
	      if (!bindData) {
	        // checks if `func` references the `this` keyword and stores the result
	        bindData = reThis.test(source);
	        setBindData(func, bindData);
	      }
	    }
	  }
	  // exit early if there are no `this` references or `func` is bound
	  if (bindData === false || (bindData !== true && bindData[1] & 1)) {
	    return func;
	  }
	  switch (argCount) {
	    case 1: return function(value) {
	      return func.call(thisArg, value);
	    };
	    case 2: return function(a, b) {
	      return func.call(thisArg, a, b);
	    };
	    case 3: return function(value, index, collection) {
	      return func.call(thisArg, value, index, collection);
	    };
	    case 4: return function(accumulator, value, index, collection) {
	      return func.call(thisArg, accumulator, value, index, collection);
	    };
	  }
	  return bind(func, thisArg);
	}
	
	module.exports = baseCreateCallback;


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	
	/** Used to determine if values are of the language type Object */
	var objectTypes = {
	  'boolean': false,
	  'function': true,
	  'object': true,
	  'number': false,
	  'string': false,
	  'undefined': false
	};
	
	module.exports = objectTypes;


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	
	/** Used for native method references */
	var objectProto = Object.prototype;
	
	/** Used to resolve the internal [[Class]] of values */
	var toString = objectProto.toString;
	
	/** Used to detect if a method is native */
	var reNative = RegExp('^' +
	  String(toString)
	    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	    .replace(/toString| for [^\]]+/g, '.*?') + '$'
	);
	
	/**
	 * Checks if `value` is a native function.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
	 */
	function isNative(value) {
	  return typeof value == 'function' && reNative.test(value);
	}
	
	module.exports = isNative;


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var objectTypes = __webpack_require__(30);
	
	/** Used for native method references */
	var objectProto = Object.prototype;
	
	/** Native method shortcuts */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * A fallback implementation of `Object.keys` which produces an array of the
	 * given object's own enumerable property names.
	 *
	 * @private
	 * @type Function
	 * @param {Object} object The object to inspect.
	 * @returns {Array} Returns an array of property names.
	 */
	var shimKeys = function(object) {
	  var index, iterable = object, result = [];
	  if (!iterable) return result;
	  if (!(objectTypes[typeof object])) return result;
	    for (index in iterable) {
	      if (hasOwnProperty.call(iterable, index)) {
	        result.push(index);
	      }
	    }
	  return result
	};
	
	module.exports = shimKeys;


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	
	/**
	 * The base implementation of `_.indexOf` without support for binary searches
	 * or `fromIndex` constraints.
	 *
	 * @private
	 * @param {Array} array The array to search.
	 * @param {*} value The value to search for.
	 * @param {number} [fromIndex=0] The index to search from.
	 * @returns {number} Returns the index of the matched value or `-1`.
	 */
	function baseIndexOf(array, value, fromIndex) {
	  var index = (fromIndex || 0) - 1,
	      length = array ? array.length : 0;
	
	  while (++index < length) {
	    if (array[index] === value) {
	      return index;
	    }
	  }
	  return -1;
	}
	
	module.exports = baseIndexOf;


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var baseIndexOf = __webpack_require__(33),
	    keyPrefix = __webpack_require__(47);
	
	/**
	 * An implementation of `_.contains` for cache objects that mimics the return
	 * signature of `_.indexOf` by returning `0` if the value is found, else `-1`.
	 *
	 * @private
	 * @param {Object} cache The cache object to inspect.
	 * @param {*} value The value to search for.
	 * @returns {number} Returns `0` if `value` is found, else `-1`.
	 */
	function cacheIndexOf(cache, value) {
	  var type = typeof value;
	  cache = cache.cache;
	
	  if (type == 'boolean' || value == null) {
	    return cache[value] ? 0 : -1;
	  }
	  if (type != 'number' && type != 'string') {
	    type = 'object';
	  }
	  var key = type == 'number' ? value : keyPrefix + value;
	  cache = (cache = cache[type]) && cache[key];
	
	  return type == 'object'
	    ? (cache && baseIndexOf(cache, value) > -1 ? 0 : -1)
	    : (cache ? 0 : -1);
	}
	
	module.exports = cacheIndexOf;


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var cachePush = __webpack_require__(48),
	    getObject = __webpack_require__(49),
	    releaseObject = __webpack_require__(39);
	
	/**
	 * Creates a cache object to optimize linear searches of large arrays.
	 *
	 * @private
	 * @param {Array} [array=[]] The array to search.
	 * @returns {null|Object} Returns the cache object or `null` if caching should not be used.
	 */
	function createCache(array) {
	  var index = -1,
	      length = array.length,
	      first = array[0],
	      mid = array[(length / 2) | 0],
	      last = array[length - 1];
	
	  if (first && typeof first == 'object' &&
	      mid && typeof mid == 'object' && last && typeof last == 'object') {
	    return false;
	  }
	  var cache = getObject();
	  cache['false'] = cache['null'] = cache['true'] = cache['undefined'] = false;
	
	  var result = getObject();
	  result.array = array;
	  result.cache = cache;
	  result.push = cachePush;
	
	  while (++index < length) {
	    result.push(array[index]);
	  }
	  return result;
	}
	
	module.exports = createCache;


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var arrayPool = __webpack_require__(50);
	
	/**
	 * Gets an array from the array pool or creates a new one if the pool is empty.
	 *
	 * @private
	 * @returns {Array} The array from the pool.
	 */
	function getArray() {
	  return arrayPool.pop() || [];
	}
	
	module.exports = getArray;


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	
	/** Used as the size when optimizations are enabled for large arrays */
	var largeArraySize = 75;
	
	module.exports = largeArraySize;


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var arrayPool = __webpack_require__(50),
	    maxPoolSize = __webpack_require__(51);
	
	/**
	 * Releases the given array back to the array pool.
	 *
	 * @private
	 * @param {Array} [array] The array to release.
	 */
	function releaseArray(array) {
	  array.length = 0;
	  if (arrayPool.length < maxPoolSize) {
	    arrayPool.push(array);
	  }
	}
	
	module.exports = releaseArray;


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var maxPoolSize = __webpack_require__(51),
	    objectPool = __webpack_require__(52);
	
	/**
	 * Releases the given object back to the object pool.
	 *
	 * @private
	 * @param {Object} [object] The object to release.
	 */
	function releaseObject(object) {
	  var cache = object.cache;
	  if (cache) {
	    releaseObject(cache);
	  }
	  object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;
	  if (objectPool.length < maxPoolSize) {
	    objectPool.push(object);
	  }
	}
	
	module.exports = releaseObject;


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var baseIndexOf = __webpack_require__(33),
	    cacheIndexOf = __webpack_require__(34),
	    createCache = __webpack_require__(35),
	    getArray = __webpack_require__(36),
	    largeArraySize = __webpack_require__(37),
	    releaseArray = __webpack_require__(38),
	    releaseObject = __webpack_require__(39);
	
	/**
	 * The base implementation of `_.uniq` without support for callback shorthands
	 * or `thisArg` binding.
	 *
	 * @private
	 * @param {Array} array The array to process.
	 * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
	 * @param {Function} [callback] The function called per iteration.
	 * @returns {Array} Returns a duplicate-value-free array.
	 */
	function baseUniq(array, isSorted, callback) {
	  var index = -1,
	      indexOf = baseIndexOf,
	      length = array ? array.length : 0,
	      result = [];
	
	  var isLarge = !isSorted && length >= largeArraySize,
	      seen = (callback || isLarge) ? getArray() : result;
	
	  if (isLarge) {
	    var cache = createCache(seen);
	    indexOf = cacheIndexOf;
	    seen = cache;
	  }
	  while (++index < length) {
	    var value = array[index],
	        computed = callback ? callback(value, index, array) : value;
	
	    if (isSorted
	          ? !index || seen[seen.length - 1] !== computed
	          : indexOf(seen, computed) < 0
	        ) {
	      if (callback || isLarge) {
	        seen.push(computed);
	      }
	      result.push(value);
	    }
	  }
	  if (isLarge) {
	    releaseArray(seen.array);
	    releaseObject(seen);
	  } else if (callback) {
	    releaseArray(seen);
	  }
	  return result;
	}
	
	module.exports = baseUniq;


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var baseCreateCallback = __webpack_require__(29),
	    baseIsEqual = __webpack_require__(53),
	    isObject = __webpack_require__(25),
	    keys = __webpack_require__(15),
	    property = __webpack_require__(55);
	
	/**
	 * Produces a callback bound to an optional `thisArg`. If `func` is a property
	 * name the created callback will return the property value for a given element.
	 * If `func` is an object the created callback will return `true` for elements
	 * that contain the equivalent object properties, otherwise it will return `false`.
	 *
	 * @static
	 * @memberOf _
	 * @category Utilities
	 * @param {*} [func=identity] The value to convert to a callback.
	 * @param {*} [thisArg] The `this` binding of the created callback.
	 * @param {number} [argCount] The number of arguments the callback accepts.
	 * @returns {Function} Returns a callback function.
	 * @example
	 *
	 * var characters = [
	 *   { 'name': 'barney', 'age': 36 },
	 *   { 'name': 'fred',   'age': 40 }
	 * ];
	 *
	 * // wrap to create custom callback shorthands
	 * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
	 *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
	 *   return !match ? func(callback, thisArg) : function(object) {
	 *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
	 *   };
	 * });
	 *
	 * _.filter(characters, 'age__gt38');
	 * // => [{ 'name': 'fred', 'age': 40 }]
	 */
	function createCallback(func, thisArg, argCount) {
	  var type = typeof func;
	  if (func == null || type == 'function') {
	    return baseCreateCallback(func, thisArg, argCount);
	  }
	  // handle "_.pluck" style callback shorthands
	  if (type != 'object') {
	    return property(func);
	  }
	  var props = keys(func),
	      key = props[0],
	      a = func[key];
	
	  // handle "_.where" style callback shorthands
	  if (props.length == 1 && a === a && !isObject(a)) {
	    // fast path the common case of providing an object with a single
	    // property containing a primitive value
	    return function(object) {
	      var b = object[key];
	      return a === b && (a !== 0 || (1 / a == 1 / b));
	    };
	  }
	  return function(object) {
	    var length = props.length,
	        result = false;
	
	    while (length--) {
	      if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
	        break;
	      }
	    }
	    return result;
	  };
	}
	
	module.exports = createCallback;


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var baseCreateCallback = __webpack_require__(29),
	    keys = __webpack_require__(15),
	    objectTypes = __webpack_require__(30);
	
	/**
	 * Assigns own enumerable properties of source object(s) to the destination
	 * object. Subsequent sources will overwrite property assignments of previous
	 * sources. If a callback is provided it will be executed to produce the
	 * assigned values. The callback is bound to `thisArg` and invoked with two
	 * arguments; (objectValue, sourceValue).
	 *
	 * @static
	 * @memberOf _
	 * @type Function
	 * @alias extend
	 * @category Objects
	 * @param {Object} object The destination object.
	 * @param {...Object} [source] The source objects.
	 * @param {Function} [callback] The function to customize assigning values.
	 * @param {*} [thisArg] The `this` binding of `callback`.
	 * @returns {Object} Returns the destination object.
	 * @example
	 *
	 * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
	 * // => { 'name': 'fred', 'employer': 'slate' }
	 *
	 * var defaults = _.partialRight(_.assign, function(a, b) {
	 *   return typeof a == 'undefined' ? b : a;
	 * });
	 *
	 * var object = { 'name': 'barney' };
	 * defaults(object, { 'name': 'fred', 'employer': 'slate' });
	 * // => { 'name': 'barney', 'employer': 'slate' }
	 */
	var assign = function(object, source, guard) {
	  var index, iterable = object, result = iterable;
	  if (!iterable) return result;
	  var args = arguments,
	      argsIndex = 0,
	      argsLength = typeof guard == 'number' ? 2 : args.length;
	  if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {
	    var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);
	  } else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {
	    callback = args[--argsLength];
	  }
	  while (++argsIndex < argsLength) {
	    iterable = args[argsIndex];
	    if (iterable && objectTypes[typeof iterable]) {
	    var ownIndex = -1,
	        ownProps = objectTypes[typeof iterable] && keys(iterable),
	        length = ownProps ? ownProps.length : 0;
	
	    while (++ownIndex < length) {
	      index = ownProps[ownIndex];
	      result[index] = callback ? callback(result[index], iterable[index]) : iterable[index];
	    }
	    }
	  }
	  return result
	};
	
	module.exports = assign;


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	
	/**
	 * Slices the `collection` from the `start` index up to, but not including,
	 * the `end` index.
	 *
	 * Note: This function is used instead of `Array#slice` to support node lists
	 * in IE < 9 and to ensure dense arrays are returned.
	 *
	 * @private
	 * @param {Array|Object|string} collection The collection to slice.
	 * @param {number} start The start index.
	 * @param {number} end The end index.
	 * @returns {Array} Returns the new array.
	 */
	function slice(array, start, end) {
	  start || (start = 0);
	  if (typeof end == 'undefined') {
	    end = array ? array.length : 0;
	  }
	  var index = -1,
	      length = end - start || 0,
	      result = Array(length < 0 ? 0 : length);
	
	  while (++index < length) {
	    result[index] = array[start + index];
	  }
	  return result;
	}
	
	module.exports = slice;


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var createWrapper = __webpack_require__(56),
	    slice = __webpack_require__(43);
	
	/**
	 * Creates a function that, when called, invokes `func` with the `this`
	 * binding of `thisArg` and prepends any additional `bind` arguments to those
	 * provided to the bound function.
	 *
	 * @static
	 * @memberOf _
	 * @category Functions
	 * @param {Function} func The function to bind.
	 * @param {*} [thisArg] The `this` binding of `func`.
	 * @param {...*} [arg] Arguments to be partially applied.
	 * @returns {Function} Returns the new bound function.
	 * @example
	 *
	 * var func = function(greeting) {
	 *   return greeting + ' ' + this.name;
	 * };
	 *
	 * func = _.bind(func, { 'name': 'fred' }, 'hi');
	 * func();
	 * // => 'hi fred'
	 */
	function bind(func, thisArg) {
	  return arguments.length > 2
	    ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
	    : createWrapper(func, 1, null, null, thisArg);
	}
	
	module.exports = bind;


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var isNative = __webpack_require__(31),
	    noop = __webpack_require__(57);
	
	/** Used as the property descriptor for `__bindData__` */
	var descriptor = {
	  'configurable': false,
	  'enumerable': false,
	  'value': null,
	  'writable': false
	};
	
	/** Used to set meta data on functions */
	var defineProperty = (function() {
	  // IE 8 only accepts DOM elements
	  try {
	    var o = {},
	        func = isNative(func = Object.defineProperty) && func,
	        result = func(o, o, o) && func;
	  } catch(e) { }
	  return result;
	}());
	
	/**
	 * Sets `this` binding data on a given function.
	 *
	 * @private
	 * @param {Function} func The function to set data on.
	 * @param {Array} value The data array to set.
	 */
	var setBindData = !defineProperty ? noop : function(func, value) {
	  descriptor.value = value;
	  defineProperty(func, '__bindData__', descriptor);
	};
	
	module.exports = setBindData;


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var isNative = __webpack_require__(31);
	
	/** Used to detect functions containing a `this` reference */
	var reThis = /\bthis\b/;
	
	/**
	 * An object used to flag environments features.
	 *
	 * @static
	 * @memberOf _
	 * @type Object
	 */
	var support = {};
	
	/**
	 * Detect if functions can be decompiled by `Function#toString`
	 * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
	 *
	 * @memberOf _.support
	 * @type boolean
	 */
	support.funcDecomp = !isNative(global.WinRTError) && reThis.test(function() { return this; });
	
	/**
	 * Detect if `Function#name` is supported (all but IE).
	 *
	 * @memberOf _.support
	 * @type boolean
	 */
	support.funcNames = typeof Function.name == 'string';
	
	module.exports = support;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	
	/** Used to prefix keys to avoid issues with `__proto__` and properties on `Object.prototype` */
	var keyPrefix = +new Date + '';
	
	module.exports = keyPrefix;


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var keyPrefix = __webpack_require__(47);
	
	/**
	 * Adds a given value to the corresponding cache object.
	 *
	 * @private
	 * @param {*} value The value to add to the cache.
	 */
	function cachePush(value) {
	  var cache = this.cache,
	      type = typeof value;
	
	  if (type == 'boolean' || value == null) {
	    cache[value] = true;
	  } else {
	    if (type != 'number' && type != 'string') {
	      type = 'object';
	    }
	    var key = type == 'number' ? value : keyPrefix + value,
	        typeCache = cache[type] || (cache[type] = {});
	
	    if (type == 'object') {
	      (typeCache[key] || (typeCache[key] = [])).push(value);
	    } else {
	      typeCache[key] = true;
	    }
	  }
	}
	
	module.exports = cachePush;


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var objectPool = __webpack_require__(52);
	
	/**
	 * Gets an object from the object pool or creates a new one if the pool is empty.
	 *
	 * @private
	 * @returns {Object} The object from the pool.
	 */
	function getObject() {
	  return objectPool.pop() || {
	    'array': null,
	    'cache': null,
	    'criteria': null,
	    'false': false,
	    'index': 0,
	    'null': false,
	    'number': null,
	    'object': null,
	    'push': null,
	    'string': null,
	    'true': false,
	    'undefined': false,
	    'value': null
	  };
	}
	
	module.exports = getObject;


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	
	/** Used to pool arrays and objects used internally */
	var arrayPool = [];
	
	module.exports = arrayPool;


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	
	/** Used as the max size of the `arrayPool` and `objectPool` */
	var maxPoolSize = 40;
	
	module.exports = maxPoolSize;


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	
	/** Used to pool arrays and objects used internally */
	var objectPool = [];
	
	module.exports = objectPool;


/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var forIn = __webpack_require__(58),
	    getArray = __webpack_require__(36),
	    isFunction = __webpack_require__(17),
	    objectTypes = __webpack_require__(30),
	    releaseArray = __webpack_require__(38);
	
	/** `Object#toString` result shortcuts */
	var argsClass = '[object Arguments]',
	    arrayClass = '[object Array]',
	    boolClass = '[object Boolean]',
	    dateClass = '[object Date]',
	    numberClass = '[object Number]',
	    objectClass = '[object Object]',
	    regexpClass = '[object RegExp]',
	    stringClass = '[object String]';
	
	/** Used for native method references */
	var objectProto = Object.prototype;
	
	/** Used to resolve the internal [[Class]] of values */
	var toString = objectProto.toString;
	
	/** Native method shortcuts */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * The base implementation of `_.isEqual`, without support for `thisArg` binding,
	 * that allows partial "_.where" style comparisons.
	 *
	 * @private
	 * @param {*} a The value to compare.
	 * @param {*} b The other value to compare.
	 * @param {Function} [callback] The function to customize comparing values.
	 * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.
	 * @param {Array} [stackA=[]] Tracks traversed `a` objects.
	 * @param {Array} [stackB=[]] Tracks traversed `b` objects.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 */
	function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
	  // used to indicate that when comparing objects, `a` has at least the properties of `b`
	  if (callback) {
	    var result = callback(a, b);
	    if (typeof result != 'undefined') {
	      return !!result;
	    }
	  }
	  // exit early for identical values
	  if (a === b) {
	    // treat `+0` vs. `-0` as not equal
	    return a !== 0 || (1 / a == 1 / b);
	  }
	  var type = typeof a,
	      otherType = typeof b;
	
	  // exit early for unlike primitive values
	  if (a === a &&
	      !(a && objectTypes[type]) &&
	      !(b && objectTypes[otherType])) {
	    return false;
	  }
	  // exit early for `null` and `undefined` avoiding ES3's Function#call behavior
	  // http://es5.github.io/#x15.3.4.4
	  if (a == null || b == null) {
	    return a === b;
	  }
	  // compare [[Class]] names
	  var className = toString.call(a),
	      otherClass = toString.call(b);
	
	  if (className == argsClass) {
	    className = objectClass;
	  }
	  if (otherClass == argsClass) {
	    otherClass = objectClass;
	  }
	  if (className != otherClass) {
	    return false;
	  }
	  switch (className) {
	    case boolClass:
	    case dateClass:
	      // coerce dates and booleans to numbers, dates to milliseconds and booleans
	      // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
	      return +a == +b;
	
	    case numberClass:
	      // treat `NaN` vs. `NaN` as equal
	      return (a != +a)
	        ? b != +b
	        // but treat `+0` vs. `-0` as not equal
	        : (a == 0 ? (1 / a == 1 / b) : a == +b);
	
	    case regexpClass:
	    case stringClass:
	      // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
	      // treat string primitives and their corresponding object instances as equal
	      return a == String(b);
	  }
	  var isArr = className == arrayClass;
	  if (!isArr) {
	    // unwrap any `lodash` wrapped values
	    var aWrapped = hasOwnProperty.call(a, '__wrapped__'),
	        bWrapped = hasOwnProperty.call(b, '__wrapped__');
	
	    if (aWrapped || bWrapped) {
	      return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
	    }
	    // exit for functions and DOM nodes
	    if (className != objectClass) {
	      return false;
	    }
	    // in older versions of Opera, `arguments` objects have `Array` constructors
	    var ctorA = a.constructor,
	        ctorB = b.constructor;
	
	    // non `Object` object instances with different constructors are not equal
	    if (ctorA != ctorB &&
	          !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
	          ('constructor' in a && 'constructor' in b)
	        ) {
	      return false;
	    }
	  }
	  // assume cyclic structures are equal
	  // the algorithm for detecting cyclic structures is adapted from ES 5.1
	  // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
	  var initedStack = !stackA;
	  stackA || (stackA = getArray());
	  stackB || (stackB = getArray());
	
	  var length = stackA.length;
	  while (length--) {
	    if (stackA[length] == a) {
	      return stackB[length] == b;
	    }
	  }
	  var size = 0;
	  result = true;
	
	  // add `a` and `b` to the stack of traversed objects
	  stackA.push(a);
	  stackB.push(b);
	
	  // recursively compare objects and arrays (susceptible to call stack limits)
	  if (isArr) {
	    // compare lengths to determine if a deep comparison is necessary
	    length = a.length;
	    size = b.length;
	    result = size == length;
	
	    if (result || isWhere) {
	      // deep compare the contents, ignoring non-numeric properties
	      while (size--) {
	        var index = length,
	            value = b[size];
	
	        if (isWhere) {
	          while (index--) {
	            if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {
	              break;
	            }
	          }
	        } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
	          break;
	        }
	      }
	    }
	  }
	  else {
	    // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
	    // which, in this case, is more costly
	    forIn(b, function(value, key, b) {
	      if (hasOwnProperty.call(b, key)) {
	        // count the number of properties.
	        size++;
	        // deep compare each property value.
	        return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));
	      }
	    });
	
	    if (result && !isWhere) {
	      // ensure both objects have the same number of properties
	      forIn(a, function(value, key, a) {
	        if (hasOwnProperty.call(a, key)) {
	          // `size` will be `-1` if `a` has more properties than `b`
	          return (result = --size > -1);
	        }
	      });
	    }
	  }
	  stackA.pop();
	  stackB.pop();
	
	  if (initedStack) {
	    releaseArray(stackA);
	    releaseArray(stackB);
	  }
	  return result;
	}
	
	module.exports = baseIsEqual;


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	
	/**
	 * This method returns the first argument provided to it.
	 *
	 * @static
	 * @memberOf _
	 * @category Utilities
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'name': 'fred' };
	 * _.identity(object) === object;
	 * // => true
	 */
	function identity(value) {
	  return value;
	}
	
	module.exports = identity;


/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	
	/**
	 * Creates a "_.pluck" style function, which returns the `key` value of a
	 * given object.
	 *
	 * @static
	 * @memberOf _
	 * @category Utilities
	 * @param {string} key The name of the property to retrieve.
	 * @returns {Function} Returns the new function.
	 * @example
	 *
	 * var characters = [
	 *   { 'name': 'fred',   'age': 40 },
	 *   { 'name': 'barney', 'age': 36 }
	 * ];
	 *
	 * var getName = _.property('name');
	 *
	 * _.map(characters, getName);
	 * // => ['barney', 'fred']
	 *
	 * _.sortBy(characters, getName);
	 * // => [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred',   'age': 40 }]
	 */
	function property(key) {
	  return function(object) {
	    return object[key];
	  };
	}
	
	module.exports = property;


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var baseBind = __webpack_require__(59),
	    baseCreateWrapper = __webpack_require__(60),
	    isFunction = __webpack_require__(17),
	    slice = __webpack_require__(43);
	
	/**
	 * Used for `Array` method references.
	 *
	 * Normally `Array.prototype` would suffice, however, using an array literal
	 * avoids issues in Narwhal.
	 */
	var arrayRef = [];
	
	/** Native method shortcuts */
	var push = arrayRef.push,
	    unshift = arrayRef.unshift;
	
	/**
	 * Creates a function that, when called, either curries or invokes `func`
	 * with an optional `this` binding and partially applied arguments.
	 *
	 * @private
	 * @param {Function|string} func The function or method name to reference.
	 * @param {number} bitmask The bitmask of method flags to compose.
	 *  The bitmask may be composed of the following flags:
	 *  1 - `_.bind`
	 *  2 - `_.bindKey`
	 *  4 - `_.curry`
	 *  8 - `_.curry` (bound)
	 *  16 - `_.partial`
	 *  32 - `_.partialRight`
	 * @param {Array} [partialArgs] An array of arguments to prepend to those
	 *  provided to the new function.
	 * @param {Array} [partialRightArgs] An array of arguments to append to those
	 *  provided to the new function.
	 * @param {*} [thisArg] The `this` binding of `func`.
	 * @param {number} [arity] The arity of `func`.
	 * @returns {Function} Returns the new function.
	 */
	function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
	  var isBind = bitmask & 1,
	      isBindKey = bitmask & 2,
	      isCurry = bitmask & 4,
	      isCurryBound = bitmask & 8,
	      isPartial = bitmask & 16,
	      isPartialRight = bitmask & 32;
	
	  if (!isBindKey && !isFunction(func)) {
	    throw new TypeError;
	  }
	  if (isPartial && !partialArgs.length) {
	    bitmask &= ~16;
	    isPartial = partialArgs = false;
	  }
	  if (isPartialRight && !partialRightArgs.length) {
	    bitmask &= ~32;
	    isPartialRight = partialRightArgs = false;
	  }
	  var bindData = func && func.__bindData__;
	  if (bindData && bindData !== true) {
	    // clone `bindData`
	    bindData = slice(bindData);
	    if (bindData[2]) {
	      bindData[2] = slice(bindData[2]);
	    }
	    if (bindData[3]) {
	      bindData[3] = slice(bindData[3]);
	    }
	    // set `thisBinding` is not previously bound
	    if (isBind && !(bindData[1] & 1)) {
	      bindData[4] = thisArg;
	    }
	    // set if previously bound but not currently (subsequent curried functions)
	    if (!isBind && bindData[1] & 1) {
	      bitmask |= 8;
	    }
	    // set curried arity if not yet set
	    if (isCurry && !(bindData[1] & 4)) {
	      bindData[5] = arity;
	    }
	    // append partial left arguments
	    if (isPartial) {
	      push.apply(bindData[2] || (bindData[2] = []), partialArgs);
	    }
	    // append partial right arguments
	    if (isPartialRight) {
	      unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
	    }
	    // merge flags
	    bindData[1] |= bitmask;
	    return createWrapper.apply(null, bindData);
	  }
	  // fast path for `_.bind`
	  var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
	  return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
	}
	
	module.exports = createWrapper;


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	
	/**
	 * A no-operation function.
	 *
	 * @static
	 * @memberOf _
	 * @category Utilities
	 * @example
	 *
	 * var object = { 'name': 'fred' };
	 * _.noop(object) === undefined;
	 * // => true
	 */
	function noop() {
	  // no operation performed
	}
	
	module.exports = noop;


/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var baseCreateCallback = __webpack_require__(29),
	    objectTypes = __webpack_require__(30);
	
	/**
	 * Iterates over own and inherited enumerable properties of an object,
	 * executing the callback for each property. The callback is bound to `thisArg`
	 * and invoked with three arguments; (value, key, object). Callbacks may exit
	 * iteration early by explicitly returning `false`.
	 *
	 * @static
	 * @memberOf _
	 * @type Function
	 * @category Objects
	 * @param {Object} object The object to iterate over.
	 * @param {Function} [callback=identity] The function called per iteration.
	 * @param {*} [thisArg] The `this` binding of `callback`.
	 * @returns {Object} Returns `object`.
	 * @example
	 *
	 * function Shape() {
	 *   this.x = 0;
	 *   this.y = 0;
	 * }
	 *
	 * Shape.prototype.move = function(x, y) {
	 *   this.x += x;
	 *   this.y += y;
	 * };
	 *
	 * _.forIn(new Shape, function(value, key) {
	 *   console.log(key);
	 * });
	 * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
	 */
	var forIn = function(collection, callback, thisArg) {
	  var index, iterable = collection, result = iterable;
	  if (!iterable) return result;
	  if (!objectTypes[typeof iterable]) return result;
	  callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
	    for (index in iterable) {
	      if (callback(iterable[index], index, collection) === false) return result;
	    }
	  return result
	};
	
	module.exports = forIn;


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var baseCreate = __webpack_require__(61),
	    isObject = __webpack_require__(25),
	    setBindData = __webpack_require__(45),
	    slice = __webpack_require__(43);
	
	/**
	 * Used for `Array` method references.
	 *
	 * Normally `Array.prototype` would suffice, however, using an array literal
	 * avoids issues in Narwhal.
	 */
	var arrayRef = [];
	
	/** Native method shortcuts */
	var push = arrayRef.push;
	
	/**
	 * The base implementation of `_.bind` that creates the bound function and
	 * sets its meta data.
	 *
	 * @private
	 * @param {Array} bindData The bind data array.
	 * @returns {Function} Returns the new bound function.
	 */
	function baseBind(bindData) {
	  var func = bindData[0],
	      partialArgs = bindData[2],
	      thisArg = bindData[4];
	
	  function bound() {
	    // `Function#bind` spec
	    // http://es5.github.io/#x15.3.4.5
	    if (partialArgs) {
	      // avoid `arguments` object deoptimizations by using `slice` instead
	      // of `Array.prototype.slice.call` and not assigning `arguments` to a
	      // variable as a ternary expression
	      var args = slice(partialArgs);
	      push.apply(args, arguments);
	    }
	    // mimic the constructor's `return` behavior
	    // http://es5.github.io/#x13.2.2
	    if (this instanceof bound) {
	      // ensure `new bound` is an instance of `func`
	      var thisBinding = baseCreate(func.prototype),
	          result = func.apply(thisBinding, args || arguments);
	      return isObject(result) ? result : thisBinding;
	    }
	    return func.apply(thisArg, args || arguments);
	  }
	  setBindData(bound, bindData);
	  return bound;
	}
	
	module.exports = baseBind;


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var baseCreate = __webpack_require__(61),
	    isObject = __webpack_require__(25),
	    setBindData = __webpack_require__(45),
	    slice = __webpack_require__(43);
	
	/**
	 * Used for `Array` method references.
	 *
	 * Normally `Array.prototype` would suffice, however, using an array literal
	 * avoids issues in Narwhal.
	 */
	var arrayRef = [];
	
	/** Native method shortcuts */
	var push = arrayRef.push;
	
	/**
	 * The base implementation of `createWrapper` that creates the wrapper and
	 * sets its meta data.
	 *
	 * @private
	 * @param {Array} bindData The bind data array.
	 * @returns {Function} Returns the new function.
	 */
	function baseCreateWrapper(bindData) {
	  var func = bindData[0],
	      bitmask = bindData[1],
	      partialArgs = bindData[2],
	      partialRightArgs = bindData[3],
	      thisArg = bindData[4],
	      arity = bindData[5];
	
	  var isBind = bitmask & 1,
	      isBindKey = bitmask & 2,
	      isCurry = bitmask & 4,
	      isCurryBound = bitmask & 8,
	      key = func;
	
	  function bound() {
	    var thisBinding = isBind ? thisArg : this;
	    if (partialArgs) {
	      var args = slice(partialArgs);
	      push.apply(args, arguments);
	    }
	    if (partialRightArgs || isCurry) {
	      args || (args = slice(arguments));
	      if (partialRightArgs) {
	        push.apply(args, partialRightArgs);
	      }
	      if (isCurry && args.length < arity) {
	        bitmask |= 16 & ~32;
	        return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
	      }
	    }
	    args || (args = arguments);
	    if (isBindKey) {
	      func = thisBinding[key];
	    }
	    if (this instanceof bound) {
	      thisBinding = baseCreate(func.prototype);
	      var result = func.apply(thisBinding, args);
	      return isObject(result) ? result : thisBinding;
	    }
	    return func.apply(thisBinding, args);
	  }
	  setBindData(bound, bindData);
	  return bound;
	}
	
	module.exports = baseCreateWrapper;


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash modularize modern exports="node" -o ./modern/`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	var isNative = __webpack_require__(31),
	    isObject = __webpack_require__(25),
	    noop = __webpack_require__(57);
	
	/* Native method shortcuts for methods with the same name as other `lodash` methods */
	var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate;
	
	/**
	 * The base implementation of `_.create` without support for assigning
	 * properties to the created object.
	 *
	 * @private
	 * @param {Object} prototype The object to inherit from.
	 * @returns {Object} Returns the new object.
	 */
	function baseCreate(prototype, properties) {
	  return isObject(prototype) ? nativeCreate(prototype) : {};
	}
	// fallback for browsers without `Object.create`
	if (!nativeCreate) {
	  baseCreate = (function() {
	    function Object() {}
	    return function(prototype) {
	      if (isObject(prototype)) {
	        Object.prototype = prototype;
	        var result = new Object;
	        Object.prototype = null;
	      }
	      return result || global.Object();
	    };
	  }());
	}
	
	module.exports = baseCreate;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }
/******/ ])
})

/*
//@ sourceMappingURL=fluxxor.js.map
*/