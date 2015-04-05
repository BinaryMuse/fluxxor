---
title: Using with React
template: page.ejs
---

Using with React
================

Fluxxor can be used with any JavaScript framework (or no framework at all!), but it's designed to work well with [React](http://facebook.github.io/react/).

Batched Updates
---------------

Starting in React v0.12, React exposes an addon called `batchedUpdates` that allows you to manually batch React updates when outside of the normal React synthetic event lifecycle. This can be useful to ensure you don't get cascading dispatch errors with Fluxxor if you dispatch actions from within `componentWillMount` or `componentDidMount`.

As of Fluxxor v1.6.0, there is a new method available you can use to tie Fluxxor action dispatches to the React batched update addon. To use `batchedUpdates` with Fluxxor, use `Flux#setDispatchInterceptor` with `React.addons.batchedUpdates`; for example:

```javascript
var React = require("react/addons"),
    Fluxxor = require("fluxxor");

var flux = new Fluxxor.Flux(stores, actions);
flux.setDispatchInterceptor(function(action, dispatch) {
  React.addons.batchedUpdates(function() {
    dispatch(action);
  });
});
```

Mixins
------

Fluxxor includes a couple mixins to make interop with React easier; check out the documentation on [Fluxxor.FluxMixin](/documentation/flux-mixin.html) and [Fluxxor.StoreWatchMixin](/documentation/store-watch-mixin.html) for more information.
