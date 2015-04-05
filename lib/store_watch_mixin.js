var _each = require("lodash-node/modern/collection/forEach");

var StoreWatchMixin = function() {
  var storeNames = Array.prototype.slice.call(arguments);
  return {
    componentDidMount: function() {
      var flux = this.props.flux || this.context.flux;
      _each(storeNames, function(store) {
        flux.store(store).on("change", this._setStateFromFlux);
      }, this);
    },

    componentWillUnmount: function() {
      var flux = this.props.flux || this.context.flux;
      _each(storeNames, function(store) {
        flux.store(store).removeListener("change", this._setStateFromFlux);
      }, this);
    },

    _setStateFromFlux: function() {
      if(this.isMounted()) {
        this.setState(this.getStateFromFlux());
      }
    },

    getInitialState: function() {
      return this.getStateFromFlux();
    }
  };
};

StoreWatchMixin.componentWillMount = function() {
  throw new Error("Fluxxor.StoreWatchMixin is a function that takes one or more " +
    "store names as parameters and returns the mixin, e.g.: " +
    "mixins: [Fluxxor.StoreWatchMixin(\"Store1\", \"Store2\")]");
};

module.exports = StoreWatchMixin;
