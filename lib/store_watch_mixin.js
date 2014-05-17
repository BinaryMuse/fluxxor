module.exports = function(React) {
  return function() {
    var storeNames = Array.prototype.slice.call(arguments);
    return {
      componentDidMount: function() {
        var flux  = this.props.flux || this.context.flux;
        _.each(storeNames, function(store) {
          flux.store(store).on("change", this._setStateFromFlux)
        }, this);
      },

      componentDidUnmount: function() {
        var flux  = this.props.flux || this.context.flux;
        _.each(storeNames, function(store) {
          flux.store(store).off("change", this._setStateFromFlux)
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
};
