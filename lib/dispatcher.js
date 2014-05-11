var Dispatcher = function(stores) {
  this.stores = stores;

  for (key in stores) {
    stores[key].dispatcher = this;
  }
};

Dispatcher.prototype.dispatch = function(action) {
  for (key in this.stores) {
    try {
      this.stores[key].__handleAction__(action);
    } catch (e) {
      console.error("Error dispatching payload to %s:", key, action);
      console.error(e.stack ? e.stack : e);
    }
  }
};

module.exports = Dispatcher;
