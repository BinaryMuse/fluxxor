_ = require("lodash");

module.exports = function() {
  var storeNames = Array.prototype.slice.call(arguments);
  return {
    componentWillMount: function() {
      var flux = this.props.flux || this.context.flux;
      _.each(storeNames, function(store) {
        flux.store(store).on("change", this._setStateFromFlux)
      }, this);
    },

    componentWillUnmount: function() {
      var flux = this.props.flux || this.context.flux;
      _.each(storeNames, function(store) {
        flux.store(store).removeListener("change", this._setStateFromFlux)
      }, this);
    },

    _setStateFromFlux: function() {
      this.setState(this.getStateFromFlux());
    },

    getInitialState: function() {
      return this.getStateFromFlux();
    }
  }
};
