Fluxbox
=======

Fluxbox is a set of tools to aid in developing [React](http://facebook.github.io/react/) applications with the [Flux architecture](http://facebook.github.io/react/docs/flux-overview.html).

:construction: Not ready for consumption :construction:

Documentation
-------------

### `Fluxbox.createStore`

Creates a new Store constructor. Stores respond to actions by checking the `action.type` against a list of registered action types; if one matches, it calls the given method with the value of `action.payload` as the parameter.

```javascript
var MyStore = Fluxbox.createStore({
  actions: {
    "ACTION_TYPE": "handleActionType",
    "OTHER_ACTION_TYPE": "handleOtherActionType"
  },

  initialize: function(options) {
    // options === first argument passed to constructor
    console.log("Value of `db` was:", options.db);
  },

  handleActionType: function(actionPayload) {
    console.log("The payload is", actionPayload);
  },

  handleOtherActionType: function(actionPayload) {
    // ...
  }
});

// Later

var db = ...;
var myStoreInstance = new MyStore({db: db, other: options});
```

### `Fluxbox.Dispatcher`

Constructor function for a dispatcher. A dispatcher contains a collection of stores and dispatches actions to them.

```javascript
var dispatcher = new Fluxbox.Dispatcher({
  storeName: myStoreInstance,
  otherStoreName: myOtherStoreInstance
});
```

From within a component using the Fluxbox mixin, you can retrieve a given store with

```javascript
this.context.flux.store("storeName");
```

### `Fluxbox.Flux`

Constructor function for a new Flux container, which manages the dispatcher, stores, and actions for an application.

```javascript
var flux = new Fluxbox.Flux(dispatcher, actions);
```

where `actions` is simply an plain object of action names to function calls that call `this.dispatch` with the action type and payload.

```
var actions = {
  myAction: function(data1, data2) {
    this.dispatch("ACTION_TYPE", {data1: data1, otherData: data2});
  }
};
```

From within a component using the Fluxbox mixin, you can dispatch an action with

```
this.context.flux.actions.myAction("Some data1", "Some data2");
```

### `Fluxbox.Mixin`

A mixin for the top-level component that will automatically pass `flux` as a context property to all children that declare a `flux` `contextType`.

```javascript
var Application = React.createClass({
  mixins: [Fluxbox.Mixin],

  render: function() {
    return <Child />;
  }
});

var Child = React.createClass({
  render: function() {
    return <Grandchild />;
  }
});

var Grandchild = React.createClass({
  contextTypes: {
    flux: React.PropTypes.object
  },

  render: function() {
    return <button onClick={this.fireAction}>Button!</button>;
  },

  fireAction: function() {
    this.context.flux.actions.myAction("data1", "data2");
  }
});

React.renderComponent(<Application flux={flux} />, ...);
```
