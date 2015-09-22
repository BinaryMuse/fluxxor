var t = require("tcomb-form"),
    React = require("react"),
    ReactRouter = require("react-router"),
    Link = ReactRouter.Link,
    Fluxxor = require("../../../../");

var Recipe = require("../schemas/recipe.jsx"),
    RecipeForm = require("../forms/recipe_form.jsx"),
    RecipeStore = require("../stores/recipe_store.jsx");

var RecipeEditor = React.createClass({
  mixins: [
    Fluxxor.FluxMixin(React),
    Fluxxor.StoreWatchMixin("recipe"),
    ReactRouter.State
  ],

  contextTypes: {
    router: React.PropTypes.func
  },

  getStateFromFlux: function() {
    var params = this.props.params;

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
          <t.form.Form ref="form" type={Recipe} value={recipe} options={RecipeForm} />
          <input type="submit" value="Save" />
        </form>

        <p>
          <Link to="/" onClick={this.deleteRecipe}>Delete Recipe</Link>
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
        <Link to="/">Home</Link>
        {" | "}<Link to="/recipe/add">Add New Recipe</Link>
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

      this.context.router.transitionTo("recipe", {id: this.state.recipe.id});
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
