var React = require("react"),
    Router = require("react-router"),
    RouteHandler = Router.RouteHandler,
    Link = Router.Link,
    State = Router.State,
    Fluxxor = require("../../../../");

var RecipeForm = require("../forms/recipe_form.jsx");

var RecipeAdder = React.createClass({
  mixins: [
    Fluxxor.FluxMixin(React),
    State
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
        newRecipe.directions
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
