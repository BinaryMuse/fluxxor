var React = require("react"),
    Router = require("react-router"),
    RouteHandler = Router.RouteHandler,
    Link = Router.Link,
    Navigation = Router.Navigation,
    State = Router.State,
    Fluxxor = require("../../../../");

var RecipeForm = require("../forms/recipe_form.jsx");

var RecipeAdder = React.createClass({
  mixins: [
    Fluxxor.FluxMixin(React),
    State,
    Navigation
  ],

  render: function() {
    return this.renderWithLayout(
      <div>
        <form onSubmit={this.onSubmit}>
          <RecipeForm ref="form" />
          <input type="submit" value="Save" />
        </form>
      </div>
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
      this.getFlux().actions.recipes.add(
        newRecipe.name,
        newRecipe.description,
        newRecipe.ingredients,
        newRecipe.directions,
        function(recipe) {
          this.transitionTo("recipe", {id: recipe.id});
        }.bind(this)
      );
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

module.exports = RecipeAdder;
