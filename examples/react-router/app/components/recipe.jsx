var React = require("react"),
    Router = require("react-router"),
    Link = Router.Link;

var RecipeStore = require("../stores/recipe_store.jsx");

class Recipe extends React.Component {
  constructor() {
    super();
    this.deleteRecipe = this.deleteRecipe.bind(this);
  }

  render() {
    var recipe = this.props.recipe;

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
  }

  renderIngredient(ingredient, idx) {
    return (
      <li key={idx}>
        <strong>{ingredient.quantity}</strong> {ingredient.item}
      </li>
    );
  }

  renderNotFound() {
    return this.renderWithLayout(
      <div>That recipe was not found.</div>
    );
  }

  renderWithLayout(content) {
    return (
      <div>
        {content}
        <hr />
        <Link to="home">Home</Link>
        {" | "}<Link to="add-recipe">Add New Recipe</Link>
      </div>
    );
  }

  deleteRecipe(e) {
    if (confirm("Really delete this recipe?")) {
      this.props.onDeleteRecipe(this.props.recipe.id);
    } else {
      e.preventDefault();
    }
  }
}

Recipe.propTypes = {
  recipe: React.PropTypes.object.isRequired,
  onDeleteRecipe: React.PropTypes.func.isRequired
};

Recipe.contextTypes = {
  router: React.PropTypes.func
};

module.exports = Recipe;
