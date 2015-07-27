---
title: Fluxxor.Flux
template: page.ejs
---

Fluxxor.Flux
============

`Fluxxor.Flux` is the main container object for a Flux application. It provides access to the [stores](/documentation/stores.html) and the [actions](/documentation/actions.html), and is responsible for managing the dispatcher internally.

## `new Fluxxor.Flux(stores, actions)`

Creates a new `Flux` instance.

* `stores` - An object map of store names to store instances. Stores can be retrieved later by their name. See [Stores](/documentation/stores.html) for more information.
* `actions` - An object map of action names to action functions. See [Actions](/documentation/actions.html) for more information.

Example:

```javascript
var stores = {
  MyStore: new MyStore({options: here}),
  OtherStore: new OtherStore({options: here})
};

var actions = {
  processThing: function(thing) {
    this.dispatch("PROCESS_THING", {thing: thing});
  }
};

var flux = new Fluxxor.Flux(stores, actions);
```

## `Fluxxor.Flux#store(name)`

Retrieves a store by its name.

* `name` - The name of the store as passed to the `Flux` constructor.

Example:

```javascript
var stores = {
  MyStore: new MyStore();
};

var flux = new Fluxxor.Flux(stores, actions);

var myStore = flux.store("MyStore");
```

## `Fluxxor.Flux#getAllStores()`

Retrieves all stores. The return value is an object where the keys are the names of the stores and the values are the stores themselves.

**Note:** This is a reference to the underlying stores implementation, and should not be modified.

## `Fluxxor.Flux#actions`

Retrieves the map of actions.

Example:

```javascript
var actions = {
  processThing: function(thing) {
    this.dispatch("PROCESS_THING", {thing: thing});
  }
};

var flux = new Fluxxor.Flux(stores, actions);

flux.actions.processThing(myThing);
```

## `Fluxxor.Flux#addStore(name, store)`

Adds a new store to the `Flux` instance.

* `name` - The name used to identify the store. Stores can be retrieved later by their name. See [Stores](/documentation/stores.html) for more information.
* `store` - The store instance to add.

```javascript
flux.addStore("user", new UserStore());
```

## `Fluxxor.Flux#addStores(stores)`

Adds stores to the `Flux` instance.

* `stores` - A hash of stores to add, in the same format as the `Fluxxor.Flux` constructor.

```javascript
var newStores = {
  user: new UserStore(),
  post: new PostStore()
};

flux.addStores(newStores);
```

## `Fluxxor.Flux#addAction(path..., function)`

Adds an action to the `Flux` instance's action hash. This function takes a path (either as an array of strings or as individual strings) followed by a function.

* `path...` - The path in the actions object to add the action.
* `function` - The action function to add.

`path` can be specified either as an array of strings where each element is one part of the path, or as a free list of strings. For example:

```javascript
// The action hash we want to end up with:
{
  user: {
    login: function() { ... }
  }
}

// Path as an array
flux.addAction(["user", "login"], function() { ... });

// Path as free arguments
flux.addAction("user", "login", function() { ... });
```

Fluxxor will automatically create any intermediary objects as necessary, and will intelligently merge the new action into the existing hash, but does not allow overwriting any existing functions.

## `Fluxxor.Flux#addActions(actions)`

Adds actions to the `Flux` instance's action hash.

* `actions` - A hash of actions to add, in the same format as the `Fluxxor.Flux` constructor.

```javascript
var newActions = {
  user: {
    login: function() { ... },
    logout: function() { ... }
  }
};

flux.addActions(newActions);
```

Fluxxor will intelligently merge the new actions with the existing actions, but does not allow overwriting any existing functions.

## `Fluxxor.Flux#setDispatchInterceptor(interceptor)`

Sets `interceptor` as the `Flux` instance's dispatch interceptor. The dispatch interceptor allows you to surround or replace the action dispatch with custom functionality.

* `interceptor` - A function with the signature `function(action, dispatch)` where `action` is the action being dispatched and `dispatch` is the original (non-intercepted) dispatch function. If a falsy value, resets the dispatch interceptor to the default (no-op) interceptor.

Sometimes it's useful to inject custom logic into the normal dispatch flow. `setDispatchInterceptor` allows you to wrap or replace the original dispatch function with your own logic. The default dispatch interceptor is essentially a no-op:

```javascript
flux.setDispatchInterceptor(function(action, dispatch) {
  dispatch(action);
});
```

In particular, it can be very useful to wrap action dispatches in React's batched updates (if you're using React). To do so, wrap the dispatch in `React.addons.batchedUpdates`:

```javascript
flux.setDispatchInterceptor(function(action, dispatch) {
  React.addons.batchedUpdates(function() {
    dispatch(action);
  });
});
```

(See the [Using with React page](/guides/react.html) for more information on how `batchedUpdates` can help.)

You can even bypass the original dispatch function entirely for testing or more exotic implementations:

```javascript
flux.setDispatchInterceptor(function(action, dispatch) {
  // Ignore the `dispatch` argument and do our own thing with the action, for example:
  window.postMessage({ type: "myCustomThing", action: action });
});
```

## `EventEmitter` methods

`Flux` instances are also instances of EventEmitters, and thus [inherit all the EventEmitter methods](http://nodejs.org/api/events.html#events_class_events_eventemitter). Most notably, `Flux` instances dispatch a `"dispatch"` event with `type` and `payload` arguments when `this.dispatch` is called from an action. This is useful for cross-cutting concerns (like logging), and should not be used for managing the flow of data in a Fluxxor application.

Example:

```javascript
flux.on("dispatch", function(type, payload) {
  console.log("Dispatched", type, payload);
}
```

Note that the action will still be dispatched even if the `"dispatch"` event handler throws an exception.
