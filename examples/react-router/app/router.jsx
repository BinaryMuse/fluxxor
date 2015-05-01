var React = require("react"),
    Router = require("react-router"),
    Route = Router.Route,
    DefaultRoute = Router.DefaultRoute;

var EmptyView = require("./components/empty_view.jsx"),
    Recipe = require("./components/recipe.jsx"),
    RecipeEditor = require("./components/recipe_editor.jsx"),
    RecipeAdder = require("./components/recipe_adder.jsx"),
    RecipeList = require("./components/recipe_list.jsx");

var Fluxxor = require("../../..");
var FluxController = Fluxxor.FluxController(React);

var router;

var { wrap } = FluxController;

// The basic format for `FluxController.wrap` is:
//
//   wrap(component, storesToWatch, propsFunction, extraContext)
//
// Where the return value of `propsFunction` should be an object that
// will get passed to the wrapped component as properties, and `extraContext`
// is an object or a function that returns an object that will be passed as
// the last argument to `propsFunction`.
//
// `propsFunction` has the signature:
//
//   (flux, props, extraContext) => { return obj; }
//
// where `flux` is the `Fluxxor.Flux` instance, `props` is the props
// originally passed to the component, and `extraContext` is as
// described above.


// This example is the most basic; `RecipeList` is wrapped by a
// component that re-renders it anytime the "recipe" store is changed,
// passing in `flux.store("recipe").getRecipes()` as its `recipes` prop.
RecipeListWrapped = wrap(RecipeList, ["recipe"], (flux) => {
  return {
    recipes: flux.store("recipe").getRecipes()
  };
});

// This example is similar, except no stores are watched. The purpose
// of wrapping the component is to provide a flux action creator
// as one of its properties.
RecipeAdderWrapped = wrap(RecipeAdder, [], (flux) => {
  return {
    onAddRecipe: (name, desc, ingredients, directions) => {
      flux.actions.recipes.add(name, desc, ingredients, directions);
    }
  };
});

// This example shows how you could provide extra context to
// the props function (in this case, we want access to the router.
RecipeWrapped = wrap(Recipe, ["recipe"], (flux, props, extraContext) => {
  var params = extraContext.router.getCurrentParams();

  return {
    recipe: flux.store("recipe").getRecipe(params.id),
    onDeleteRecipe: (recipeId) => {
      flux.actions.recipes.remove(recipeId);
    }
  };
}, () => ({router: router})); // we make extraContext a function and
                              // it will be called, and the result passed
                              // as the last arg to the props function

// This example shows how to completely customize the rendering
// of a child component by utilizing `FluxController` directly
// in a custom `render` function (passed as a prop to
// `FluxController`).
class RecipeEditorWrapped extends React.Component {
  getChildProps(flux, props, extraCtx) {
    var params = extraCtx.router.getCurrentParams();
    return {
      recipe: flux.store("recipe").getRecipe(params.id),
      onEditRecipe: (id, name, desc, ingredients, directions) => {
        flux.actions.recipes.edit(id, name, desc, ingredients, directions);
      },
      onDeleteRecipe: (recipeId) => {
        flux.actions.recipes.remove(recipeId);
      }
    };
  }

  render() {
    return <FluxController
              flux={this.props.flux}
              fluxxorStores={["recipe"]}
              fluxxorProps={this.getChildProps}
              fluxxorExtraContext={{router: this.context.router}}
              render={this.renderChild} />;
  }

  renderChild(fProps) {
    return <RecipeEditor {...fProps} />;
  }
}

RecipeEditorWrapped.contextTypes = {
  router: React.PropTypes.func
};


var routes = (
  <Route handler={EmptyView} name="home" path="/">
    <Route handler={RecipeAdderWrapped} name="add-recipe" path="/recipe/add" />

    <Route handler={EmptyView} path="/recipe/:id">
      <Route handler={RecipeEditorWrapped} name="edit-recipe" path="edit" />
      <DefaultRoute handler={RecipeWrapped} name="recipe" />
    </Route>

    <DefaultRoute handler={RecipeListWrapped} />
  </Route>
);

router = Router.create({routes: routes});

module.exports = router;
