---
title: React Router
template: page.ejs
---

React Router
============

This example demonstrates the techniques explained in [the routing guide](/guides/routing.html), utilizing [React Router](https://github.com/rackt/react-router) to provide a client-side routing solution. The code for this example can be found [on GitHub](https://github.com/BinaryMuse/fluxxor/tree/master/examples/react-router).

<div id="react-router-example-section">
  <div id="app"></div>
  <script src="react-router-bundle.js"></script>
</div>

The route definition and run block for this app looks like this:

```javascript
var routes = (
  <Route handler={EmptyView} name="home" path="/">
    <Route handler={RecipeAdder} name="add-recipe" path="/recipe/add" />

    <Route handler={EmptyView} path="/recipe/:id">
      <Route handler={RecipeEditor} name="edit-recipe" path="edit" />
      <DefaultRoute handler={Recipe} name="recipe" />
    </Route>

    <DefaultRoute handler={RecipeList} />
  </Route>
);

var flux = new Fluxxor.Flux(...);

Router.run(routes, function(Handler) {
  React.render(
    <Handler flux={flux} />,
    document.getElementById("app")
  );
});
```

