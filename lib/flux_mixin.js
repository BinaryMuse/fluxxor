var FluxMixin = function(React) {
  return {
    componentWillMount: function() {
      if (!this.props.flux && (!this.context || !this.context.flux)) {
        var namePart = this.constructor.displayName ? " of " + this.constructor.displayName : "";
        throw new Error("Could not find flux on this.props or this.context" + namePart);
      }
    },

    childContextTypes: {
      flux: React.PropTypes.object
    },

    contextTypes: {
      flux: React.PropTypes.object
    },

    getChildContext: function() {
      return {
        flux: this.getFlux()
      };
    },

    getFlux: function() {
      return this.props.flux || (this.context && this.context.flux);
    }
  };
};

FluxMixin.componentWillMount = function() {
  throw new Error("Fluxxor.FluxMixin is a function that takes React as a " +
    "parameter and returns the mixin, e.g.: mixins: [Fluxxor.FluxMixin(React)]");
};

module.exports = FluxMixin;
