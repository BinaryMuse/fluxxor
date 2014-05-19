---
title: FAQ
template: page.ejs
---

FAQ
===

**Q:** Does Fluxxor require React?

**A:** Fluxxor works great with React, and if you want to use the mixins, you will of course need React, but Fluxxor has no dependency on React itself.

<hr>

**Q:** Why does `Fluxxor.FluxMixin` and `Fluxxor.FluxChildMixin` constantly throw an error?

**A:** `Fluxxor.FluxMixin` and `Fluxxor.FluxChildMixin` are functions that take React as a parameter and return the associated mixin:

```javascript
var FluxMixin = Fluxxor.FluxMixin(React),
    FluxChildMixin = Fluxxor.FluxChildMixin(React);

React.createClass({
  mixins: [FluxMixin], // or FluxChildMixin, as appropriate

  // ...
});
```

<hr>

**Q:** How do I deal with asynchronous operations in stores?

**A:** Dispatches to stores are always synchronous, but stores can perform asynchronous operations. At the end of the async call, the store can dispatch a separate action that represents the *availability* of the asynchronously-obtained data.

<hr>

**Q:** Why does dispatching an action while another action is in progress throw an error?

**A:** Fluxxor prevents cascading updates where one action triggers another, and so on. See [What is Flux](/what-is-flux.html) and [Flux Application Architecture](http://facebook.github.io/react/docs/flux-overview.html) for more information on Flux.

<hr>

**Q:** Why is Fluxxor throwing an error saying an action is already being dispatched when I'm sending an action from an asynchronous operation?

**A:** Some libraries will sometimes call callbacks on the same tick, for example if data is cached. You can wrap the action dispatch call in a `setTimeout` to ensure the function is asynchronous. For bonus points, notify the author of the offending library that [their asynchronous callbacks are sometimes synchronous](http://blog.ometer.com/2011/07/24/callbacks-synchronous-and-asynchronous/).
