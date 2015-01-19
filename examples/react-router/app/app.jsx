var React = require("react"),
    Router = require("react-router"),
    Fluxxor = require("../../../");

var actions = require("./actions.jsx"),
    routes = require("./routes.jsx"),
    RecipeStore = require("./recipe_store.jsx");

require("./style.less");

var stores = {
  recipe: new RecipeStore()
};

var flux = new Fluxxor.Flux(stores, actions.methods);

flux.actions.recipes.add(
  "Strawberry Smoothie",
  "A yummy fruit smoothie made with tropical fruits.",
  [
    { quantity: "8",       item: "strawberries, hulled" },
    { quantity: "1/2 cup", item: "skim milk" },
    { quantity: "1/2 cup", item: "plain yogurt" },
    { quantity: "3 tbsp",  item: "white sugar" },
    { quantity: "2 tsp",   item: "vanilla extract" },
    { quantity: "6",       item: "ice cubes, crushed" }
  ],
  "In a blender combine strawberries, milk, yogurt, sugar and vanilla. Toss in the ice. Blend until smooth and creamy. Pour into glasses and serve."
);

Router.run(routes, function(Handler) {
  React.render(
    <Handler flux={flux} />,
    document.getElementById("app")
  );
});
