---
title: Routing
template: page.ejs
---

Routing
=======

When using a client-side router with Fluxxor, you need to find a way to get your `Flux` instance into the instantiated component. The [React Router project](https://github.com/rackt/react-router) makes this a cinch.

First, define your routes:

```javascript
var routes = (
  <Route handler={App}>

    <Route name="inbox" handler={Inbox}>
      <Route name="message" path=":messageId" handler={Message} />
      <DefaultRoute handler={InboxStats} />
    </Route>

    <Route name="calendar" handler={Calendar} />
    <DefaultRoute handler={Dashboard} />

  </Route>
);
```

For each component you list as a route handler (`App`, `Inbox`, `Message`, `InboxStats`, `Calendar`, and `Dashboard` in this example), be sure to mix in [Fluxxor's `FluxMixin`](/documentation/flux-mixin.html).

Finally, run your router, and when you instantiate your component, pass in `flux` as a property. Since each defined route handler uses `FluxMixin`, the flux object will be propagated throughout your application.

```javascript
Router.run(routes, function(Handler) {
  React.render(<Handler flux={flux} />, document.body);
});
```

Be sure to check out [the React Router example](/examples/react-router.html) for a working demonstration of this technique.
