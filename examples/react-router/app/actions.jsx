var c = {
  ADD_RECIPE: "ADD_RECIPE",
  EDIT_RECIPE: "EDIT_RECIPE",
  REMOVE_RECIPE: "REMOVE_RECIPE"
};

var methods = {
  recipes: {
    add: function(name, desc, ingredients, directions, callback) {
      this.dispatch(c.ADD_RECIPE, {
        name: name,
        description: desc,
        ingredients: ingredients,
        directions: directions,
        callback: callback
      });
    },

    edit: function(id, name, desc, ingredients, directions) {
      this.dispatch(c.EDIT_RECIPE, {
        id: id,
        name: name,
        description: desc,
        ingredients: ingredients,
        directions: directions
      });
    },

    remove: function(id) {
      this.dispatch(c.REMOVE_RECIPE, id);
    }
  }
};

module.exports = {
  methods: methods,
  constants: c
};
