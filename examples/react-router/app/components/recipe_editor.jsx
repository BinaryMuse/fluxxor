var React = require("react"),
    Router = require("react-router"),
    RouteHandler = Router.RouteHandler,
    Link = Router.Link,
    Navigation = Router.Navigation,
    State = Router.State,
    Fluxxor = require("../../../../");

var RecipeForm = require("../forms/recipe_form.jsx"),
    RecipeStore = require("../recipe_store.jsx");

var RecipeEditor = React.createClass({
  mixins: [
    Fluxxor.FluxMixin(React),
    Fluxxor.StoreWatchMixin("recipe"),
    State,
    Navigation
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

    return this.renderWithLayout(
      <div>
        <form onSubmit={this.onSubmit}>
          <RecipeForm ref="form" value={recipe} />
          <input type="submit" value="Save" />
        </form>

        <p>
          <Link to="home" onClick={this.deleteRecipe}>Delete Recipe</Link>
        </p>
      </div>
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

  onSubmit: function(e) {
    e.preventDefault();

    var newRecipe = this.refs.form.getValue();
    if (newRecipe) {
      this.getFlux().actions.recipes.edit(
        this.state.recipe.id,
        newRecipe.name,
        newRecipe.description,
        newRecipe.ingredients,
        newRecipe.directions
      );

      this.transitionTo("recipe", {id: this.state.recipe.id});
    }
  },

  deleteRecipe: function(e) {
    if (confirm("Really delete this recipe?")) {
      this.getFlux().actions.recipes.remove(this.state.recipe.id);
    } else {
      e.preventDefault();
    }
  }
});

module.exports = RecipeEditor;
