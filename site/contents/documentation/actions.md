---
title: Actions
template: page.ejs
---

Actions
=======

Actions, which are simply combinations of a string `type` and an object `payload`, represent the intent to perform some manipulation of the data in a Flux application. They are dispatched via the aptly named dispatcher to every store the dispatcher knows about. The only way to update stores is to send them actions.

To make programming with Flux more semantic, the [Flux](/documentation/flux.html) constructor takes an object with function values; these functions can call `this.dispatch(type, payload)` to dispatch an action to the dispatcher. Dispatching an action then looks like a normal method call. As an example, imagine you want to dispatch a method to add a URL at a certain index. Dispatching manually, you would write

```javascript
flux.dispatcher.dispatch("ADD_URL", {url: "http://google.com", index: 3});
```

By using the `actions` hash, it would look more like this:

```javascript
var actions = {
  addUrl: function(url, index) {
    this.dispatch("ADD_URL", {url: url, index: index});
  }
};

var flux = new Fluxxor.Flux(stores, actions);

// somewhere later...
flux.actions.addUrl("http://google.com", 3);
```

[Stores](/documentation/stores.html) respond to specific action types via the `actions` object in their spec or via calls to `bindActions` during initialization.

```javascript
var UrlStore = Fluxxor.createStore({
  actions: {
    "ADD_URL": "handleAddUrl"
  },

  // ...

  handleAddUrl: function(payload, type) {
    this.urls.splice(payload.index, 0, payload.url);
    this.emit("change");
  }
});
```

See the documentation on [stores](/documentation/stores.html) for more information.
