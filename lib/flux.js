var Dispatcher = require("./dispatcher");

var Flux = function(stores, actions) {
  var dispatcher = new Dispatcher(stores),
      dispatchBinder = {
        dispatch: function(type, payload) {
          dispatcher.dispatch({type: type, payload: payload});
        }
      };

  this.dispatcher = dispatcher;
  this.actions = {};

  for (var key in actions) {
    this.actions[key] = actions[key].bind(dispatchBinder);
  }

  for (key in stores) {
    stores[key].flux = this;
  }
};

Flux.prototype.store = function(name) {
  return this.dispatcher.stores[name];
};

module.exports = Flux;
