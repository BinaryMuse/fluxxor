var Dispatcher = require("./lib/dispatcher"),
    Flux = require("./lib/flux"),
    FluxMixin = require("./lib/flux_mixin"),
    createStore = require("./lib/create_store");

var Fluxbox = {
  Dispatcher: Dispatcher,
  Flux: Flux,
  Mixin: FluxMixin,
  createStore: createStore
};

module.exports = Fluxbox;
