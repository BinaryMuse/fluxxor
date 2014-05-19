---
title: FAQ
template: page.ejs
---

FAQ
===

**Q:** Why does `Fluxbox.FluxMixin` and `Fluxbox.FluxChildMixin` constantly throw an error?

**A:** `Fluxbox.FluxMixin` and `Fluxbox.FluxChildMixin` are functions that takes React as a parameter and return the associated mixin:

```javascript
var FluxMixin = Fluxbox.FluxMixin(React),
    FluxChildMixin = Fluxbox.FluxChildMixin(React);

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

**A:** Fluxbox prevents cascading updates where one action triggers another, and so on. See [What is Flux](/what-is-flux.html) and [Flux Application Architecture](http://facebook.github.io/react/docs/flux-overview.html) for more information on Flux.

<hr>

**Q:** Why is Fluxbox throwing an error saying an action is already being dispatched when I'm sending an action from an asynchronous operation?

**A:** Some libraries will sometimes call callbacks on the same tick, for example if data is cached. You can wrap the action dispatch call in a `setTimeout` to ensure the function is asynchronous. For bonus points, notify the author of the offending library that [their asynchronous callbacks are sometimes synchronous](http://blog.ometer.com/2011/07/24/callbacks-synchronous-and-asynchronous/).
