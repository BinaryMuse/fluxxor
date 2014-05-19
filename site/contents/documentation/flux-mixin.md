---
title: FluxMixin
template: page.ejs
---

Fluxbox.FluxMixin
=================

`Fluxbox.FluxMixin` is a simple React mixin that assists with making a [`Flux`](/documentation/flux.html) instance available to a component hierarchy. Simply pass an instance of `Flux` as a property named `flux` and mix in the mixin and any descendants of the component that declare `flux` in their `contextTypes` will automatically receive the flux instance on `this.context.flux`.

Keep in mind that implicitly passing data through context can make it more difficult to reason about things like `shouldComponentUpdate`. Ideally, an instance of `Flux` on the context of a child component should only be used to dispatch actions, and *not* to read data from the stores—read data from the stores at the top-level component and pass the data through props as necessary.

Note that `FluxMixin` is a function that takes `React` as an argument and returns the mixin.

Example:

```javascript
var React = require("react"),
    Fluxbox = require("fluxbox"),
    FluxMixin = Fluxbox.FluxMixin(React); // or window.React, etc.

var ParentComponent = React.createClass({
  mixins: [FluxMixin],

  render: function() {
    return <ChildComponent />;
  }
});

var ChildComponent: React.createClass({
  render: function() {
    return <GrandchildComponent />;
  }
});

var GrandchildComponent: React.createClass({
  contextTypes: {
    flux: React.PropTypes.object
  },

  render: function() {
    return <button onClick={this.onClick}>Button!</button>;
  },

  onClick: function() {
    var flux = this.context.flux;
    flux.actions.someAction();
  }
});

var flux = new Fluxbox.Flux(...);
React.renderComponent(<ParentComponent flux={flux} />, ...);
```
