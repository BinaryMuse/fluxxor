var t = require("tcomb-form"),
    React = require("react"),
    Router = require("react-router"),
    RouteHandler = Router.RouteHandler,
    Link = Router.Link;

var Recipe = require("../schemas/recipe.jsx"),
    RecipeForm = require("../forms/recipe_form.jsx"),
    RecipeStore = require("../stores/recipe_store.jsx");

class RecipeEditor extends React.Component {
  constructor() {
    super();
    this.onSubmit = this.onSubmit.bind(this);
    this.deleteRecipe = this.deleteRecipe.bind(this);
  }

  render() {
    var recipe = this.props.recipe;

    if (recipe === RecipeStore.NOT_FOUND_TOKEN) {
      return this.renderNotFound();
    }

    return this.renderWithLayout(
      <div>
        <form onSubmit={this.onSubmit}>
          <t.form.Form ref="form" type={Recipe} value={recipe} options={RecipeForm} />
          <input type="submit" value="Save" />
        </form>

        <p>
          <Link to="home" onClick={this.deleteRecipe}>Delete Recipe</Link>
        </p>
      </div>
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

  onSubmit(e) {
    e.preventDefault();

    var newRecipe = this.refs.form.getValue();
    if (newRecipe) {
      this.props.onEditRecipe(
        this.props.recipe.id,
        newRecipe.name,
        newRecipe.description,
        newRecipe.ingredients,
        newRecipe.directions
      );

      this.context.router.transitionTo("recipe", {id: this.props.recipe.id});
    }
  }

  deleteRecipe(e) {
    if (confirm("Really delete this recipe?")) {
      this.props.onDeleteRecipe(this.props.recipe.id);
    } else {
      e.preventDefault();
    }
  }
};

RecipeEditor.propTypes = {
  recipe: React.PropTypes.object.isRequired,
  onEditRecipe: React.PropTypes.func.isRequired,
  onDeleteRecipe: React.PropTypes.func.isRequired
};

RecipeEditor.contextTypes = {
  router: React.PropTypes.func
};

module.exports = RecipeEditor;
