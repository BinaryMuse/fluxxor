var React = require("react");

module.exports = {
  propTypes: {
    flux: React.PropTypes.object
  },

  childContextTypes: {
    flux: React.PropTypes.object
  },

  contextTypes: {
    flux: React.PropTypes.object
  },

  getChildContext: function() {
    return {
      flux: this.context.flux || this.props.flux
    };
  }
};
