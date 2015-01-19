var t = require("tcomb-form");

var Ingredient = require("./ingredient.jsx");

module.exports = t.struct({
  name: t.Str,
  description: t.maybe(t.Str),
  ingredients: t.list(Ingredient),
  directions: t.maybe(t.Str)
});
