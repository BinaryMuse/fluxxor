var c = {
  RECIPE: {
    ADD: "RECIPE:ADD",
    EDIT: "RECIPE:EDIT",
    REMOVE: "RECIPE:REMOVE",
  },

  ROUTE: {
    TRANSITION: "ROUTE:TRANSITION"
  }
};

var methods = {
  recipes: {
    add: function(name, desc, ingredients, directions, preventTransition) {
      this.dispatch(c.RECIPE.ADD, {
        name: name,
        description: desc,
        ingredients: ingredients,
        directions: directions,
        preventTransition: preventTransition
      });
    },

    edit: function(id, name, desc, ingredients, directions) {
      this.dispatch(c.RECIPE.EDIT, {
        id: id,
        name: name,
        description: desc,
        ingredients: ingredients,
        directions: directions
      });
    },

    remove: function(id) {
      this.dispatch(c.RECIPE.REMOVE, id);
    }
  },

  routes: {
    transition: function(path, params) {
      this.dispatch(c.ROUTE.TRANSITION, {path: path, params: params});
    }
  }
};

module.exports = {
  methods: methods,
  constants: c
};
