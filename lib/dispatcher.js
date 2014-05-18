var _ = require("lodash");

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

  this.waitingToDispatch = _.clone(this.stores);

  this.currentDispatch = _.mapValues(this.stores, function() {
    return { resolved: false, waitingOn: [], waitCallback: null };
  });

  this.doDispatchLoop(action);

  this.currentDispatch = null;
};

Dispatcher.prototype.doDispatchLoop = function(action) {
  var dispatch, canBeDispatchedTo,
      removeFromDispatchQueue = [], dispatchedThisLoop = [];

  _.forOwn(this.waitingToDispatch, function(value, key) {
    dispatch = this.currentDispatch[key];
    canBeDispatchedTo = !dispatch.waitingOn.length ||
      !_.intersection(dispatch.waitingOn, _.keys(this.waitingToDispatch)).length;
    if (canBeDispatchedTo) {
      if (dispatch.waitCallback) {
        var stores = _.map(dispatch.waitingOn, function(key) {
          return this.stores[key]
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
    var storesWithCircularWaits = _.keys(this.waitingToDispatch).join(", ");
    throw new Error("Indirect circular wait detected among: " + storesWithCircularWaits);
  }

  _.each(removeFromDispatchQueue, function(key) {
    delete this.waitingToDispatch[key];
  }, this);

  if (_.size(this.waitingToDispatch)) {
    this.doDispatchLoop(action);
  }
};

Dispatcher.prototype.waitForStores = function(store, stores, fn) {
  if (!this.currentDispatch) {
    throw new Error("Cannot wait unless an action is being dispatched");
  }

  var waitingStoreName = _.findKey(this.stores, function(val) {
    return val === store
  });

  if (stores.indexOf(waitingStoreName) > -1) {
    throw new Error("A store cannot wait on itself");
  }

  var dispatch = this.currentDispatch[waitingStoreName];

  if (_.intersection(dispatch.waitingOn, stores).length) {
    throw new Error("Already waiting on " + waitingStoreName);
  }

  _.each(stores, function(storeName) {
    var storeDispatch = this.currentDispatch[storeName];
    if (!this.stores[storeName]) {
      throw new Error("Cannot wait for non-existant store " + storeName);
    }
    if (storeDispatch.waitingOn.indexOf(waitingStoreName) > -1) {
      throw new Error("Circular wait detected between " + waitingStoreName + " and " + storeName);
    }
  }, this);

  dispatch.resolved = false;
  dispatch.waitingOn = _.uniq(dispatch.waitingOn.concat(stores));
  dispatch.waitCallback = fn;
};

module.exports = Dispatcher;
