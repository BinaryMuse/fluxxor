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
  this.stores = stores;

  for (var key in actions) {
    if (actions.hasOwnProperty(key)) {
      this.actions[key] = actions[key].bind(dispatchBinder);
    }
  }

  for (key in stores) {
    if (stores.hasOwnProperty(key)) {
      stores[key].flux = this;
    }
  }
};

Flux.prototype.store = function(name) {
  return this.stores[name];
};

module.exports = Flux;
