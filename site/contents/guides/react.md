---
title: Using with React
template: page.ejs
---

Using with React
================

Fluxxor can be used with any JavaScript framework (or no framework at all!), but it's designed to work well with [React](http://facebook.github.io/react/).

Batched Updates
---------------

Starting in React v0.12, React exposed an addon called `batchedUpdates` that allows you to manually batch React updates when outside of the normal React synthetic event lifecycle. This can be useful to ensure you don't get cascading dispatch errors with Fluxxor if you dispatch actions from within `componentWillMount` or `componentDidMount`. In React v0.14, this was moved to the `react-dom` package, and renamed to `unstable_batchedUpdates`.

As of Fluxxor v1.6.0, there is a new method available you can use to tie Fluxxor action dispatches to the React batched update addon. To use `unstable_batchedUpdates` with Fluxxor, use `Flux#setDispatchInterceptor` with `ReactDOM.unstable_batchedUpdates`; for example:

```javascript
var ReactDOM = require("react-dom"),
    Fluxxor = require("fluxxor");

var flux = new Fluxxor.Flux(stores, actions);
flux.setDispatchInterceptor(function(action, dispatch) {
  ReactDOM.unstable_batchedUpdates(function() {
    dispatch(action);
  });
});
```

Note that `ReactDOM.unstable_batchedUpdates` is specific to the DOM renderer, and is not appropriate for use in React Native apps, or apps that use other custom renderers.

Mixins
------

Fluxxor includes a couple mixins to make interop with React easier; check out the documentation on [Fluxxor.FluxMixin](/documentation/flux-mixin.html) and [Fluxxor.StoreWatchMixin](/documentation/store-watch-mixin.html) for more information.
