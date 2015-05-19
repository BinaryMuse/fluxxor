var t = require("tcomb-form"),
    React = require("react"),
    Router = require("react-router"),
    RouteHandler = Router.RouteHandler,
    Link = Router.Link;

var Recipe = require("../schemas/recipe.jsx"),
    RecipeForm = require("../forms/recipe_form.jsx");

class RecipeAdder extends React.Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  render() {
    return this.renderWithLayout(
      <div>
        <form onSubmit={this.onSubmit}>
          <t.form.Form ref="form" type={Recipe} options={RecipeForm} />
          <input type="submit" value="Save" />
        </form>
      </div>
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
      this.props.onAddRecipe(
        newRecipe.name,
        newRecipe.description,
        newRecipe.ingredients,
        newRecipe.directions
      );
    }
  }
};

RecipeAdder.propTypes = {
  onAddRecipe: React.PropTypes.func.isRequired
};

RecipeAdder.contextTypes = {
  router: React.PropTypes.func
};


module.exports = RecipeAdder;
