module.exports = function(React) {
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
