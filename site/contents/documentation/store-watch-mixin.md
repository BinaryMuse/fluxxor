---
title: StoreWatchMixin
template: page.ejs
---

Fluxbox.StoreWatchMixin
=======================

`Fluxbox.StoreWatchMixin` is a simple React mixin that assists with watching for `"change"` events on one or more stores. Normally, you'd need to bind to store change events in `componentWillMount` and unbind them in `componentWillUnmount` to keep from leaking memory. Additionally, you'd need to set up handlers to pull data from the stores during the appropriate lifecycle hooks (such as `getInitialState`).

`StoreWatchMixin` simply requires that you:

1. Define a method on your component called `getStateFromFlux` that returns an object representing the part of the component's state that comes from the Flux stores.
2. Have a `prop` or `context` property named `flux` that points to the `Flux` instance with the stores.

The mixin will then automatically

1. Bind to `"change"` events for each store when the component mounts
2. Unbind from `"change"` events when the component unmounts
3. Automatically call `setState` with the return value of `getStateFromFlux` when a store emits a `"change"` event
4. Automatically set the component's initial state based on the return value of `getStateFromFlux` when the component mounts (note that this object is merged with any other `getDefaultState` functions defined on the component or other mixins)

Example:

```javascript
var React = require("react"),
    Fluxbox = require("fluxbox"),
    FluxMixin = Fluxbox.FluxMixin(React), // or window.React, etc.
    StoreWatchMixin = Fluxbox.StoreWatchMixin;

var MyStore = Fluxbox.createStore({ ... }),
    OtherStore = Fluxbox.createStore({ ... });

var stores = {
  MyStore: new MyStore(),
  OtherStore: new OtherStore()
};
var actions = { ... };

var flux = new Fluxbox.Flux(stores, actiosn);

var MyComponent = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("MyStore", "OtherStore")],

  getStateFromFlux: function() {
    var flux = this.props.flux;
    return {
      stateFromMyStore: flux.store("MyStore").getSomeData(),
      stateFromOtherStore: flux.store("OtherStore").getMoreData(),
    };
  },

  render: function() {
    // ...
  }
});
```
