var React = require("react"),
    ReactRouter = require("react-router"),
    Link = ReactRouter.Link,
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
          <Link to="/recipe/add">Add New Recipe</Link>
        </div>
      </div>
    );
  },

  renderRecipeLink: function(recipe) {
    return (
      <li key={recipe.id}>
        <Link to={"/recipe/" + recipe.id}>{recipe.name}</Link>
      </li>
    );
  }
});

module.exports = RecipeList;
