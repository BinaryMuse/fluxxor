var Dispatcher = require("./dispatcher");

var Flux = function(stores) {
  var dispatcher = new Dispatcher(stores);

  this.dispatcher = dispatcher;

  for (var key in stores) {
    if (stores.hasOwnProperty(key)) {
      stores[key].flux = this;
    }
  }
};

Flux.prototype.store = function(name) {
  return this.dispatcher.stores[name];
};

Flux.prototype.dispatch = function(action) {
  return this.dispatcher.dispatch(action);
};

module.exports = Flux;
