var React = require("react"),
    Router = require("react-router"),
    Route = Router.Route,
    DefaultRoute = Router.DefaultRoute,
    RouteHandler = Router.RouteHandler;

var Recipe = require("./components/recipe.jsx"),
    RecipeEditor = require("./components/recipe_editor.jsx"),
    RecipeAdder = require("./components/recipe_adder.jsx"),
    RecipeList = require("./components/recipe_list.jsx");

var routes = (
  <Route handler={RouteHandler} name="home" path="/">
    <Route handler={RecipeAdder} name="add-recipe" path="/recipe/add" />

    <Route handler={RouteHandler} path="/recipe/:id">
      <Route handler={RecipeEditor} name="edit-recipe" path="edit" />
      <DefaultRoute handler={Recipe} name="recipe" />
    </Route>

    <DefaultRoute handler={RecipeList} />
  </Route>
);

module.exports = routes;
