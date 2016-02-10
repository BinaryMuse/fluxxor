var React = require("react"),
    ReactRouter = require("react-router"),
    Route = ReactRouter.Route,
    IndexRoute = ReactRouter.IndexRoute;

var Recipe = require("./components/recipe.jsx"),
    RecipeEditor = require("./components/recipe_editor.jsx"),
    RecipeAdder = require("./components/recipe_adder.jsx"),
    RecipeList = require("./components/recipe_list.jsx"),
    EmptyView = require("./components/empty_view.jsx");

var routes = (
  <Route component={EmptyView} path="/">
    <Route component={RecipeAdder} path="recipe/add" />
    <Route component={Recipe} path="recipe/:id" />
    <Route component={RecipeEditor} path="recipe/:id/edit" />
    <IndexRoute component={RecipeList}/>
  </Route>
);

module.exports = routes;
