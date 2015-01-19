var React = require("react"),
    Router = require("react-router"),
    Route = Router.Route,
    DefaultRoute = Router.DefaultRoute;

var EmptyView = require("./components/empty_view.jsx"),
    Recipe = require("./components/recipe.jsx"),
    RecipeEditor = require("./components/recipe_editor.jsx"),
    RecipeAdder = require("./components/recipe_adder.jsx"),
    RecipeList = require("./components/recipe_list.jsx");

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

module.exports = routes;
