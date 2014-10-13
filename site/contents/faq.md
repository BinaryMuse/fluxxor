---
title: FAQ
template: page.ejs
---

FAQ
===

**Q:** Does Fluxxor require React?

**A:** Fluxxor works great with React, and if you want to use the mixins, you will of course need React, but Fluxxor has no dependency on React itself.

<hr>

**Q:** Why does `Fluxxor.FluxMixin` constantly throw an error?

**A:** `Fluxxor.FluxMixin` is a function that takes React as a parameter and returns the associated mixin:

```javascript
var FluxMixin = Fluxxor.FluxMixin(React);

React.createClass({
  mixins: [FluxMixin],

  // ...
});
```

<hr>

**Q:** How do I deal with asynchronous operations in stores?

**A:** Dispatches to stores are always synchronous, but stores can perform asynchronous operations. At the end of the async call, the store can dispatch a separate action that represents the *availability* of the asynchronously-obtained data. See [Dealing with Asynchronous Data](/guides/async-data.html) for more details.

<hr>

**Q:** Why does dispatching an action while another action is in progress throw an error?

**A:** Fluxxor prevents cascading updates where one action triggers another, and so on. See [What is Flux](/what-is-flux.html) and [Flux Application Architecture](http://facebook.github.io/react/docs/flux-overview.html) for more information on Flux.

<hr>

**Q:** Why is Fluxxor throwing an error saying an action is already being dispatched when I'm sending an action from an asynchronous operation?

**A:** Some libraries will sometimes call callbacks on the same tick, for example if data is cached. You can wrap the action dispatch call in a `setTimeout` to ensure the function is asynchronous. For bonus points, notify the author of the offending library that [their asynchronous callbacks are sometimes synchronous](http://blog.ometer.com/2011/07/24/callbacks-synchronous-and-asynchronous/).

<hr>

**Q:** Why do I see a warning that says "possible EventEmitter memory leak detected"?

**A:** This warning is built in to the Node.js [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter) to help avoid accidentally leaking handlers. If you know you're not actually leaking and you want to suppress this warning, you can call [`setMaxListeners(n)`](http://nodejs.org/api/events.html#events_emitter_setmaxlisteners_n) on your store (you can use a value of `0` for unlimited).

As of version 1.4.2, Fluxxor uses [EventEmitter3](https://github.com/3rd-Eden/EventEmitter3) instead of the built-in Node.js EventEmitter, which should resolve this issue.
