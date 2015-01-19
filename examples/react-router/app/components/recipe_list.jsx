var React = require("react"),
    Router = require("react-router"),
    RouteHandler = Router.RouteHandler,
    Link = Router.Link,
    Fluxxor = require("../../../../");

var RecipeList = React.createClass({
  mixins: [Fluxxor.FluxMixin(React), Fluxxor.StoreWatchMixin("recipe")],

  getStateFromFlux: function() {
    return {
      recipes: this.getFlux().store("recipe").getRecipes()
    };
  },

  render: function() {
    return (
      <div>
        <h1>Recipes</h1>
        <ul>{this.state.recipes.map(this.renderRecipeLink)}</ul>
        <div>
          <Link to="add-recipe">Add New Recipe</Link>
        </div>
      </div>
    );
  },

  renderRecipeLink: function(recipe) {
    return (
      <li key={recipe.id}>
        <Link to="recipe" params={{id: recipe.id}}>{recipe.name}</Link>
      </li>
    );
  }
});

module.exports = RecipeList;
