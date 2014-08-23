var FluxChildMixin = function(React) {
  return {
    componentWillMount: function() {
      if (console && console.warn) {
        console.warn("Fluxxor.FluxChildMixin is deprecated. " +
            "Use Fluxxor.FluxMixin in parents as well as children.");
      }
    },

    contextTypes: {
      flux: React.PropTypes.object
    },

    getFlux: function() {
      return this.context.flux;
    }
  };
};

FluxChildMixin.componentWillMount = function() {
  throw new Error("Fluxxor.FluxChildMixin is a function that takes React as a " +
    "parameter and returns the mixin, e.g.: mixins[Fluxxor.FluxChildMixin(React)]");
};

module.exports = FluxChildMixin;
