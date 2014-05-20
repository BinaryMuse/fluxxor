var _clone = require("lodash-node/modern/objects/clone"),
    _mapValues = require("lodash-node/modern/objects/mapValues"),
    _forOwn = require("lodash-node/modern/objects/forOwn"),
    _intersection = require("lodash-node/modern/arrays/intersection"),
    _keys = require("lodash-node/modern/objects/keys"),
    _map = require("lodash-node/modern/collections/map"),
    _each = require("lodash-node/modern/collections/forEach"),
    _size = require("lodash-node/modern/collections/size"),
    _findKey = require("lodash-node/modern/objects/findKey"),
    _uniq = require("lodash-node/modern/arrays/uniq");

var Dispatcher = function(stores) {
  this.stores = stores;
  this.currentDispatch = null;
  this.waitingToDispatch = [];

  for (var key in stores) {
    stores[key].dispatcher = this;
  }
};

Dispatcher.prototype.dispatch = function(action) {
  if (this.currentDispatch) {
    throw new Error("Cannot dispatch an action while another action is being dispatched");
  }

  this.waitingToDispatch = _clone(this.stores);

  this.currentDispatch = _mapValues(this.stores, function() {
    return { resolved: false, waitingOn: [], waitCallback: null };
  });

  this.doDispatchLoop(action);

  setTimeout(function() {
    this.currentDispatch = null;
  }.bind(this));
};

Dispatcher.prototype.doDispatchLoop = function(action) {
  var dispatch, canBeDispatchedTo,
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
      } else {
        dispatch.resolved = true;
        this.stores[key].__handleAction__(action);
      }

      dispatchedThisLoop.push(key);

      if (this.currentDispatch[key].resolved) {
        removeFromDispatchQueue.push(key);
      }
    }
  }, this);

  if (!dispatchedThisLoop.length) {
    var storesWithCircularWaits = _keys(this.waitingToDispatch).join(", ");
    throw new Error("Indirect circular wait detected among: " + storesWithCircularWaits);
  }

  _each(removeFromDispatchQueue, function(key) {
    delete this.waitingToDispatch[key];
  }, this);

  if (_size(this.waitingToDispatch)) {
    this.doDispatchLoop(action);
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
      throw new Error("Cannot wait for non-existant store " + storeName);
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
