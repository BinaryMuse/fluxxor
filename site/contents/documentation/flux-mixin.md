---
title: FluxMixin
template: page.ejs
---

Fluxxor.FluxMixin
=================

`Fluxxor.FluxMixin` and `Fluxxor.FluxChildMixin` are simple React mixins that assists with making a [`Flux`](/documentation/flux.html) instance available to a component hierarchy. Pass an instance of `Flux` as a property named `flux` and mix `FluxMixin` in to a top level component, and mix in `FluxChildMixin` to any child components, and the `Flux` object will be available as `this.getFlux()` in any component using either mixin.

Keep in mind that implicitly passing data through context can make it more difficult to reason about things like `shouldComponentUpdate`. Ideally, an instance of `Flux` on the context of a child component should only be used to dispatch actions, and *not* to read data from the stores—read data from the stores at the top-level component and pass the data through props as necessary.

Note that `FluxMixin` and `FluxChildMixin` are functions that take `React` as an argument and return the associated mixin.

Example:

```javascript
var React = require("react"),
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React), // or window.React, etc.
    FluxChildMixin = Fluxxor.FluxChildMixin(React); // or window.React, etc.

var ParentComponent = React.createClass({
  mixins: [FluxMixin],

  render: function() {
    return <ChildComponent />;
  }
});

var ChildComponent = React.createClass({
  render: function() {
    return <GrandchildComponent />;
  }
});

var GrandchildComponent = React.createClass({
  mixins: [FluxChildMixin],

  render: function() {
    return <button onClick={this.onClick}>Button!</button>;
  },

  onClick: function() {
    this.getFlux().actions.someAction();
  }
});

var flux = new Fluxxor.Flux(...);
React.renderComponent(<ParentComponent flux={flux} />, ...);
```
