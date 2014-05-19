---
title: Fluxxor.Flux
template: page.ejs
---

Flubox.Flux
===========

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
