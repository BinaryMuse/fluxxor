var t = require("tcomb-form"),
    React = require("react"),
    Router = require("react-router"),
    RouteHandler = Router.RouteHandler,
    Link = Router.Link,
    Fluxxor = require("../../../../");


var Recipe = require("../schemas/recipe.jsx"),
    RecipeForm = require("../forms/recipe_form.jsx"),
    RecipeStore = require("../recipe_store.jsx");

var RecipeEditor = React.createClass({
  mixins: [
    Fluxxor.FluxMixin(React),
    Fluxxor.StoreWatchMixin("recipe")
  ],

  contextTypes: {
    router: React.PropTypes.func
  },

  getStateFromFlux: function() {
    var params = this.context.router.getCurrentParams();

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
