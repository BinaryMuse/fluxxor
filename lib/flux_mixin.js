var FluxMixin = function(React) {
  return {
    propTypes: {
      flux: React.PropTypes.object.isRequired
    },

    childContextTypes: {
      flux: React.PropTypes.object
    },

    getChildContext: function() {
      return {
        flux: this.props.flux
      };
    },

    getFlux: function() {
      return this.props.flux;
    }
  };
};

FluxMixin.componentWillMount = function() {
  throw new Error("Fluxxor.FluxMixin is a function that takes React as a " +
    "parameter and returns the mixin, e.g.: mixins[Fluxxor.FluxMixin(React)]");
};

module.exports = FluxMixin;
