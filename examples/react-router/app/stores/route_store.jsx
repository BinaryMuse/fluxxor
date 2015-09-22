var Fluxxor = require("../../../../");
var ReactRouter = require("react-router");

var actions = require("../actions.jsx");

var History = ReactRouter.History;

var RouteStore = Fluxxor.createStore({
  mixins: [History],

  initialize: function(options) {
    this.router = options.router;

    this.bindActions(
      actions.constants.ROUTE.TRANSITION, this.handleRouteTransition
    );
  },

  handleRouteTransition: function(payload) {
    var path = payload.path,
        params = payload.params;

    this.history.pushState(null, path, params);
  }
});

module.exports = RouteStore;
