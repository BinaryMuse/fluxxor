var React = require("react"),
    Router = require("react-router"),
    Link = Router.Link,
    State = Router.State,
    Fluxxor = require("../../../../");

var RecipeStore = require("../stores/recipe_store.jsx");

var Recipe = React.createClass({
  mixins: [
    Fluxxor.FluxMixin(React),
    Fluxxor.StoreWatchMixin("recipe"),
    State
  ],

  getStateFromFlux: function() {
    var params = this.getParams();

    return {
      recipe: this.getFlux().store("recipe").getRecipe(params.id)
    };
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState(this.getStateFromFlux());
  },

  render: function() {
    var recipe = this.state.recipe;

    if (recipe === RecipeStore.NOT_FOUND_TOKEN) {
      return this.renderNotFound();
    }

    var description = (recipe.description || "").replace(/\n/g, "<br>"),
        directions = (recipe.directions || "").replace(/\n/g, "<br>");

    return this.renderWithLayout(
      <div>
        <h1>{recipe.name}</h1>
        <p dangerouslySetInnerHTML={{__html: description}} />
        <strong>Ingredients:</strong>
        <ul>{recipe.ingredients.map(this.renderIngredient)}</ul>
        <strong>Directions:</strong>
        <p dangerouslySetInnerHTML={{__html: directions}} />

        <p>
          <Link to="edit-recipe" params={{id: recipe.id}}>Edit Recipe</Link>
          {" | "}<Link to="home" onClick={this.deleteRecipe}>Delete Recipe</Link>
        </p>
      </div>
    );
  },

  renderIngredient: function(ingredient, idx) {
    return (
      <li key={idx}>
        <strong>{ingredient.quantity}</strong> {ingredient.item}
      </li>
    );
  },

  renderNotFound: function() {
    return this.renderWithLayout(
      <div>That recipe was not found.</div>
    );
  },

  renderWithLayout: function(content) {
    return (
      <div>
        {content}
        <hr />
        <Link to="home">Home</Link>
        {" | "}<Link to="add-recipe">Add New Recipe</Link>
      </div>
    );
  },

  deleteRecipe: function(e) {
    if (confirm("Really delete this recipe?")) {
      this.getFlux().actions.recipes.remove(this.state.recipe.id);
    } else {
      e.preventDefault();
    }
  }
});

module.exports = Recipe;
