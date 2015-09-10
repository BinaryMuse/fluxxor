var React = require("react"),
    Router = require("react-router"),
    Fluxxor = require("../../../");

var actions = require("./actions.jsx"),
    routes = require("./routes.jsx"),
    RecipeStore = require("./stores/recipe_store.jsx"),
    RouteStore = require("./stores/route_store.jsx");

require("./style.less");

var router = Router.create({routes: routes});

var stores = {
  recipe: new RecipeStore(),
  route: new RouteStore({router: router})
};

var flux = new Fluxxor.Flux(stores, actions.methods);
flux.on("dispatch", function(type, payload) {
  console.log("Dispatch:", type, payload);
});

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
  "In a blender combine strawberries, milk, yogurt, sugar and vanilla. Toss in the ice. Blend until smooth and creamy. Pour into glasses and serve.",
  true
);

router.run(function(Handler) {
  React.render(
    <Handler flux={flux} />,
    document.getElementById("app")
  );
});
