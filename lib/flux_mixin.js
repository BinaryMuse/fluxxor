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
    }
  };
};

FluxMixin.componentWillMount = function() {
  throw new Error("Fluxbox.FluxMixin is a function that takes React as a " +
    "parameter and returns the mixin, e.g.: mixins[Fluxbox.FluxMixin(React)]");
};

module.exports = FluxMixin;
