var _ = require("lodash");

var log = _.identity;
log = console.log.bind(console);

var Dispatcher = function(stores) {
  this.stores = stores;
  this.dispatching = false;
  this.currentDispatch = {};
  this.waitingToDispatch = [];
  this.loops = 0;

  for (var key in stores) {
    stores[key].dispatcher = this;
  }
};

Dispatcher.prototype.dispatch = function(action) {
  if (this.dispatching) {
    throw new Error("Cannot dispatch an action while another action is being dispatched.");
  }

  this.dispatching = true;
  this.waitingToDispatch = _.clone(this.stores);

  this.currentDispatch = _.mapValues(this.stores, function() {
    return { resolved: false, waitingOn: [], afterWait: null };
  });

  this.doDispatchLoop(action);

  this.dispatching = false;
  this.currentDispatch = {};
};

Dispatcher.prototype.doDispatchLoop = function(action) {
  var dispatch, key, removeFromDispatchQueue = [];

  log("-------------------------------------")
  log("Loop started, dispatching to:", _.keys(this.waitingToDispatch));

  _.forOwn(this.waitingToDispatch, function(value, key) {
    var dispatch;
    log("Dispatching to", key);
    dispatch = this.currentDispatch[key];
    log("It's waiting [1] on", dispatch.waitingOn);
    if (dispatch.waitingOn.length && _.intersection(dispatch.waitingOn, _.keys(this.waitingToDispatch)).length) {
      log("There's something that needs to be resolved!");
    } else {
      if (dispatch.afterWait) {
        var stores = _.map(dispatch.waitingOn, function(key) {
          return this.stores[key]
        }, this);
        var fn = dispatch.afterWait;
        dispatch.afterWait = null;
        dispatch.waitingOn = [];
        dispatch.resolved = true;
        fn.apply(null, stores);
      } else {
        dispatch.resolved = true;
        this.stores[key].__handleAction__(action);
      }

      dispatch = this.currentDispatch[key];
      log("It's waiting [2] on", dispatch.waitingOn);
      if (dispatch.waitingOn.length && _.intersection(dispatch.waitingOn, _.keys(this.waitingToDispatch)).length) {
        log("There's something that needs to be resolved!");
      } else if (dispatch.resolved) {
        removeFromDispatchQueue.push(key);
      }
    }
  }, this);

  _.each(removeFromDispatchQueue, function(key) {
    delete this.waitingToDispatch[key];
  }, this);

  if (_.size(this.waitingToDispatch) !== 0) {
    log("Not done yet!");
    this.doDispatchLoop(action);
  }
};

Dispatcher.prototype.waitForStores = function(store, stores, fn) {
  if (!this.dispatching) {
    throw new Error("Can't wait for stores unless a dispatch is in progress.");
  }

  var waitingStoreName = _.findKey(this.stores, function(val) {
    return val === store
  });

  if (stores.indexOf(waitingStoreName) > -1) {
    throw new Error("A store cannot wait on itself.");
  }

  var dispatch = this.currentDispatch[waitingStoreName];

  if (_.intersection(dispatch.waitingOn, stores).length) {
    throw new Error("Already waiting on " + waitingStoreName);
  }

  _.each(stores, function(storeName) {
    var storeDispatch = this.currentDispatch[storeName];
    if (storeDispatch.waitingOn.indexOf(waitingStoreName) > -1) {
      throw new Error("Circular wait detected between " + waitingStoreName + " and " + storeName);
    }
  }, this);

  dispatch.resolved = false;
  dispatch.waitingOn = _.uniq(dispatch.waitingOn.concat(stores));
  dispatch.afterWait = fn;
};

module.exports = Dispatcher;
