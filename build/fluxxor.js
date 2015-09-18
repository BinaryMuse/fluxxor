(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Fluxxor"] = factory();
	else
		root["Fluxxor"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Dispatcher = __webpack_require__(1),
	    Flux = __webpack_require__(82),
	    FluxMixin = __webpack_require__(91),
	    FluxChildMixin = __webpack_require__(92),
	    StoreWatchMixin = __webpack_require__(93),
	    createStore = __webpack_require__(94);
	
	var Fluxxor = {
	  Dispatcher: Dispatcher,
	  Flux: Flux,
	  FluxMixin: FluxMixin,
	  FluxChildMixin: FluxChildMixin,
	  StoreWatchMixin: StoreWatchMixin,
	  createStore: createStore,
	  version: __webpack_require__(96)
	};
	
	module.exports = Fluxxor;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var _clone = __webpack_require__(2),
	    _mapValues = __webpack_require__(34),
	    _forOwn = __webpack_require__(58),
	    _intersection = __webpack_require__(60),
	    _keys = __webpack_require__(8),
	    _map = __webpack_require__(68),
	    _each = __webpack_require__(73),
	    _size = __webpack_require__(75),
	    _findKey = __webpack_require__(76),
	    _uniq = __webpack_require__(79);
	
	var defaultDispatchInterceptor = function(action, dispatch) {
	  dispatch(action);
	};
	
	var Dispatcher = function(stores) {
	  this.stores = {};
	  this.currentDispatch = null;
	  this.currentActionType = null;
	  this.waitingToDispatch = [];
	  this.dispatchInterceptor = defaultDispatchInterceptor;
	  this._boundDispatch = this._dispatch.bind(this);
	
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
	  this.dispatchInterceptor(action, this._boundDispatch);
	};
	
	Dispatcher.prototype._dispatch = function(action) {
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
	
	Dispatcher.prototype.setDispatchInterceptor = function(fn) {
	  if (fn) {
	    this.dispatchInterceptor = fn;
	  } else {
	    this.dispatchInterceptor = defaultDispatchInterceptor;
	  }
	};
	
	module.exports = Dispatcher;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var baseClone = __webpack_require__(3),
	    bindCallback = __webpack_require__(31),
	    isIterateeCall = __webpack_require__(33);
	
	/**
	 * Creates a clone of `value`. If `isDeep` is `true` nested objects are cloned,
	 * otherwise they are assigned by reference. If `customizer` is provided it's
	 * invoked to produce the cloned values. If `customizer` returns `undefined`
	 * cloning is handled by the method instead. The `customizer` is bound to
	 * `thisArg` and invoked with up to three argument; (value [, index|key, object]).
	 *
	 * **Note:** This method is loosely based on the
	 * [structured clone algorithm](http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm).
	 * The enumerable properties of `arguments` objects and objects created by
	 * constructors other than `Object` are cloned to plain `Object` objects. An
	 * empty object is returned for uncloneable values such as functions, DOM nodes,
	 * Maps, Sets, and WeakMaps.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @param {Function} [customizer] The function to customize cloning values.
	 * @param {*} [thisArg] The `this` binding of `customizer`.
	 * @returns {*} Returns the cloned value.
	 * @example
	 *
	 * var users = [
	 *   { 'user': 'barney' },
	 *   { 'user': 'fred' }
	 * ];
	 *
	 * var shallow = _.clone(users);
	 * shallow[0] === users[0];
	 * // => true
	 *
	 * var deep = _.clone(users, true);
	 * deep[0] === users[0];
	 * // => false
	 *
	 * // using a customizer callback
	 * var el = _.clone(document.body, function(value) {
	 *   if (_.isElement(value)) {
	 *     return value.cloneNode(false);
	 *   }
	 * });
	 *
	 * el === document.body
	 * // => false
	 * el.nodeName
	 * // => BODY
	 * el.childNodes.length;
	 * // => 0
	 */
	function clone(value, isDeep, customizer, thisArg) {
	  if (isDeep && typeof isDeep != 'boolean' && isIterateeCall(value, isDeep, customizer)) {
	    isDeep = false;
	  }
	  else if (typeof isDeep == 'function') {
	    thisArg = customizer;
	    customizer = isDeep;
	    isDeep = false;
	  }
	  return typeof customizer == 'function'
	    ? baseClone(value, isDeep, bindCallback(customizer, thisArg, 3))
	    : baseClone(value, isDeep);
	}
	
	module.exports = clone;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var arrayCopy = __webpack_require__(4),
	    arrayEach = __webpack_require__(5),
	    baseAssign = __webpack_require__(6),
	    baseForOwn = __webpack_require__(23),
	    initCloneArray = __webpack_require__(27),
	    initCloneByTag = __webpack_require__(28),
	    initCloneObject = __webpack_require__(30),
	    isArray = __webpack_require__(20),
	    isObject = __webpack_require__(12);
	
	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    weakMapTag = '[object WeakMap]';
	
	var arrayBufferTag = '[object ArrayBuffer]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';
	
	/** Used to identify `toStringTag` values supported by `_.clone`. */
	var cloneableTags = {};
	cloneableTags[argsTag] = cloneableTags[arrayTag] =
	cloneableTags[arrayBufferTag] = cloneableTags[boolTag] =
	cloneableTags[dateTag] = cloneableTags[float32Tag] =
	cloneableTags[float64Tag] = cloneableTags[int8Tag] =
	cloneableTags[int16Tag] = cloneableTags[int32Tag] =
	cloneableTags[numberTag] = cloneableTags[objectTag] =
	cloneableTags[regexpTag] = cloneableTags[stringTag] =
	cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
	cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
	cloneableTags[errorTag] = cloneableTags[funcTag] =
	cloneableTags[mapTag] = cloneableTags[setTag] =
	cloneableTags[weakMapTag] = false;
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;
	
	/**
	 * The base implementation of `_.clone` without support for argument juggling
	 * and `this` binding `customizer` functions.
	 *
	 * @private
	 * @param {*} value The value to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @param {Function} [customizer] The function to customize cloning values.
	 * @param {string} [key] The key of `value`.
	 * @param {Object} [object] The object `value` belongs to.
	 * @param {Array} [stackA=[]] Tracks traversed source objects.
	 * @param {Array} [stackB=[]] Associates clones with source counterparts.
	 * @returns {*} Returns the cloned value.
	 */
	function baseClone(value, isDeep, customizer, key, object, stackA, stackB) {
	  var result;
	  if (customizer) {
	    result = object ? customizer(value, key, object) : customizer(value);
	  }
	  if (result !== undefined) {
	    return result;
	  }
	  if (!isObject(value)) {
	    return value;
	  }
	  var isArr = isArray(value);
	  if (isArr) {
	    result = initCloneArray(value);
	    if (!isDeep) {
	      return arrayCopy(value, result);
	    }
	  } else {
	    var tag = objToString.call(value),
	        isFunc = tag == funcTag;
	
	    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
	      result = initCloneObject(isFunc ? {} : value);
	      if (!isDeep) {
	        return baseAssign(result, value);
	      }
	    } else {
	      return cloneableTags[tag]
	        ? initCloneByTag(value, tag, isDeep)
	        : (object ? value : {});
	    }
	  }
	  // Check for circular references and return its corresponding clone.
	  stackA || (stackA = []);
	  stackB || (stackB = []);
	
	  var length = stackA.length;
	  while (length--) {
	    if (stackA[length] == value) {
	      return stackB[length];
	    }
	  }
	  // Add the source value to the stack of traversed objects and associate it with its clone.
	  stackA.push(value);
	  stackB.push(result);
	
	  // Recursively populate clone (susceptible to call stack limits).
	  (isArr ? arrayEach : baseForOwn)(value, function(subValue, key) {
	    result[key] = baseClone(subValue, isDeep, customizer, key, value, stackA, stackB);
	  });
	  return result;
	}
	
	module.exports = baseClone;


/***/ },
/* 4 */
/***/ function(module, exports) {

	/**
	 * Copies the values of `source` to `array`.
	 *
	 * @private
	 * @param {Array} source The array to copy values from.
	 * @param {Array} [array=[]] The array to copy values to.
	 * @returns {Array} Returns `array`.
	 */
	function arrayCopy(source, array) {
	  var index = -1,
	      length = source.length;
	
	  array || (array = Array(length));
	  while (++index < length) {
	    array[index] = source[index];
	  }
	  return array;
	}
	
	module.exports = arrayCopy;


/***/ },
/* 5 */
/***/ function(module, exports) {

	/**
	 * A specialized version of `_.forEach` for arrays without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns `array`.
	 */
	function arrayEach(array, iteratee) {
	  var index = -1,
	      length = array.length;
	
	  while (++index < length) {
	    if (iteratee(array[index], index, array) === false) {
	      break;
	    }
	  }
	  return array;
	}
	
	module.exports = arrayEach;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var baseCopy = __webpack_require__(7),
	    keys = __webpack_require__(8);
	
	/**
	 * The base implementation of `_.assign` without support for argument juggling,
	 * multiple sources, and `customizer` functions.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @returns {Object} Returns `object`.
	 */
	function baseAssign(object, source) {
	  return source == null
	    ? object
	    : baseCopy(source, keys(source), object);
	}
	
	module.exports = baseAssign;


/***/ },
/* 7 */
/***/ function(module, exports) {

	/**
	 * Copies properties of `source` to `object`.
	 *
	 * @private
	 * @param {Object} source The object to copy properties from.
	 * @param {Array} props The property names to copy.
	 * @param {Object} [object={}] The object to copy properties to.
	 * @returns {Object} Returns `object`.
	 */
	function baseCopy(source, props, object) {
	  object || (object = {});
	
	  var index = -1,
	      length = props.length;
	
	  while (++index < length) {
	    var key = props[index];
	    object[key] = source[key];
	  }
	  return object;
	}
	
	module.exports = baseCopy;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(9),
	    isArrayLike = __webpack_require__(14),
	    isObject = __webpack_require__(12),
	    shimKeys = __webpack_require__(18);
	
	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeKeys = getNative(Object, 'keys');
	
	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	var keys = !nativeKeys ? shimKeys : function(object) {
	  var Ctor = object == null ? undefined : object.constructor;
	  if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
	      (typeof object != 'function' && isArrayLike(object))) {
	    return shimKeys(object);
	  }
	  return isObject(object) ? nativeKeys(object) : [];
	};
	
	module.exports = keys;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var isNative = __webpack_require__(10);
	
	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = object == null ? undefined : object[key];
	  return isNative(value) ? value : undefined;
	}
	
	module.exports = getNative;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(11),
	    isObjectLike = __webpack_require__(13);
	
	/** Used to detect host constructors (Safari > 5). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to resolve the decompiled source of functions. */
	var fnToString = Function.prototype.toString;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);
	
	/**
	 * Checks if `value` is a native function.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
	 * @example
	 *
	 * _.isNative(Array.prototype.push);
	 * // => true
	 *
	 * _.isNative(_);
	 * // => false
	 */
	function isNative(value) {
	  if (value == null) {
	    return false;
	  }
	  if (isFunction(value)) {
	    return reIsNative.test(fnToString.call(value));
	  }
	  return isObjectLike(value) && reIsHostCtor.test(value);
	}
	
	module.exports = isNative;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(12);
	
	/** `Object#toString` result references. */
	var funcTag = '[object Function]';
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;
	
	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in older versions of Chrome and Safari which return 'function' for regexes
	  // and Safari 8 which returns 'object' for typed array constructors.
	  return isObject(value) && objToString.call(value) == funcTag;
	}
	
	module.exports = isFunction;


/***/ },
/* 12 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
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
	  // Avoid a V8 JIT bug in Chrome 19-20.
	  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}
	
	module.exports = isObject;


/***/ },
/* 13 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is object-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}
	
	module.exports = isObjectLike;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var getLength = __webpack_require__(15),
	    isLength = __webpack_require__(17);
	
	/**
	 * Checks if `value` is array-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 */
	function isArrayLike(value) {
	  return value != null && isLength(getLength(value));
	}
	
	module.exports = isArrayLike;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var baseProperty = __webpack_require__(16);
	
	/**
	 * Gets the "length" property value of `object`.
	 *
	 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
	 * that affects Safari on at least iOS 8.1-8.3 ARM64.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {*} Returns the "length" value.
	 */
	var getLength = baseProperty('length');
	
	module.exports = getLength;


/***/ },
/* 16 */
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new function.
	 */
	function baseProperty(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}
	
	module.exports = baseProperty;


/***/ },
/* 17 */
/***/ function(module, exports) {

	/**
	 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
	 * of an array-like value.
	 */
	var MAX_SAFE_INTEGER = 9007199254740991;
	
	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 */
	function isLength(value) {
	  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}
	
	module.exports = isLength;


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var isArguments = __webpack_require__(19),
	    isArray = __webpack_require__(20),
	    isIndex = __webpack_require__(21),
	    isLength = __webpack_require__(17),
	    keysIn = __webpack_require__(22);
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * A fallback implementation of `Object.keys` which creates an array of the
	 * own enumerable property names of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function shimKeys(object) {
	  var props = keysIn(object),
	      propsLength = props.length,
	      length = propsLength && object.length;
	
	  var allowIndexes = !!length && isLength(length) &&
	    (isArray(object) || isArguments(object));
	
	  var index = -1,
	      result = [];
	
	  while (++index < propsLength) {
	    var key = props[index];
	    if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
	      result.push(key);
	    }
	  }
	  return result;
	}
	
	module.exports = shimKeys;


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(14),
	    isObjectLike = __webpack_require__(13);
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/** Native method references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;
	
	/**
	 * Checks if `value` is classified as an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	  return isObjectLike(value) && isArrayLike(value) &&
	    hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
	}
	
	module.exports = isArguments;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(9),
	    isLength = __webpack_require__(17),
	    isObjectLike = __webpack_require__(13);
	
	/** `Object#toString` result references. */
	var arrayTag = '[object Array]';
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;
	
	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeIsArray = getNative(Array, 'isArray');
	
	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(function() { return arguments; }());
	 * // => false
	 */
	var isArray = nativeIsArray || function(value) {
	  return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
	};
	
	module.exports = isArray;


/***/ },
/* 21 */
/***/ function(module, exports) {

	/** Used to detect unsigned integer values. */
	var reIsUint = /^\d+$/;
	
	/**
	 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
	 * of an array-like value.
	 */
	var MAX_SAFE_INTEGER = 9007199254740991;
	
	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return value > -1 && value % 1 == 0 && value < length;
	}
	
	module.exports = isIndex;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var isArguments = __webpack_require__(19),
	    isArray = __webpack_require__(20),
	    isIndex = __webpack_require__(21),
	    isLength = __webpack_require__(17),
	    isObject = __webpack_require__(12);
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Creates an array of the own and inherited enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keysIn(new Foo);
	 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
	 */
	function keysIn(object) {
	  if (object == null) {
	    return [];
	  }
	  if (!isObject(object)) {
	    object = Object(object);
	  }
	  var length = object.length;
	  length = (length && isLength(length) &&
	    (isArray(object) || isArguments(object)) && length) || 0;
	
	  var Ctor = object.constructor,
	      index = -1,
	      isProto = typeof Ctor == 'function' && Ctor.prototype === object,
	      result = Array(length),
	      skipIndexes = length > 0;
	
	  while (++index < length) {
	    result[index] = (index + '');
	  }
	  for (var key in object) {
	    if (!(skipIndexes && isIndex(key, length)) &&
	        !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
	      result.push(key);
	    }
	  }
	  return result;
	}
	
	module.exports = keysIn;


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var baseFor = __webpack_require__(24),
	    keys = __webpack_require__(8);
	
	/**
	 * The base implementation of `_.forOwn` without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 */
	function baseForOwn(object, iteratee) {
	  return baseFor(object, iteratee, keys);
	}
	
	module.exports = baseForOwn;


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var createBaseFor = __webpack_require__(25);
	
	/**
	 * The base implementation of `baseForIn` and `baseForOwn` which iterates
	 * over `object` properties returned by `keysFunc` invoking `iteratee` for
	 * each property. Iteratee functions may exit iteration early by explicitly
	 * returning `false`.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @returns {Object} Returns `object`.
	 */
	var baseFor = createBaseFor();
	
	module.exports = baseFor;


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var toObject = __webpack_require__(26);
	
	/**
	 * Creates a base function for `_.forIn` or `_.forInRight`.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseFor(fromRight) {
	  return function(object, iteratee, keysFunc) {
	    var iterable = toObject(object),
	        props = keysFunc(object),
	        length = props.length,
	        index = fromRight ? length : -1;
	
	    while ((fromRight ? index-- : ++index < length)) {
	      var key = props[index];
	      if (iteratee(iterable[key], key, iterable) === false) {
	        break;
	      }
	    }
	    return object;
	  };
	}
	
	module.exports = createBaseFor;


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(12);
	
	/**
	 * Converts `value` to an object if it's not one.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {Object} Returns the object.
	 */
	function toObject(value) {
	  return isObject(value) ? value : Object(value);
	}
	
	module.exports = toObject;


/***/ },
/* 27 */
/***/ function(module, exports) {

	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Initializes an array clone.
	 *
	 * @private
	 * @param {Array} array The array to clone.
	 * @returns {Array} Returns the initialized clone.
	 */
	function initCloneArray(array) {
	  var length = array.length,
	      result = new array.constructor(length);
	
	  // Add array properties assigned by `RegExp#exec`.
	  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
	    result.index = array.index;
	    result.input = array.input;
	  }
	  return result;
	}
	
	module.exports = initCloneArray;


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var bufferClone = __webpack_require__(29);
	
	/** `Object#toString` result references. */
	var boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    numberTag = '[object Number]',
	    regexpTag = '[object RegExp]',
	    stringTag = '[object String]';
	
	var arrayBufferTag = '[object ArrayBuffer]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';
	
	/** Used to match `RegExp` flags from their coerced string values. */
	var reFlags = /\w*$/;
	
	/**
	 * Initializes an object clone based on its `toStringTag`.
	 *
	 * **Note:** This function only supports cloning values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to clone.
	 * @param {string} tag The `toStringTag` of the object to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the initialized clone.
	 */
	function initCloneByTag(object, tag, isDeep) {
	  var Ctor = object.constructor;
	  switch (tag) {
	    case arrayBufferTag:
	      return bufferClone(object);
	
	    case boolTag:
	    case dateTag:
	      return new Ctor(+object);
	
	    case float32Tag: case float64Tag:
	    case int8Tag: case int16Tag: case int32Tag:
	    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
	      var buffer = object.buffer;
	      return new Ctor(isDeep ? bufferClone(buffer) : buffer, object.byteOffset, object.length);
	
	    case numberTag:
	    case stringTag:
	      return new Ctor(object);
	
	    case regexpTag:
	      var result = new Ctor(object.source, reFlags.exec(object));
	      result.lastIndex = object.lastIndex;
	  }
	  return result;
	}
	
	module.exports = initCloneByTag;


/***/ },
/* 29 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/** Native method references. */
	var ArrayBuffer = global.ArrayBuffer,
	    Uint8Array = global.Uint8Array;
	
	/**
	 * Creates a clone of the given array buffer.
	 *
	 * @private
	 * @param {ArrayBuffer} buffer The array buffer to clone.
	 * @returns {ArrayBuffer} Returns the cloned array buffer.
	 */
	function bufferClone(buffer) {
	  var result = new ArrayBuffer(buffer.byteLength),
	      view = new Uint8Array(result);
	
	  view.set(new Uint8Array(buffer));
	  return result;
	}
	
	module.exports = bufferClone;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 30 */
/***/ function(module, exports) {

	/**
	 * Initializes an object clone.
	 *
	 * @private
	 * @param {Object} object The object to clone.
	 * @returns {Object} Returns the initialized clone.
	 */
	function initCloneObject(object) {
	  var Ctor = object.constructor;
	  if (!(typeof Ctor == 'function' && Ctor instanceof Ctor)) {
	    Ctor = Object;
	  }
	  return new Ctor;
	}
	
	module.exports = initCloneObject;


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var identity = __webpack_require__(32);
	
	/**
	 * A specialized version of `baseCallback` which only supports `this` binding
	 * and specifying the number of arguments to provide to `func`.
	 *
	 * @private
	 * @param {Function} func The function to bind.
	 * @param {*} thisArg The `this` binding of `func`.
	 * @param {number} [argCount] The number of arguments to provide to `func`.
	 * @returns {Function} Returns the callback.
	 */
	function bindCallback(func, thisArg, argCount) {
	  if (typeof func != 'function') {
	    return identity;
	  }
	  if (thisArg === undefined) {
	    return func;
	  }
	  switch (argCount) {
	    case 1: return function(value) {
	      return func.call(thisArg, value);
	    };
	    case 3: return function(value, index, collection) {
	      return func.call(thisArg, value, index, collection);
	    };
	    case 4: return function(accumulator, value, index, collection) {
	      return func.call(thisArg, accumulator, value, index, collection);
	    };
	    case 5: return function(value, other, key, object, source) {
	      return func.call(thisArg, value, other, key, object, source);
	    };
	  }
	  return function() {
	    return func.apply(thisArg, arguments);
	  };
	}
	
	module.exports = bindCallback;


/***/ },
/* 32 */
/***/ function(module, exports) {

	/**
	 * This method returns the first argument provided to it.
	 *
	 * @static
	 * @memberOf _
	 * @category Utility
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'user': 'fred' };
	 *
	 * _.identity(object) === object;
	 * // => true
	 */
	function identity(value) {
	  return value;
	}
	
	module.exports = identity;


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(14),
	    isIndex = __webpack_require__(21),
	    isObject = __webpack_require__(12);
	
	/**
	 * Checks if the provided arguments are from an iteratee call.
	 *
	 * @private
	 * @param {*} value The potential iteratee value argument.
	 * @param {*} index The potential iteratee index or key argument.
	 * @param {*} object The potential iteratee object argument.
	 * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
	 */
	function isIterateeCall(value, index, object) {
	  if (!isObject(object)) {
	    return false;
	  }
	  var type = typeof index;
	  if (type == 'number'
	      ? (isArrayLike(object) && isIndex(index, object.length))
	      : (type == 'string' && index in object)) {
	    var other = object[index];
	    return value === value ? (value === other) : (other !== other);
	  }
	  return false;
	}
	
	module.exports = isIterateeCall;


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var createObjectMapper = __webpack_require__(35);
	
	/**
	 * Creates an object with the same keys as `object` and values generated by
	 * running each own enumerable property of `object` through `iteratee`. The
	 * iteratee function is bound to `thisArg` and invoked with three arguments:
	 * (value, key, object).
	 *
	 * If a property name is provided for `iteratee` the created `_.property`
	 * style callback returns the property value of the given element.
	 *
	 * If a value is also provided for `thisArg` the created `_.matchesProperty`
	 * style callback returns `true` for elements that have a matching property
	 * value, else `false`.
	 *
	 * If an object is provided for `iteratee` the created `_.matches` style
	 * callback returns `true` for elements that have the properties of the given
	 * object, else `false`.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to iterate over.
	 * @param {Function|Object|string} [iteratee=_.identity] The function invoked
	 *  per iteration.
	 * @param {*} [thisArg] The `this` binding of `iteratee`.
	 * @returns {Object} Returns the new mapped object.
	 * @example
	 *
	 * _.mapValues({ 'a': 1, 'b': 2 }, function(n) {
	 *   return n * 3;
	 * });
	 * // => { 'a': 3, 'b': 6 }
	 *
	 * var users = {
	 *   'fred':    { 'user': 'fred',    'age': 40 },
	 *   'pebbles': { 'user': 'pebbles', 'age': 1 }
	 * };
	 *
	 * // using the `_.property` callback shorthand
	 * _.mapValues(users, 'age');
	 * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
	 */
	var mapValues = createObjectMapper();
	
	module.exports = mapValues;


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var baseCallback = __webpack_require__(36),
	    baseForOwn = __webpack_require__(23);
	
	/**
	 * Creates a function for `_.mapKeys` or `_.mapValues`.
	 *
	 * @private
	 * @param {boolean} [isMapKeys] Specify mapping keys instead of values.
	 * @returns {Function} Returns the new map function.
	 */
	function createObjectMapper(isMapKeys) {
	  return function(object, iteratee, thisArg) {
	    var result = {};
	    iteratee = baseCallback(iteratee, thisArg, 3);
	
	    baseForOwn(object, function(value, key, object) {
	      var mapped = iteratee(value, key, object);
	      key = isMapKeys ? mapped : key;
	      value = isMapKeys ? value : mapped;
	      result[key] = value;
	    });
	    return result;
	  };
	}
	
	module.exports = createObjectMapper;


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var baseMatches = __webpack_require__(37),
	    baseMatchesProperty = __webpack_require__(49),
	    bindCallback = __webpack_require__(31),
	    identity = __webpack_require__(32),
	    property = __webpack_require__(56);
	
	/**
	 * The base implementation of `_.callback` which supports specifying the
	 * number of arguments to provide to `func`.
	 *
	 * @private
	 * @param {*} [func=_.identity] The value to convert to a callback.
	 * @param {*} [thisArg] The `this` binding of `func`.
	 * @param {number} [argCount] The number of arguments to provide to `func`.
	 * @returns {Function} Returns the callback.
	 */
	function baseCallback(func, thisArg, argCount) {
	  var type = typeof func;
	  if (type == 'function') {
	    return thisArg === undefined
	      ? func
	      : bindCallback(func, thisArg, argCount);
	  }
	  if (func == null) {
	    return identity;
	  }
	  if (type == 'object') {
	    return baseMatches(func);
	  }
	  return thisArg === undefined
	    ? property(func)
	    : baseMatchesProperty(func, thisArg);
	}
	
	module.exports = baseCallback;


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsMatch = __webpack_require__(38),
	    getMatchData = __webpack_require__(46),
	    toObject = __webpack_require__(26);
	
	/**
	 * The base implementation of `_.matches` which does not clone `source`.
	 *
	 * @private
	 * @param {Object} source The object of property values to match.
	 * @returns {Function} Returns the new function.
	 */
	function baseMatches(source) {
	  var matchData = getMatchData(source);
	  if (matchData.length == 1 && matchData[0][2]) {
	    var key = matchData[0][0],
	        value = matchData[0][1];
	
	    return function(object) {
	      if (object == null) {
	        return false;
	      }
	      return object[key] === value && (value !== undefined || (key in toObject(object)));
	    };
	  }
	  return function(object) {
	    return baseIsMatch(object, matchData);
	  };
	}
	
	module.exports = baseMatches;


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsEqual = __webpack_require__(39),
	    toObject = __webpack_require__(26);
	
	/**
	 * The base implementation of `_.isMatch` without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Object} object The object to inspect.
	 * @param {Array} matchData The propery names, values, and compare flags to match.
	 * @param {Function} [customizer] The function to customize comparing objects.
	 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	 */
	function baseIsMatch(object, matchData, customizer) {
	  var index = matchData.length,
	      length = index,
	      noCustomizer = !customizer;
	
	  if (object == null) {
	    return !length;
	  }
	  object = toObject(object);
	  while (index--) {
	    var data = matchData[index];
	    if ((noCustomizer && data[2])
	          ? data[1] !== object[data[0]]
	          : !(data[0] in object)
	        ) {
	      return false;
	    }
	  }
	  while (++index < length) {
	    data = matchData[index];
	    var key = data[0],
	        objValue = object[key],
	        srcValue = data[1];
	
	    if (noCustomizer && data[2]) {
	      if (objValue === undefined && !(key in object)) {
	        return false;
	      }
	    } else {
	      var result = customizer ? customizer(objValue, srcValue, key) : undefined;
	      if (!(result === undefined ? baseIsEqual(srcValue, objValue, customizer, true) : result)) {
	        return false;
	      }
	    }
	  }
	  return true;
	}
	
	module.exports = baseIsMatch;


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsEqualDeep = __webpack_require__(40),
	    isObject = __webpack_require__(12),
	    isObjectLike = __webpack_require__(13);
	
	/**
	 * The base implementation of `_.isEqual` without support for `this` binding
	 * `customizer` functions.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @param {Function} [customizer] The function to customize comparing values.
	 * @param {boolean} [isLoose] Specify performing partial comparisons.
	 * @param {Array} [stackA] Tracks traversed `value` objects.
	 * @param {Array} [stackB] Tracks traversed `other` objects.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 */
	function baseIsEqual(value, other, customizer, isLoose, stackA, stackB) {
	  if (value === other) {
	    return true;
	  }
	  if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
	    return value !== value && other !== other;
	  }
	  return baseIsEqualDeep(value, other, baseIsEqual, customizer, isLoose, stackA, stackB);
	}
	
	module.exports = baseIsEqual;


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var equalArrays = __webpack_require__(41),
	    equalByTag = __webpack_require__(43),
	    equalObjects = __webpack_require__(44),
	    isArray = __webpack_require__(20),
	    isTypedArray = __webpack_require__(45);
	
	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    objectTag = '[object Object]';
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;
	
	/**
	 * A specialized version of `baseIsEqual` for arrays and objects which performs
	 * deep comparisons and tracks traversed objects enabling objects with circular
	 * references to be compared.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} [customizer] The function to customize comparing objects.
	 * @param {boolean} [isLoose] Specify performing partial comparisons.
	 * @param {Array} [stackA=[]] Tracks traversed `value` objects.
	 * @param {Array} [stackB=[]] Tracks traversed `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function baseIsEqualDeep(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
	  var objIsArr = isArray(object),
	      othIsArr = isArray(other),
	      objTag = arrayTag,
	      othTag = arrayTag;
	
	  if (!objIsArr) {
	    objTag = objToString.call(object);
	    if (objTag == argsTag) {
	      objTag = objectTag;
	    } else if (objTag != objectTag) {
	      objIsArr = isTypedArray(object);
	    }
	  }
	  if (!othIsArr) {
	    othTag = objToString.call(other);
	    if (othTag == argsTag) {
	      othTag = objectTag;
	    } else if (othTag != objectTag) {
	      othIsArr = isTypedArray(other);
	    }
	  }
	  var objIsObj = objTag == objectTag,
	      othIsObj = othTag == objectTag,
	      isSameTag = objTag == othTag;
	
	  if (isSameTag && !(objIsArr || objIsObj)) {
	    return equalByTag(object, other, objTag);
	  }
	  if (!isLoose) {
	    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
	        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');
	
	    if (objIsWrapped || othIsWrapped) {
	      return equalFunc(objIsWrapped ? object.value() : object, othIsWrapped ? other.value() : other, customizer, isLoose, stackA, stackB);
	    }
	  }
	  if (!isSameTag) {
	    return false;
	  }
	  // Assume cyclic values are equal.
	  // For more information on detecting circular references see https://es5.github.io/#JO.
	  stackA || (stackA = []);
	  stackB || (stackB = []);
	
	  var length = stackA.length;
	  while (length--) {
	    if (stackA[length] == object) {
	      return stackB[length] == other;
	    }
	  }
	  // Add `object` and `other` to the stack of traversed objects.
	  stackA.push(object);
	  stackB.push(other);
	
	  var result = (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, customizer, isLoose, stackA, stackB);
	
	  stackA.pop();
	  stackB.pop();
	
	  return result;
	}
	
	module.exports = baseIsEqualDeep;


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var arraySome = __webpack_require__(42);
	
	/**
	 * A specialized version of `baseIsEqualDeep` for arrays with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Array} array The array to compare.
	 * @param {Array} other The other array to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} [customizer] The function to customize comparing arrays.
	 * @param {boolean} [isLoose] Specify performing partial comparisons.
	 * @param {Array} [stackA] Tracks traversed `value` objects.
	 * @param {Array} [stackB] Tracks traversed `other` objects.
	 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	 */
	function equalArrays(array, other, equalFunc, customizer, isLoose, stackA, stackB) {
	  var index = -1,
	      arrLength = array.length,
	      othLength = other.length;
	
	  if (arrLength != othLength && !(isLoose && othLength > arrLength)) {
	    return false;
	  }
	  // Ignore non-index properties.
	  while (++index < arrLength) {
	    var arrValue = array[index],
	        othValue = other[index],
	        result = customizer ? customizer(isLoose ? othValue : arrValue, isLoose ? arrValue : othValue, index) : undefined;
	
	    if (result !== undefined) {
	      if (result) {
	        continue;
	      }
	      return false;
	    }
	    // Recursively compare arrays (susceptible to call stack limits).
	    if (isLoose) {
	      if (!arraySome(other, function(othValue) {
	            return arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB);
	          })) {
	        return false;
	      }
	    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB))) {
	      return false;
	    }
	  }
	  return true;
	}
	
	module.exports = equalArrays;


/***/ },
/* 42 */
/***/ function(module, exports) {

	/**
	 * A specialized version of `_.some` for arrays without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {boolean} Returns `true` if any element passes the predicate check,
	 *  else `false`.
	 */
	function arraySome(array, predicate) {
	  var index = -1,
	      length = array.length;
	
	  while (++index < length) {
	    if (predicate(array[index], index, array)) {
	      return true;
	    }
	  }
	  return false;
	}
	
	module.exports = arraySome;


/***/ },
/* 43 */
/***/ function(module, exports) {

	/** `Object#toString` result references. */
	var boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    numberTag = '[object Number]',
	    regexpTag = '[object RegExp]',
	    stringTag = '[object String]';
	
	/**
	 * A specialized version of `baseIsEqualDeep` for comparing objects of
	 * the same `toStringTag`.
	 *
	 * **Note:** This function only supports comparing values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {string} tag The `toStringTag` of the objects to compare.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalByTag(object, other, tag) {
	  switch (tag) {
	    case boolTag:
	    case dateTag:
	      // Coerce dates and booleans to numbers, dates to milliseconds and booleans
	      // to `1` or `0` treating invalid dates coerced to `NaN` as not equal.
	      return +object == +other;
	
	    case errorTag:
	      return object.name == other.name && object.message == other.message;
	
	    case numberTag:
	      // Treat `NaN` vs. `NaN` as equal.
	      return (object != +object)
	        ? other != +other
	        : object == +other;
	
	    case regexpTag:
	    case stringTag:
	      // Coerce regexes to strings and treat strings primitives and string
	      // objects as equal. See https://es5.github.io/#x15.10.6.4 for more details.
	      return object == (other + '');
	  }
	  return false;
	}
	
	module.exports = equalByTag;


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var keys = __webpack_require__(8);
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * A specialized version of `baseIsEqualDeep` for objects with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} [customizer] The function to customize comparing values.
	 * @param {boolean} [isLoose] Specify performing partial comparisons.
	 * @param {Array} [stackA] Tracks traversed `value` objects.
	 * @param {Array} [stackB] Tracks traversed `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalObjects(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
	  var objProps = keys(object),
	      objLength = objProps.length,
	      othProps = keys(other),
	      othLength = othProps.length;
	
	  if (objLength != othLength && !isLoose) {
	    return false;
	  }
	  var index = objLength;
	  while (index--) {
	    var key = objProps[index];
	    if (!(isLoose ? key in other : hasOwnProperty.call(other, key))) {
	      return false;
	    }
	  }
	  var skipCtor = isLoose;
	  while (++index < objLength) {
	    key = objProps[index];
	    var objValue = object[key],
	        othValue = other[key],
	        result = customizer ? customizer(isLoose ? othValue : objValue, isLoose? objValue : othValue, key) : undefined;
	
	    // Recursively compare objects (susceptible to call stack limits).
	    if (!(result === undefined ? equalFunc(objValue, othValue, customizer, isLoose, stackA, stackB) : result)) {
	      return false;
	    }
	    skipCtor || (skipCtor = key == 'constructor');
	  }
	  if (!skipCtor) {
	    var objCtor = object.constructor,
	        othCtor = other.constructor;
	
	    // Non `Object` object instances with different constructors are not equal.
	    if (objCtor != othCtor &&
	        ('constructor' in object && 'constructor' in other) &&
	        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
	          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
	      return false;
	    }
	  }
	  return true;
	}
	
	module.exports = equalObjects;


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var isLength = __webpack_require__(17),
	    isObjectLike = __webpack_require__(13);
	
	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    weakMapTag = '[object WeakMap]';
	
	var arrayBufferTag = '[object ArrayBuffer]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';
	
	/** Used to identify `toStringTag` values of typed arrays. */
	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
	typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
	typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
	typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
	typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
	typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
	typedArrayTags[dateTag] = typedArrayTags[errorTag] =
	typedArrayTags[funcTag] = typedArrayTags[mapTag] =
	typedArrayTags[numberTag] = typedArrayTags[objectTag] =
	typedArrayTags[regexpTag] = typedArrayTags[setTag] =
	typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;
	
	/**
	 * Checks if `value` is classified as a typed array.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isTypedArray(new Uint8Array);
	 * // => true
	 *
	 * _.isTypedArray([]);
	 * // => false
	 */
	function isTypedArray(value) {
	  return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objToString.call(value)];
	}
	
	module.exports = isTypedArray;


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var isStrictComparable = __webpack_require__(47),
	    pairs = __webpack_require__(48);
	
	/**
	 * Gets the propery names, values, and compare flags of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the match data of `object`.
	 */
	function getMatchData(object) {
	  var result = pairs(object),
	      length = result.length;
	
	  while (length--) {
	    result[length][2] = isStrictComparable(result[length][1]);
	  }
	  return result;
	}
	
	module.exports = getMatchData;


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(12);
	
	/**
	 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` if suitable for strict
	 *  equality comparisons, else `false`.
	 */
	function isStrictComparable(value) {
	  return value === value && !isObject(value);
	}
	
	module.exports = isStrictComparable;


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	var keys = __webpack_require__(8),
	    toObject = __webpack_require__(26);
	
	/**
	 * Creates a two dimensional array of the key-value pairs for `object`,
	 * e.g. `[[key1, value1], [key2, value2]]`.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the new array of key-value pairs.
	 * @example
	 *
	 * _.pairs({ 'barney': 36, 'fred': 40 });
	 * // => [['barney', 36], ['fred', 40]] (iteration order is not guaranteed)
	 */
	function pairs(object) {
	  object = toObject(object);
	
	  var index = -1,
	      props = keys(object),
	      length = props.length,
	      result = Array(length);
	
	  while (++index < length) {
	    var key = props[index];
	    result[index] = [key, object[key]];
	  }
	  return result;
	}
	
	module.exports = pairs;


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(50),
	    baseIsEqual = __webpack_require__(39),
	    baseSlice = __webpack_require__(51),
	    isArray = __webpack_require__(20),
	    isKey = __webpack_require__(52),
	    isStrictComparable = __webpack_require__(47),
	    last = __webpack_require__(53),
	    toObject = __webpack_require__(26),
	    toPath = __webpack_require__(54);
	
	/**
	 * The base implementation of `_.matchesProperty` which does not clone `srcValue`.
	 *
	 * @private
	 * @param {string} path The path of the property to get.
	 * @param {*} srcValue The value to compare.
	 * @returns {Function} Returns the new function.
	 */
	function baseMatchesProperty(path, srcValue) {
	  var isArr = isArray(path),
	      isCommon = isKey(path) && isStrictComparable(srcValue),
	      pathKey = (path + '');
	
	  path = toPath(path);
	  return function(object) {
	    if (object == null) {
	      return false;
	    }
	    var key = pathKey;
	    object = toObject(object);
	    if ((isArr || !isCommon) && !(key in object)) {
	      object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
	      if (object == null) {
	        return false;
	      }
	      key = last(path);
	      object = toObject(object);
	    }
	    return object[key] === srcValue
	      ? (srcValue !== undefined || (key in object))
	      : baseIsEqual(srcValue, object[key], undefined, true);
	  };
	}
	
	module.exports = baseMatchesProperty;


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	var toObject = __webpack_require__(26);
	
	/**
	 * The base implementation of `get` without support for string paths
	 * and default values.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array} path The path of the property to get.
	 * @param {string} [pathKey] The key representation of path.
	 * @returns {*} Returns the resolved value.
	 */
	function baseGet(object, path, pathKey) {
	  if (object == null) {
	    return;
	  }
	  if (pathKey !== undefined && pathKey in toObject(object)) {
	    path = [pathKey];
	  }
	  var index = 0,
	      length = path.length;
	
	  while (object != null && index < length) {
	    object = object[path[index++]];
	  }
	  return (index && index == length) ? object : undefined;
	}
	
	module.exports = baseGet;


/***/ },
/* 51 */
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.slice` without an iteratee call guard.
	 *
	 * @private
	 * @param {Array} array The array to slice.
	 * @param {number} [start=0] The start position.
	 * @param {number} [end=array.length] The end position.
	 * @returns {Array} Returns the slice of `array`.
	 */
	function baseSlice(array, start, end) {
	  var index = -1,
	      length = array.length;
	
	  start = start == null ? 0 : (+start || 0);
	  if (start < 0) {
	    start = -start > length ? 0 : (length + start);
	  }
	  end = (end === undefined || end > length) ? length : (+end || 0);
	  if (end < 0) {
	    end += length;
	  }
	  length = start > end ? 0 : ((end - start) >>> 0);
	  start >>>= 0;
	
	  var result = Array(length);
	  while (++index < length) {
	    result[index] = array[index + start];
	  }
	  return result;
	}
	
	module.exports = baseSlice;


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(20),
	    toObject = __webpack_require__(26);
	
	/** Used to match property names within property paths. */
	var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,
	    reIsPlainProp = /^\w*$/;
	
	/**
	 * Checks if `value` is a property name and not a property path.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
	 */
	function isKey(value, object) {
	  var type = typeof value;
	  if ((type == 'string' && reIsPlainProp.test(value)) || type == 'number') {
	    return true;
	  }
	  if (isArray(value)) {
	    return false;
	  }
	  var result = !reIsDeepProp.test(value);
	  return result || (object != null && value in toObject(object));
	}
	
	module.exports = isKey;


/***/ },
/* 53 */
/***/ function(module, exports) {

	/**
	 * Gets the last element of `array`.
	 *
	 * @static
	 * @memberOf _
	 * @category Array
	 * @param {Array} array The array to query.
	 * @returns {*} Returns the last element of `array`.
	 * @example
	 *
	 * _.last([1, 2, 3]);
	 * // => 3
	 */
	function last(array) {
	  var length = array ? array.length : 0;
	  return length ? array[length - 1] : undefined;
	}
	
	module.exports = last;


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	var baseToString = __webpack_require__(55),
	    isArray = __webpack_require__(20);
	
	/** Used to match property names within property paths. */
	var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g;
	
	/** Used to match backslashes in property paths. */
	var reEscapeChar = /\\(\\)?/g;
	
	/**
	 * Converts `value` to property path array if it's not one.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {Array} Returns the property path array.
	 */
	function toPath(value) {
	  if (isArray(value)) {
	    return value;
	  }
	  var result = [];
	  baseToString(value).replace(rePropName, function(match, number, quote, string) {
	    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
	  });
	  return result;
	}
	
	module.exports = toPath;


/***/ },
/* 55 */
/***/ function(module, exports) {

	/**
	 * Converts `value` to a string if it's not one. An empty string is returned
	 * for `null` or `undefined` values.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 */
	function baseToString(value) {
	  return value == null ? '' : (value + '');
	}
	
	module.exports = baseToString;


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	var baseProperty = __webpack_require__(16),
	    basePropertyDeep = __webpack_require__(57),
	    isKey = __webpack_require__(52);
	
	/**
	 * Creates a function that returns the property value at `path` on a
	 * given object.
	 *
	 * @static
	 * @memberOf _
	 * @category Utility
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new function.
	 * @example
	 *
	 * var objects = [
	 *   { 'a': { 'b': { 'c': 2 } } },
	 *   { 'a': { 'b': { 'c': 1 } } }
	 * ];
	 *
	 * _.map(objects, _.property('a.b.c'));
	 * // => [2, 1]
	 *
	 * _.pluck(_.sortBy(objects, _.property(['a', 'b', 'c'])), 'a.b.c');
	 * // => [1, 2]
	 */
	function property(path) {
	  return isKey(path) ? baseProperty(path) : basePropertyDeep(path);
	}
	
	module.exports = property;


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(50),
	    toPath = __webpack_require__(54);
	
	/**
	 * A specialized version of `baseProperty` which supports deep paths.
	 *
	 * @private
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new function.
	 */
	function basePropertyDeep(path) {
	  var pathKey = (path + '');
	  path = toPath(path);
	  return function(object) {
	    return baseGet(object, path, pathKey);
	  };
	}
	
	module.exports = basePropertyDeep;


/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	var baseForOwn = __webpack_require__(23),
	    createForOwn = __webpack_require__(59);
	
	/**
	 * Iterates over own enumerable properties of an object invoking `iteratee`
	 * for each property. The `iteratee` is bound to `thisArg` and invoked with
	 * three arguments: (value, key, object). Iteratee functions may exit iteration
	 * early by explicitly returning `false`.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to iterate over.
	 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	 * @param {*} [thisArg] The `this` binding of `iteratee`.
	 * @returns {Object} Returns `object`.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.forOwn(new Foo, function(value, key) {
	 *   console.log(key);
	 * });
	 * // => logs 'a' and 'b' (iteration order is not guaranteed)
	 */
	var forOwn = createForOwn(baseForOwn);
	
	module.exports = forOwn;


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	var bindCallback = __webpack_require__(31);
	
	/**
	 * Creates a function for `_.forOwn` or `_.forOwnRight`.
	 *
	 * @private
	 * @param {Function} objectFunc The function to iterate over an object.
	 * @returns {Function} Returns the new each function.
	 */
	function createForOwn(objectFunc) {
	  return function(object, iteratee, thisArg) {
	    if (typeof iteratee != 'function' || thisArg !== undefined) {
	      iteratee = bindCallback(iteratee, thisArg, 3);
	    }
	    return objectFunc(object, iteratee);
	  };
	}
	
	module.exports = createForOwn;


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	var baseIndexOf = __webpack_require__(61),
	    cacheIndexOf = __webpack_require__(63),
	    createCache = __webpack_require__(64),
	    isArrayLike = __webpack_require__(14),
	    restParam = __webpack_require__(67);
	
	/**
	 * Creates an array of unique values that are included in all of the provided
	 * arrays using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	 * for equality comparisons.
	 *
	 * @static
	 * @memberOf _
	 * @category Array
	 * @param {...Array} [arrays] The arrays to inspect.
	 * @returns {Array} Returns the new array of shared values.
	 * @example
	 * _.intersection([1, 2], [4, 2], [2, 1]);
	 * // => [2]
	 */
	var intersection = restParam(function(arrays) {
	  var othLength = arrays.length,
	      othIndex = othLength,
	      caches = Array(length),
	      indexOf = baseIndexOf,
	      isCommon = true,
	      result = [];
	
	  while (othIndex--) {
	    var value = arrays[othIndex] = isArrayLike(value = arrays[othIndex]) ? value : [];
	    caches[othIndex] = (isCommon && value.length >= 120) ? createCache(othIndex && value) : null;
	  }
	  var array = arrays[0],
	      index = -1,
	      length = array ? array.length : 0,
	      seen = caches[0];
	
	  outer:
	  while (++index < length) {
	    value = array[index];
	    if ((seen ? cacheIndexOf(seen, value) : indexOf(result, value, 0)) < 0) {
	      var othIndex = othLength;
	      while (--othIndex) {
	        var cache = caches[othIndex];
	        if ((cache ? cacheIndexOf(cache, value) : indexOf(arrays[othIndex], value, 0)) < 0) {
	          continue outer;
	        }
	      }
	      if (seen) {
	        seen.push(value);
	      }
	      result.push(value);
	    }
	  }
	  return result;
	});
	
	module.exports = intersection;


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	var indexOfNaN = __webpack_require__(62);
	
	/**
	 * The base implementation of `_.indexOf` without support for binary searches.
	 *
	 * @private
	 * @param {Array} array The array to search.
	 * @param {*} value The value to search for.
	 * @param {number} fromIndex The index to search from.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function baseIndexOf(array, value, fromIndex) {
	  if (value !== value) {
	    return indexOfNaN(array, fromIndex);
	  }
	  var index = fromIndex - 1,
	      length = array.length;
	
	  while (++index < length) {
	    if (array[index] === value) {
	      return index;
	    }
	  }
	  return -1;
	}
	
	module.exports = baseIndexOf;


/***/ },
/* 62 */
/***/ function(module, exports) {

	/**
	 * Gets the index at which the first occurrence of `NaN` is found in `array`.
	 *
	 * @private
	 * @param {Array} array The array to search.
	 * @param {number} fromIndex The index to search from.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {number} Returns the index of the matched `NaN`, else `-1`.
	 */
	function indexOfNaN(array, fromIndex, fromRight) {
	  var length = array.length,
	      index = fromIndex + (fromRight ? 0 : -1);
	
	  while ((fromRight ? index-- : ++index < length)) {
	    var other = array[index];
	    if (other !== other) {
	      return index;
	    }
	  }
	  return -1;
	}
	
	module.exports = indexOfNaN;


/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(12);
	
	/**
	 * Checks if `value` is in `cache` mimicking the return signature of
	 * `_.indexOf` by returning `0` if the value is found, else `-1`.
	 *
	 * @private
	 * @param {Object} cache The cache to search.
	 * @param {*} value The value to search for.
	 * @returns {number} Returns `0` if `value` is found, else `-1`.
	 */
	function cacheIndexOf(cache, value) {
	  var data = cache.data,
	      result = (typeof value == 'string' || isObject(value)) ? data.set.has(value) : data.hash[value];
	
	  return result ? 0 : -1;
	}
	
	module.exports = cacheIndexOf;


/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var SetCache = __webpack_require__(65),
	    getNative = __webpack_require__(9);
	
	/** Native method references. */
	var Set = getNative(global, 'Set');
	
	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeCreate = getNative(Object, 'create');
	
	/**
	 * Creates a `Set` cache object to optimize linear searches of large arrays.
	 *
	 * @private
	 * @param {Array} [values] The values to cache.
	 * @returns {null|Object} Returns the new cache object if `Set` is supported, else `null`.
	 */
	function createCache(values) {
	  return (nativeCreate && Set) ? new SetCache(values) : null;
	}
	
	module.exports = createCache;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var cachePush = __webpack_require__(66),
	    getNative = __webpack_require__(9);
	
	/** Native method references. */
	var Set = getNative(global, 'Set');
	
	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeCreate = getNative(Object, 'create');
	
	/**
	 *
	 * Creates a cache object to store unique values.
	 *
	 * @private
	 * @param {Array} [values] The values to cache.
	 */
	function SetCache(values) {
	  var length = values ? values.length : 0;
	
	  this.data = { 'hash': nativeCreate(null), 'set': new Set };
	  while (length--) {
	    this.push(values[length]);
	  }
	}
	
	// Add functions to the `Set` cache.
	SetCache.prototype.push = cachePush;
	
	module.exports = SetCache;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(12);
	
	/**
	 * Adds `value` to the cache.
	 *
	 * @private
	 * @name push
	 * @memberOf SetCache
	 * @param {*} value The value to cache.
	 */
	function cachePush(value) {
	  var data = this.data;
	  if (typeof value == 'string' || isObject(value)) {
	    data.set.add(value);
	  } else {
	    data.hash[value] = true;
	  }
	}
	
	module.exports = cachePush;


/***/ },
/* 67 */
/***/ function(module, exports) {

	/** Used as the `TypeError` message for "Functions" methods. */
	var FUNC_ERROR_TEXT = 'Expected a function';
	
	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;
	
	/**
	 * Creates a function that invokes `func` with the `this` binding of the
	 * created function and arguments from `start` and beyond provided as an array.
	 *
	 * **Note:** This method is based on the [rest parameter](https://developer.mozilla.org/Web/JavaScript/Reference/Functions/rest_parameters).
	 *
	 * @static
	 * @memberOf _
	 * @category Function
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @returns {Function} Returns the new function.
	 * @example
	 *
	 * var say = _.restParam(function(what, names) {
	 *   return what + ' ' + _.initial(names).join(', ') +
	 *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
	 * });
	 *
	 * say('hello', 'fred', 'barney', 'pebbles');
	 * // => 'hello fred, barney, & pebbles'
	 */
	function restParam(func, start) {
	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  start = nativeMax(start === undefined ? (func.length - 1) : (+start || 0), 0);
	  return function() {
	    var args = arguments,
	        index = -1,
	        length = nativeMax(args.length - start, 0),
	        rest = Array(length);
	
	    while (++index < length) {
	      rest[index] = args[start + index];
	    }
	    switch (start) {
	      case 0: return func.call(this, rest);
	      case 1: return func.call(this, args[0], rest);
	      case 2: return func.call(this, args[0], args[1], rest);
	    }
	    var otherArgs = Array(start + 1);
	    index = -1;
	    while (++index < start) {
	      otherArgs[index] = args[index];
	    }
	    otherArgs[start] = rest;
	    return func.apply(this, otherArgs);
	  };
	}
	
	module.exports = restParam;


/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	var arrayMap = __webpack_require__(69),
	    baseCallback = __webpack_require__(36),
	    baseMap = __webpack_require__(70),
	    isArray = __webpack_require__(20);
	
	/**
	 * Creates an array of values by running each element in `collection` through
	 * `iteratee`. The `iteratee` is bound to `thisArg` and invoked with three
	 * arguments: (value, index|key, collection).
	 *
	 * If a property name is provided for `iteratee` the created `_.property`
	 * style callback returns the property value of the given element.
	 *
	 * If a value is also provided for `thisArg` the created `_.matchesProperty`
	 * style callback returns `true` for elements that have a matching property
	 * value, else `false`.
	 *
	 * If an object is provided for `iteratee` the created `_.matches` style
	 * callback returns `true` for elements that have the properties of the given
	 * object, else `false`.
	 *
	 * Many lodash methods are guarded to work as iteratees for methods like
	 * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
	 *
	 * The guarded methods are:
	 * `ary`, `callback`, `chunk`, `clone`, `create`, `curry`, `curryRight`,
	 * `drop`, `dropRight`, `every`, `fill`, `flatten`, `invert`, `max`, `min`,
	 * `parseInt`, `slice`, `sortBy`, `take`, `takeRight`, `template`, `trim`,
	 * `trimLeft`, `trimRight`, `trunc`, `random`, `range`, `sample`, `some`,
	 * `sum`, `uniq`, and `words`
	 *
	 * @static
	 * @memberOf _
	 * @alias collect
	 * @category Collection
	 * @param {Array|Object|string} collection The collection to iterate over.
	 * @param {Function|Object|string} [iteratee=_.identity] The function invoked
	 *  per iteration.
	 * @param {*} [thisArg] The `this` binding of `iteratee`.
	 * @returns {Array} Returns the new mapped array.
	 * @example
	 *
	 * function timesThree(n) {
	 *   return n * 3;
	 * }
	 *
	 * _.map([1, 2], timesThree);
	 * // => [3, 6]
	 *
	 * _.map({ 'a': 1, 'b': 2 }, timesThree);
	 * // => [3, 6] (iteration order is not guaranteed)
	 *
	 * var users = [
	 *   { 'user': 'barney' },
	 *   { 'user': 'fred' }
	 * ];
	 *
	 * // using the `_.property` callback shorthand
	 * _.map(users, 'user');
	 * // => ['barney', 'fred']
	 */
	function map(collection, iteratee, thisArg) {
	  var func = isArray(collection) ? arrayMap : baseMap;
	  iteratee = baseCallback(iteratee, thisArg, 3);
	  return func(collection, iteratee);
	}
	
	module.exports = map;


/***/ },
/* 69 */
/***/ function(module, exports) {

	/**
	 * A specialized version of `_.map` for arrays without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	function arrayMap(array, iteratee) {
	  var index = -1,
	      length = array.length,
	      result = Array(length);
	
	  while (++index < length) {
	    result[index] = iteratee(array[index], index, array);
	  }
	  return result;
	}
	
	module.exports = arrayMap;


/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	var baseEach = __webpack_require__(71),
	    isArrayLike = __webpack_require__(14);
	
	/**
	 * The base implementation of `_.map` without support for callback shorthands
	 * and `this` binding.
	 *
	 * @private
	 * @param {Array|Object|string} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	function baseMap(collection, iteratee) {
	  var index = -1,
	      result = isArrayLike(collection) ? Array(collection.length) : [];
	
	  baseEach(collection, function(value, key, collection) {
	    result[++index] = iteratee(value, key, collection);
	  });
	  return result;
	}
	
	module.exports = baseMap;


/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	var baseForOwn = __webpack_require__(23),
	    createBaseEach = __webpack_require__(72);
	
	/**
	 * The base implementation of `_.forEach` without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Array|Object|string} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array|Object|string} Returns `collection`.
	 */
	var baseEach = createBaseEach(baseForOwn);
	
	module.exports = baseEach;


/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	var getLength = __webpack_require__(15),
	    isLength = __webpack_require__(17),
	    toObject = __webpack_require__(26);
	
	/**
	 * Creates a `baseEach` or `baseEachRight` function.
	 *
	 * @private
	 * @param {Function} eachFunc The function to iterate over a collection.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseEach(eachFunc, fromRight) {
	  return function(collection, iteratee) {
	    var length = collection ? getLength(collection) : 0;
	    if (!isLength(length)) {
	      return eachFunc(collection, iteratee);
	    }
	    var index = fromRight ? length : -1,
	        iterable = toObject(collection);
	
	    while ((fromRight ? index-- : ++index < length)) {
	      if (iteratee(iterable[index], index, iterable) === false) {
	        break;
	      }
	    }
	    return collection;
	  };
	}
	
	module.exports = createBaseEach;


/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	var arrayEach = __webpack_require__(5),
	    baseEach = __webpack_require__(71),
	    createForEach = __webpack_require__(74);
	
	/**
	 * Iterates over elements of `collection` invoking `iteratee` for each element.
	 * The `iteratee` is bound to `thisArg` and invoked with three arguments:
	 * (value, index|key, collection). Iteratee functions may exit iteration early
	 * by explicitly returning `false`.
	 *
	 * **Note:** As with other "Collections" methods, objects with a "length" property
	 * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
	 * may be used for object iteration.
	 *
	 * @static
	 * @memberOf _
	 * @alias each
	 * @category Collection
	 * @param {Array|Object|string} collection The collection to iterate over.
	 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	 * @param {*} [thisArg] The `this` binding of `iteratee`.
	 * @returns {Array|Object|string} Returns `collection`.
	 * @example
	 *
	 * _([1, 2]).forEach(function(n) {
	 *   console.log(n);
	 * }).value();
	 * // => logs each value from left to right and returns the array
	 *
	 * _.forEach({ 'a': 1, 'b': 2 }, function(n, key) {
	 *   console.log(n, key);
	 * });
	 * // => logs each value-key pair and returns the object (iteration order is not guaranteed)
	 */
	var forEach = createForEach(arrayEach, baseEach);
	
	module.exports = forEach;


/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	var bindCallback = __webpack_require__(31),
	    isArray = __webpack_require__(20);
	
	/**
	 * Creates a function for `_.forEach` or `_.forEachRight`.
	 *
	 * @private
	 * @param {Function} arrayFunc The function to iterate over an array.
	 * @param {Function} eachFunc The function to iterate over a collection.
	 * @returns {Function} Returns the new each function.
	 */
	function createForEach(arrayFunc, eachFunc) {
	  return function(collection, iteratee, thisArg) {
	    return (typeof iteratee == 'function' && thisArg === undefined && isArray(collection))
	      ? arrayFunc(collection, iteratee)
	      : eachFunc(collection, bindCallback(iteratee, thisArg, 3));
	  };
	}
	
	module.exports = createForEach;


/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	var getLength = __webpack_require__(15),
	    isLength = __webpack_require__(17),
	    keys = __webpack_require__(8);
	
	/**
	 * Gets the size of `collection` by returning its length for array-like
	 * values or the number of own enumerable properties for objects.
	 *
	 * @static
	 * @memberOf _
	 * @category Collection
	 * @param {Array|Object|string} collection The collection to inspect.
	 * @returns {number} Returns the size of `collection`.
	 * @example
	 *
	 * _.size([1, 2, 3]);
	 * // => 3
	 *
	 * _.size({ 'a': 1, 'b': 2 });
	 * // => 2
	 *
	 * _.size('pebbles');
	 * // => 7
	 */
	function size(collection) {
	  var length = collection ? getLength(collection) : 0;
	  return isLength(length) ? length : keys(collection).length;
	}
	
	module.exports = size;


/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	var baseForOwn = __webpack_require__(23),
	    createFindKey = __webpack_require__(77);
	
	/**
	 * This method is like `_.find` except that it returns the key of the first
	 * element `predicate` returns truthy for instead of the element itself.
	 *
	 * If a property name is provided for `predicate` the created `_.property`
	 * style callback returns the property value of the given element.
	 *
	 * If a value is also provided for `thisArg` the created `_.matchesProperty`
	 * style callback returns `true` for elements that have a matching property
	 * value, else `false`.
	 *
	 * If an object is provided for `predicate` the created `_.matches` style
	 * callback returns `true` for elements that have the properties of the given
	 * object, else `false`.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to search.
	 * @param {Function|Object|string} [predicate=_.identity] The function invoked
	 *  per iteration.
	 * @param {*} [thisArg] The `this` binding of `predicate`.
	 * @returns {string|undefined} Returns the key of the matched element, else `undefined`.
	 * @example
	 *
	 * var users = {
	 *   'barney':  { 'age': 36, 'active': true },
	 *   'fred':    { 'age': 40, 'active': false },
	 *   'pebbles': { 'age': 1,  'active': true }
	 * };
	 *
	 * _.findKey(users, function(chr) {
	 *   return chr.age < 40;
	 * });
	 * // => 'barney' (iteration order is not guaranteed)
	 *
	 * // using the `_.matches` callback shorthand
	 * _.findKey(users, { 'age': 1, 'active': true });
	 * // => 'pebbles'
	 *
	 * // using the `_.matchesProperty` callback shorthand
	 * _.findKey(users, 'active', false);
	 * // => 'fred'
	 *
	 * // using the `_.property` callback shorthand
	 * _.findKey(users, 'active');
	 * // => 'barney'
	 */
	var findKey = createFindKey(baseForOwn);
	
	module.exports = findKey;


/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	var baseCallback = __webpack_require__(36),
	    baseFind = __webpack_require__(78);
	
	/**
	 * Creates a `_.findKey` or `_.findLastKey` function.
	 *
	 * @private
	 * @param {Function} objectFunc The function to iterate over an object.
	 * @returns {Function} Returns the new find function.
	 */
	function createFindKey(objectFunc) {
	  return function(object, predicate, thisArg) {
	    predicate = baseCallback(predicate, thisArg, 3);
	    return baseFind(object, predicate, objectFunc, true);
	  };
	}
	
	module.exports = createFindKey;


/***/ },
/* 78 */
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.find`, `_.findLast`, `_.findKey`, and `_.findLastKey`,
	 * without support for callback shorthands and `this` binding, which iterates
	 * over `collection` using the provided `eachFunc`.
	 *
	 * @private
	 * @param {Array|Object|string} collection The collection to search.
	 * @param {Function} predicate The function invoked per iteration.
	 * @param {Function} eachFunc The function to iterate over `collection`.
	 * @param {boolean} [retKey] Specify returning the key of the found element
	 *  instead of the element itself.
	 * @returns {*} Returns the found element or its key, else `undefined`.
	 */
	function baseFind(collection, predicate, eachFunc, retKey) {
	  var result;
	  eachFunc(collection, function(value, key, collection) {
	    if (predicate(value, key, collection)) {
	      result = retKey ? key : value;
	      return false;
	    }
	  });
	  return result;
	}
	
	module.exports = baseFind;


/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	var baseCallback = __webpack_require__(36),
	    baseUniq = __webpack_require__(80),
	    isIterateeCall = __webpack_require__(33),
	    sortedUniq = __webpack_require__(81);
	
	/**
	 * Creates a duplicate-free version of an array, using
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	 * for equality comparisons, in which only the first occurence of each element
	 * is kept. Providing `true` for `isSorted` performs a faster search algorithm
	 * for sorted arrays. If an iteratee function is provided it's invoked for
	 * each element in the array to generate the criterion by which uniqueness
	 * is computed. The `iteratee` is bound to `thisArg` and invoked with three
	 * arguments: (value, index, array).
	 *
	 * If a property name is provided for `iteratee` the created `_.property`
	 * style callback returns the property value of the given element.
	 *
	 * If a value is also provided for `thisArg` the created `_.matchesProperty`
	 * style callback returns `true` for elements that have a matching property
	 * value, else `false`.
	 *
	 * If an object is provided for `iteratee` the created `_.matches` style
	 * callback returns `true` for elements that have the properties of the given
	 * object, else `false`.
	 *
	 * @static
	 * @memberOf _
	 * @alias unique
	 * @category Array
	 * @param {Array} array The array to inspect.
	 * @param {boolean} [isSorted] Specify the array is sorted.
	 * @param {Function|Object|string} [iteratee] The function invoked per iteration.
	 * @param {*} [thisArg] The `this` binding of `iteratee`.
	 * @returns {Array} Returns the new duplicate-value-free array.
	 * @example
	 *
	 * _.uniq([2, 1, 2]);
	 * // => [2, 1]
	 *
	 * // using `isSorted`
	 * _.uniq([1, 1, 2], true);
	 * // => [1, 2]
	 *
	 * // using an iteratee function
	 * _.uniq([1, 2.5, 1.5, 2], function(n) {
	 *   return this.floor(n);
	 * }, Math);
	 * // => [1, 2.5]
	 *
	 * // using the `_.property` callback shorthand
	 * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
	 * // => [{ 'x': 1 }, { 'x': 2 }]
	 */
	function uniq(array, isSorted, iteratee, thisArg) {
	  var length = array ? array.length : 0;
	  if (!length) {
	    return [];
	  }
	  if (isSorted != null && typeof isSorted != 'boolean') {
	    thisArg = iteratee;
	    iteratee = isIterateeCall(array, isSorted, thisArg) ? undefined : isSorted;
	    isSorted = false;
	  }
	  iteratee = iteratee == null ? iteratee : baseCallback(iteratee, thisArg, 3);
	  return (isSorted)
	    ? sortedUniq(array, iteratee)
	    : baseUniq(array, iteratee);
	}
	
	module.exports = uniq;


/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	var baseIndexOf = __webpack_require__(61),
	    cacheIndexOf = __webpack_require__(63),
	    createCache = __webpack_require__(64);
	
	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;
	
	/**
	 * The base implementation of `_.uniq` without support for callback shorthands
	 * and `this` binding.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {Function} [iteratee] The function invoked per iteration.
	 * @returns {Array} Returns the new duplicate free array.
	 */
	function baseUniq(array, iteratee) {
	  var index = -1,
	      indexOf = baseIndexOf,
	      length = array.length,
	      isCommon = true,
	      isLarge = isCommon && length >= LARGE_ARRAY_SIZE,
	      seen = isLarge ? createCache() : null,
	      result = [];
	
	  if (seen) {
	    indexOf = cacheIndexOf;
	    isCommon = false;
	  } else {
	    isLarge = false;
	    seen = iteratee ? [] : result;
	  }
	  outer:
	  while (++index < length) {
	    var value = array[index],
	        computed = iteratee ? iteratee(value, index, array) : value;
	
	    if (isCommon && value === value) {
	      var seenIndex = seen.length;
	      while (seenIndex--) {
	        if (seen[seenIndex] === computed) {
	          continue outer;
	        }
	      }
	      if (iteratee) {
	        seen.push(computed);
	      }
	      result.push(value);
	    }
	    else if (indexOf(seen, computed, 0) < 0) {
	      if (iteratee || isLarge) {
	        seen.push(computed);
	      }
	      result.push(value);
	    }
	  }
	  return result;
	}
	
	module.exports = baseUniq;


/***/ },
/* 81 */
/***/ function(module, exports) {

	/**
	 * An implementation of `_.uniq` optimized for sorted arrays without support
	 * for callback shorthands and `this` binding.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {Function} [iteratee] The function invoked per iteration.
	 * @returns {Array} Returns the new duplicate free array.
	 */
	function sortedUniq(array, iteratee) {
	  var seen,
	      index = -1,
	      length = array.length,
	      resIndex = -1,
	      result = [];
	
	  while (++index < length) {
	    var value = array[index],
	        computed = iteratee ? iteratee(value, index, array) : value;
	
	    if (!index || seen !== computed) {
	      seen = computed;
	      result[++resIndex] = value;
	    }
	  }
	  return result;
	}
	
	module.exports = sortedUniq;


/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	var EventEmitter = __webpack_require__(83),
	    inherits = __webpack_require__(84),
	    objectPath = __webpack_require__(85),
	    _each = __webpack_require__(73),
	    _reduce = __webpack_require__(86),
	    _isFunction = __webpack_require__(11),
	    _isString = __webpack_require__(90);
	
	var Dispatcher = __webpack_require__(1);
	
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
	
	Flux.prototype.getAllStores = function() {
	  return this.stores;
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
	
	Flux.prototype.setDispatchInterceptor = function(fn) {
	  this.dispatcher.setDispatchInterceptor(fn);
	};
	
	module.exports = Flux;


/***/ },
/* 83 */
/***/ function(module, exports) {

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
	  if (this._events[event].fn) return [this._events[event].fn];
	
	  for (var i = 0, l = this._events[event].length, ee = new Array(l); i < l; i++) {
	    ee[i] = this._events[event][i].fn;
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
	    , len = arguments.length
	    , args
	    , i;
	
	  if ('function' === typeof listeners.fn) {
	    if (listeners.once) this.removeListener(event, listeners.fn, true);
	
	    switch (len) {
	      case 1: return listeners.fn.call(listeners.context), true;
	      case 2: return listeners.fn.call(listeners.context, a1), true;
	      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
	      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
	      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
	      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
	    }
	
	    for (i = 1, args = new Array(len -1); i < len; i++) {
	      args[i - 1] = arguments[i];
	    }
	
	    listeners.fn.apply(listeners.context, args);
	  } else {
	    var length = listeners.length
	      , j;
	
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
	  var listener = new EE(fn, context || this);
	
	  if (!this._events) this._events = {};
	  if (!this._events[event]) this._events[event] = listener;
	  else {
	    if (!this._events[event].fn) this._events[event].push(listener);
	    else this._events[event] = [
	      this._events[event], listener
	    ];
	  }
	
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
	  var listener = new EE(fn, context || this, true);
	
	  if (!this._events) this._events = {};
	  if (!this._events[event]) this._events[event] = listener;
	  else {
	    if (!this._events[event].fn) this._events[event].push(listener);
	    else this._events[event] = [
	      this._events[event], listener
	    ];
	  }
	
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
	
	  if (fn) {
	    if (listeners.fn && (listeners.fn !== fn || (once && !listeners.once))) {
	      events.push(listeners);
	    }
	    if (!listeners.fn) for (var i = 0, length = listeners.length; i < length; i++) {
	      if (listeners[i].fn !== fn || (once && !listeners[i].once)) {
	        events.push(listeners[i]);
	      }
	    }
	  }
	
	  //
	  // Reset the array, or remove it completely if we have no more listeners.
	  //
	  if (events.length) {
	    this._events[event] = events.length === 1 ? events[0] : events;
	  } else {
	    delete this._events[event];
	  }
	
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
	
	  if (event) delete this._events[event];
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
	
	//
	// Expose the module.
	//
	module.exports = EventEmitter;


/***/ },
/* 84 */
/***/ function(module, exports) {

	// From https://github.com/isaacs/inherits
	// inherits is licensed under the ISC license:
	//
	//
	// The ISC License
	//
	// Copyright (c) Isaac Z. Schlueter
	//
	// Permission to use, copy, modify, and/or distribute this software for any
	// purpose with or without fee is hereby granted, provided that the above
	// copyright notice and this permission notice appear in all copies.
	//
	// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
	// REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
	// FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
	// INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
	// LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
	// OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
	// PERFORMANCE OF THIS SOFTWARE.
	
	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor;
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
	    ctor.super_ = superCtor;
	    var TempCtor = function () {};
	    TempCtor.prototype = superCtor.prototype;
	    ctor.prototype = new TempCtor();
	    ctor.prototype.constructor = ctor;
	  };
	}


/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (root, factory){
	  'use strict';
	
	  /*istanbul ignore next:cant test*/
	  if (typeof module === 'object' && typeof module.exports === 'object') {
	    module.exports = factory();
	  } else if (true) {
	    // AMD. Register as an anonymous module.
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
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
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	var arrayReduce = __webpack_require__(87),
	    baseEach = __webpack_require__(71),
	    createReduce = __webpack_require__(88);
	
	/**
	 * Reduces `collection` to a value which is the accumulated result of running
	 * each element in `collection` through `iteratee`, where each successive
	 * invocation is supplied the return value of the previous. If `accumulator`
	 * is not provided the first element of `collection` is used as the initial
	 * value. The `iteratee` is bound to `thisArg` and invoked with four arguments:
	 * (accumulator, value, index|key, collection).
	 *
	 * Many lodash methods are guarded to work as iteratees for methods like
	 * `_.reduce`, `_.reduceRight`, and `_.transform`.
	 *
	 * The guarded methods are:
	 * `assign`, `defaults`, `defaultsDeep`, `includes`, `merge`, `sortByAll`,
	 * and `sortByOrder`
	 *
	 * @static
	 * @memberOf _
	 * @alias foldl, inject
	 * @category Collection
	 * @param {Array|Object|string} collection The collection to iterate over.
	 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	 * @param {*} [accumulator] The initial value.
	 * @param {*} [thisArg] The `this` binding of `iteratee`.
	 * @returns {*} Returns the accumulated value.
	 * @example
	 *
	 * _.reduce([1, 2], function(total, n) {
	 *   return total + n;
	 * });
	 * // => 3
	 *
	 * _.reduce({ 'a': 1, 'b': 2 }, function(result, n, key) {
	 *   result[key] = n * 3;
	 *   return result;
	 * }, {});
	 * // => { 'a': 3, 'b': 6 } (iteration order is not guaranteed)
	 */
	var reduce = createReduce(arrayReduce, baseEach);
	
	module.exports = reduce;


/***/ },
/* 87 */
/***/ function(module, exports) {

	/**
	 * A specialized version of `_.reduce` for arrays without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {*} [accumulator] The initial value.
	 * @param {boolean} [initFromArray] Specify using the first element of `array`
	 *  as the initial value.
	 * @returns {*} Returns the accumulated value.
	 */
	function arrayReduce(array, iteratee, accumulator, initFromArray) {
	  var index = -1,
	      length = array.length;
	
	  if (initFromArray && length) {
	    accumulator = array[++index];
	  }
	  while (++index < length) {
	    accumulator = iteratee(accumulator, array[index], index, array);
	  }
	  return accumulator;
	}
	
	module.exports = arrayReduce;


/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	var baseCallback = __webpack_require__(36),
	    baseReduce = __webpack_require__(89),
	    isArray = __webpack_require__(20);
	
	/**
	 * Creates a function for `_.reduce` or `_.reduceRight`.
	 *
	 * @private
	 * @param {Function} arrayFunc The function to iterate over an array.
	 * @param {Function} eachFunc The function to iterate over a collection.
	 * @returns {Function} Returns the new each function.
	 */
	function createReduce(arrayFunc, eachFunc) {
	  return function(collection, iteratee, accumulator, thisArg) {
	    var initFromArray = arguments.length < 3;
	    return (typeof iteratee == 'function' && thisArg === undefined && isArray(collection))
	      ? arrayFunc(collection, iteratee, accumulator, initFromArray)
	      : baseReduce(collection, baseCallback(iteratee, thisArg, 4), accumulator, initFromArray, eachFunc);
	  };
	}
	
	module.exports = createReduce;


/***/ },
/* 89 */
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.reduce` and `_.reduceRight` without support
	 * for callback shorthands and `this` binding, which iterates over `collection`
	 * using the provided `eachFunc`.
	 *
	 * @private
	 * @param {Array|Object|string} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {*} accumulator The initial value.
	 * @param {boolean} initFromCollection Specify using the first or last element
	 *  of `collection` as the initial value.
	 * @param {Function} eachFunc The function to iterate over `collection`.
	 * @returns {*} Returns the accumulated value.
	 */
	function baseReduce(collection, iteratee, accumulator, initFromCollection, eachFunc) {
	  eachFunc(collection, function(value, index, collection) {
	    accumulator = initFromCollection
	      ? (initFromCollection = false, value)
	      : iteratee(accumulator, value, index, collection);
	  });
	  return accumulator;
	}
	
	module.exports = baseReduce;


/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	var isObjectLike = __webpack_require__(13);
	
	/** `Object#toString` result references. */
	var stringTag = '[object String]';
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;
	
	/**
	 * Checks if `value` is classified as a `String` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isString('abc');
	 * // => true
	 *
	 * _.isString(1);
	 * // => false
	 */
	function isString(value) {
	  return typeof value == 'string' || (isObjectLike(value) && objToString.call(value) == stringTag);
	}
	
	module.exports = isString;


/***/ },
/* 91 */
/***/ function(module, exports) {

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
	    "parameter and returns the mixin, e.g.: mixins: [Fluxxor.FluxMixin(React)]");
	};
	
	module.exports = FluxMixin;


/***/ },
/* 92 */
/***/ function(module, exports) {

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
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	var _each = __webpack_require__(73);
	
	var StoreWatchMixin = function() {
	  var storeNames = Array.prototype.slice.call(arguments);
	  return {
	    componentDidMount: function() {
	      var flux = this.props.flux || this.context.flux;
	      this.mounted = true;
	
	      // No autobinding in ES6 classes
	      this._setStateFromFlux = function() {
	        if(this.mounted) {
	          this.setState(this.getStateFromFlux());
	        }
	      }.bind(this);
	
	      _each(storeNames, function(store) {
	        flux.store(store).on("change", this._setStateFromFlux);
	      }, this);
	    },
	
	    componentWillUnmount: function() {
	      var flux = this.props.flux || this.context.flux;
	      this.mounted = false;
	      _each(storeNames, function(store) {
	        flux.store(store).removeListener("change", this._setStateFromFlux);
	      }, this);
	    },
	
	    getInitialState: function() {
	      return this.getStateFromFlux();
	    }
	  };
	};
	
	StoreWatchMixin.componentWillMount = function() {
	  throw new Error("Fluxxor.StoreWatchMixin is a function that takes one or more " +
	    "store names as parameters and returns the mixin, e.g.: " +
	    "mixins: [Fluxxor.StoreWatchMixin(\"Store1\", \"Store2\")]");
	};
	
	module.exports = StoreWatchMixin;


/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	var _each = __webpack_require__(73),
	    _isFunction = __webpack_require__(11),
	    Store = __webpack_require__(95),
	    inherits = __webpack_require__(84);
	
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
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	var EventEmitter = __webpack_require__(83),
	    inherits = __webpack_require__(84),
	    _isFunction = __webpack_require__(11),
	    _isObject = __webpack_require__(12);
	
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
/* 96 */
/***/ function(module, exports) {

	module.exports = "1.7.3"

/***/ }
/******/ ])
});
;
//# sourceMappingURL=fluxxor.js.map