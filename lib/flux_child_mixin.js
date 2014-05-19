var FluxChildMixin = function(React) {
  return {
    contextTypes: {
      flux: React.PropTypes.object
    },

    getFlux: function() {
      return this.context.flux;
    }
  };
};

FluxChildMixin.componentWillMount = function() {
  throw new Error("Fluxbox.FluxChildMixin is a function that takes React as a " +
    "parameter and returns the mixin, e.g.: mixins[Fluxbox.FluxChildMixin(React)]");
};

module.exports = FluxChildMixin;
