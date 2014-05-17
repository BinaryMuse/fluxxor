var Dispatcher = require("./lib/dispatcher"),
    Flux = require("./lib/flux"),
    FluxMixin = require("./lib/flux_mixin"),
    StoreWatchMixin = require("./lib/store_watch_mixin"),
    createStore = require("./lib/create_store");

var Fluxbox = {
  Dispatcher: Dispatcher,
  Flux: Flux,
  FluxMixin: FluxMixin,
  StoreWatchMixin: StoreWatchMixin,
  createStore: createStore
};

module.exports = Fluxbox;
