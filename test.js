// Should create a "mission statement" to focus specifically on what to change.
//
// Would be nice to list patterns that are currently hard/impossible that we want
// to explicitly support.

// NOTES:
// * Better abstraction around actions and the `flux` object being passed around.
//   See for example http://stackoverflow.com/questions/27745113/pass-an-instance-of-flux-fluxxor-from-actions-hash-to-a-proxy-object
//   See also https://github.com/BinaryMuse/fluxxor/issues/119#issuecomment-103612974
//
// Main Package
// ============================================================================

var Fluxxor = {
  Dispatcher: require("fluxxor-dispatcher"),
  Store: require("fluxxor-store")
};

module.exports = Fluxxor;

// Dispatcher
// ============================================================================

var Dispatcher = require("fluxxor-dispatcher");

var dispatcher = new Dispatcher();

// TODO: options...
// Behaviors can be Dispatcher.Behaviors.WARN, Dispatcher.Behaviors.THROW, Dispatcher.Behaviors.IGNORE
// custom behaviors? Should be a function that takes a message and does something.
// * unhandledAction - if no store callback returns `true`
// * cascadingDispatch - if detects cascading dispatches
// * circularDependency - if detects circular waitFor dependencies

// getting a store ID for `waitFor` - unique per registration per dispatcher
storeId = dispatcher.register(myStore.callback);

// assigning a manual store ID
// in this example, storeId === myStoreId
// throws if store ID is already taken
storeId = dispatcher.register(myStore.callback, myStoreId);

dispatcher.unregister(storeId);

// TODO: can the dispatcher be a registry for stores as well?
// if so, how to get them in there, now to identify them?
// Perhaps an object like Fluxxor.Flux should be responsible
// for being a registry of objects? Perhaps another lib like
// react-simple-di? How do actions fit in? How about if they're
// not being used?

// TODO: give the dispatch a wrapper implementation, just like
// wrapping `this.dispatch` in action creators. Allows for alternative
// dispatcher implementations when not using action creators.
// See fluxxor #100

// TODO: give dispatcher a way to specify which extra props to
// pass to the store callback. Useful for (when using Fluxxor.Flux)
// providing the `flux` instance, can also provide the `dispatcher`
// instance by default, or allow the user to specify any number of
// extra objects (e.g. router?)

class MyCustomStore {
  callback(action, dispatcher) { // TODO: consider first-class dispatch object?? or is that too complex
    console.log("My action:", action);
  }
}

var store = new MyCustomStore();
store.storeId = dispatcher.register(store.callback);

var store = {
  callback(action, dispatcher) {
    console.log("My action:", action);
  }
};
store.storeId = dispatcher.register(store.callback);

// TODO: need to be able to add/remove stores at any time
// TODO: should stores be required to return/respond to something to
// indicate they "handled" the event? (e.g. to keep errors when nothing
// handles an action)

// Stores
// ============================================================================

var binder = new BindingSystem();

matcher = binder.addMatch(match, result); // defaults to search === match
matcher.setComparator(comparator); // comparator(search, match) === true
matcher = binder.addMatch(match, result, comparator); // comparator(search, match) === true

binder.find(search); // returns array of results, in order of addition

class FluxxorStore {
  constructor() {
    this.__actionBinder = new BindingSystem();
    this.__actionBinder.setDefaultComparator(this.getActionType);
  }

  bindActions() {
    var args = Array.prototype.slice.call(arguments);
    var match, handler, matchers = [];
    for (var i = 0; i < args.length; i += 2) {
      match = args[i];
      handler = args[i + 1];
      matchers.push(this.__actionBinder.addMatch(match, handler));
    }
    return { using: (extractFn) => {
      var comparator = (needle, test) => exactOrArrayMatch(extractFn(needle), test) === true;
      matchers.forEach((matcher) => matcher.setComparator(comparator));
    }};
  }

  getActionType(action) {
    return action.type;
  }

  callback(action, dispatcher) {
    var handlers = this.__actionBinder.find(action);
    handlers.forEach((handler) => handler(action.payload, action.type, action, dispatcher));
    if (handlers.length > 0) {
      return true;
    }
  }
}

var Store = require("fluxxor-store");

// TODO: What about automatic splitting of payload and type? What if that's not the
// shape that's being dispatched to us?
// Should Fluxxor.Store assume a minimum {type, payload} shape?
// Handler signature would be handleAction(payload, type, action, dispatcher)
class MyStore extends Store {
  constructor(options) {
    super(options);
    // this.getActionType provided by Fluxxor, returns the action type
    // TODO: maybe make this static? Store.getActionType()
    this.bindActions(
      SOME_ACTION_TYPE, someActionHandler
    ).using(this.getActionType);

    // getActionType is the default
    this.bindActions(
      SOME_ACTION_TYPE, someActionHandler
    );

    // Any non-array value can be === checked,
    // arrays have each element === checked
    // TODO: should consider objects, others?
    this.bindActions(
      [SOME_ACTION_SOURCE, SOME_ACTION_TYPE], someActionHandler
    ).using(this.getActionSourceAndType);

    // Or maybe allow a secondary checker, by default iterates into
    // arrays and objects.
    this.bindActions(
      {type: SOME_ACTION_TYPE, source: SOME_ACTION_SOURCE}, someActionHandler
    ).using(this.getActionDescriptor, _.deepEquals);
  }

  getActionSourceAndType(action) {
    return [action.source, action.type];
  }

  getActionDescriptor(action) {
    return {type: action.type, source: action.source};
  }
}

// if not using es6 classes/extend

var MyStore = Store.create({
  initialize: function(options) {
    this.bindActions(...).using(...);
  }
});

// Actios
// ============================================================================

// TODO: It would be nice if a fully realized actionSet could have its dispatch
// method overwritten for testing purposes, e.g. replace it with a function
// that sets some vars to be asserted against.
//
// OR, it could be replaced with a function that calls a mock.
// This should be an overarching theme of the new APIs--each should be able to
// be tested, and potentially be useful, in isolation.
//
// TODO: needs to have `addAction` etc. API

var ActionSet = require("fluxxor-actionset");

var actionSet = ActionSet({
  namespace: {
    action(param1, param2, param3) {
      this.dispatch(ACTION_TYPE, {some: payload});
    }
  }
});

actionSet.setDispatchFunction((dispatcher, type, source, payload) => {
  dispatcher.dispatch({type: type, source: source, payload: payload});
});

// bind to special object that gives access to actions hash and also dispatcher?
actionSet.setDispatchFunction((type, source, payload) => {
  var action = {type, source, payload};
  this.emit("dispatch", action);
  var dispatch = this.dispatcher.dispatch(action);
  this.emit("dispatched", dispatch);

  //
  // OR
  //

  var action = {type, source, payload};
  var dispatch = this.dispatcher.prepareDispatch(action);
  this.emit("dispatch", dispatch);
  this.dispatcher.dispatch(dispatch);
  this.emit("dispatched", dispatch);
});
// also allow to getDispatchFunction so that it can be wrapped

// dispatch function can be made portable using:
var dispatchFunction = (type, source, payload) => {
  var dispatch = this.dispatcher.prepareDispatch(...);
}

actionSet.setDispatchFunction(dispatchFunction);

// when used....
dispatcherFunction.call({dispatcher: dispatcher}, [...]);

// OOOORRRR
// maybe dispatchFunction should just take dispatcher as the first
// argument to make it more portable



actionSet.setDispatchFunction((dispatcher) => {
  return (type, source, payload) => {
    dispatcher.dispatch({type, source, payload});
  };
});

var actions = actionSet.dispatchTo(dispatcher);










/// TODO
//
//
//
//
//
// It would be nice to visualize data flow,
// e.g. see which stores have registered with
// which actions, see what constants are defined,
// see what action handlers are avail.
// Can we do this easily built-in?
// Or does it need to be a custom store impl?











