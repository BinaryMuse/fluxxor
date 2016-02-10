var t = require("tcomb-form"),
    React = require("react"),
    ReactRouter = require("react-router"),
    Link = ReactRouter.Link,
    Fluxxor = require("../../../../");

var Recipe = require("../schemas/recipe.jsx"),
    RecipeForm = require("../forms/recipe_form.jsx");

var RecipeAdder = React.createClass({
  mixins: [
    Fluxxor.FluxMixin(React)
  ],

  contextTypes: {
    router: React.PropTypes.func
  },

  render: function() {
    return this.renderWithLayout(
      <div>
        <form onSubmit={this.onSubmit}>
          <t.form.Form ref="form" type={Recipe} options={RecipeForm} />
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
        <Link to="/">Home</Link>
        {" | "}<Link to="/recipe/add">Add New Recipe</Link>
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
