var React = require("react"),
    Router = require("react-router"),
    RouteHandler = Router.RouteHandler,
    Link = Router.Link;

class RecipeList extends React.Component {
  render() {
    return (
      <div>
        <h1>Recipes</h1>
        <ul>{this.props.recipes.map(this.renderRecipeLink)}</ul>
        <div>
          <Link to="add-recipe">Add New Recipe</Link>
        </div>
      </div>
    );
  }

  renderRecipeLink(recipe) {
    return (
      <li key={recipe.id}>
        <Link to="recipe" params={{id: recipe.id}}>{recipe.name}</Link>
      </li>
    );
  }
};

module.exports = RecipeList;
