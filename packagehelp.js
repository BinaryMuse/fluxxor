// Fluxxor

var Fluxxor = {
  Dispatcher: require("fluxxor-dispatcher"),
  Store: require("fluxxor-store"),
  Action: require("fluxxor-action")
};

module.exports = Fluxxor


// Project A

"fluxxor": "^1.2.5" // deps

var Fluxxor = require("fluxxor"),
    Dispatcher = Fluxxor.Dispatcher;


// Project B

var Dispatcher = require("fluxxor-dispatcher");


// Extending Library A

var FluxxorStore = require("fluxxor-store");

class MyStore extends FluxxorStore {
  constructor() {
    super();
    this.mixins.map(...);
  }
}

module.exports = MyStore;
