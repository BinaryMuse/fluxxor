var Flux = function(dispatcher, actions) {
  var dispatchBinder = {
    dispatch: function(type, payload) {
      dispatcher.dispatch({type: type, payload: payload});
    }
  };

  this.dispatcher = dispatcher;
  this.actions = {};
  for (key in actions) {
    this.actions[key] = actions[key].bind(dispatchBinder);
  }
};

Flux.prototype.store = function(name) {
  return this.dispatcher.stores[name];
};

module.exports = Flux;
