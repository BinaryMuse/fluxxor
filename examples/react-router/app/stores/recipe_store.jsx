var Fluxxor = require("../../../../");

var actions = require("../actions.jsx");

var NOT_FOUND_TOKEN = {};

var RecipeStore = Fluxxor.createStore({
  initialize: function() {
    this.recipeId = 0;
    this.recipes = {};

    this.bindActions(
      actions.constants.RECIPE.ADD, this.handleAddRecipe,
      actions.constants.RECIPE.EDIT, this.handleEditRecipe,
      actions.constants.RECIPE.REMOVE, this.handleRemoveRecipe
    );
  },

  getRecipes: function() {
    return Object.keys(this.recipes).map(function(key) {
      return this.recipes[key];
    }.bind(this));
  },

  getRecipe: function(id) {
    return this.recipes[id] || NOT_FOUND_TOKEN;
  },

  handleAddRecipe: function(payload) {
    var recipe = {
      name: payload.name,
      description: payload.description,
      ingredients: payload.ingredients,
      directions: payload.directions
    };
    recipe.id = ++this.recipeId;
    this.recipes[recipe.id] = recipe;

    // Normally an API call to save a new item would be asynchronous,
    // but we're faking a back-end store here, so we'll fake the
    // asynchrony too.
    setTimeout(function() {
      if (!payload.preventTransition) {
        this.flux.actions.routes.transition("recipe", {id: recipe.id});
      }
    }.bind(this));

    this.emit("change");
  },

  handleEditRecipe: function(payload) {
    this.recipes[payload.id] = {
      id: payload.id,
      name: payload.name,
      description: payload.description,
      ingredients: payload.ingredients,
      directions: payload.directions
    };

    this.emit("change");
  },

  handleRemoveRecipe: function(id) {
    delete this.recipes[id];
    this.emit("change");
  }
});

RecipeStore.NOT_FOUND_TOKEN = NOT_FOUND_TOKEN;

module.exports = RecipeStore;
